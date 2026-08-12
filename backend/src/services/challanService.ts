import { prisma } from '../config/prisma';
import { ChallanStatus } from '../types/enums';

export interface CreateChallanItemInput {
  productId: string;
  quantity: number;
}

export interface CreateChallanInput {
  customerId: string;
  items: CreateChallanItemInput[];
  status?: ChallanStatus; // Draft or Confirmed
}

export class ChallanService {
  private static generateChallanNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `CHN-${dateStr}-${randomSuffix}`;
  }

  static async create(input: CreateChallanInput, createdByUserId: string) {
    const { customerId, items, status = ChallanStatus.Draft } = input;

    if (!items || items.length === 0) {
      throw new Error('Challan must contain at least one product item.');
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new Error('Customer not found.');
    }

    // Fetch products to build snapshots & validate initial availability
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new Error('One or more selected products could not be found.');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;

    const challanItemData = items.map((item) => {
      const product = productMap.get(item.productId)!;
      if (item.quantity <= 0) {
        throw new Error(`Quantity for product '${product.productName}' must be greater than zero.`);
      }

      const subtotal = product.unitPrice * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += subtotal;

      return {
        productId: product.id,
        productName: product.productName,
        sku: product.SKU,
        unitPrice: product.unitPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    const challanNumber = this.generateChallanNumber();

    return await prisma.$transaction(async (tx) => {
      // If directly created as CONFIRMED, check stock & deduct stock atomically
      if (status === ChallanStatus.Confirmed) {
        for (const item of items) {
          const product = productMap.get(item.productId)!;
          if (product.currentStock < item.quantity) {
            throw new Error(
              `Insufficient stock for '${product.productName}' (SKU: ${product.SKU}). Current stock: ${product.currentStock}, Requested: ${item.quantity}`
            );
          }
        }

        // Deduct stock & create OUT stock movement logs
        for (const item of items) {
          const product = productMap.get(item.productId)!;
          const newStock = product.currentStock - item.quantity;

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: newStock },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantityChanged: item.quantity,
              movementType: 'OUT',
              reason: `Sales Challan #${challanNumber}`,
              createdBy: createdByUserId,
            },
          });
        }
      }

      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          totalAmount,
          status,
          createdBy: createdByUserId,
          items: {
            create: challanItemData,
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              customerName: true,
              businessName: true,
              mobileNumber: true,
              email: true,
            },
          },
          items: true,
          user: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return challan;
    });
  }

  static async getAll(query: {
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      where.OR = [
        { challanNumber: { contains: searchTerm } },
        { customer: { customerName: { contains: searchTerm } } },
        { customer: { businessName: { contains: searchTerm } } },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdDate: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              customerName: true,
              businessName: true,
              mobileNumber: true,
            },
          },
          items: true,
          user: {
            select: { id: true, name: true, role: true },
          },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    return {
      challans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });

    if (!challan) {
      throw new Error('Challan not found.');
    }

    return challan;
  }

  static async updateStatus(id: string, newStatus: ChallanStatus, updatedByUserId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      throw new Error('Challan not found.');
    }

    if (challan.status === newStatus) {
      return challan;
    }

    if (challan.status === ChallanStatus.Confirmed && newStatus === ChallanStatus.Draft) {
      throw new Error('Cannot revert a Confirmed challan back to Draft.');
    }

    return await prisma.$transaction(async (tx) => {
      // Transitioning from Draft to Confirmed
      if (challan.status === ChallanStatus.Draft && newStatus === ChallanStatus.Confirmed) {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            throw new Error(`Product '${item.productName}' no longer exists.`);
          }

          if (product.currentStock < item.quantity) {
            throw new Error(
              `Insufficient stock for '${product.productName}' (SKU: ${product.SKU}). Current stock: ${product.currentStock}, Requested: ${item.quantity}`
            );
          }
        }

        // Deduct stock & log OUT stock movements
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const newStock = product.currentStock - item.quantity;
            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: newStock },
            });

            await tx.stockMovement.create({
              data: {
                productId: product.id,
                quantityChanged: item.quantity,
                movementType: 'OUT',
                reason: `Sales Challan #${challan.challanNumber}`,
                createdBy: updatedByUserId,
              },
            });
          }
        }
      }

      // Transitioning from Confirmed to Cancelled (Restores stock)
      if (challan.status === ChallanStatus.Confirmed && newStatus === ChallanStatus.Cancelled) {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const restoredStock = product.currentStock + item.quantity;
            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: restoredStock },
            });

            await tx.stockMovement.create({
              data: {
                productId: product.id,
                quantityChanged: item.quantity,
                movementType: 'IN',
                reason: `Cancelled Sales Challan #${challan.challanNumber} (Stock Restored)`,
                createdBy: updatedByUserId,
              },
            });
          }
        }
      }

      const updatedChallan = await tx.challan.update({
        where: { id },
        data: { status: newStatus },
        include: {
          customer: true,
          items: true,
          user: { select: { id: true, name: true, role: true } },
        },
      });

      return updatedChallan;
    });
  }
}
