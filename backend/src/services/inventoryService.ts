import { prisma } from '../config/prisma';
import { MovementType } from '../types/enums';

export interface RecordStockMovementInput {
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
}

export class InventoryService {
  static async getStockMovements(query: {
    productId?: string;
    movementType?: MovementType;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.movementType) {
      where.movementType = query.movementType;
    }

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      where.OR = [
        { reason: { contains: searchTerm } },
        { product: { productName: { contains: searchTerm } } },
        { product: { SKU: { contains: searchTerm } } },
      ];
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              productName: true,
              SKU: true,
              category: true,
              currentStock: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return {
      movements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async recordManualMovement(input: RecordStockMovementInput) {
    const { productId, quantityChanged, movementType, reason, createdBy } = input;

    if (quantityChanged <= 0) {
      throw new Error('Quantity changed must be greater than zero.');
    }

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new Error('Product not found.');
      }

      let newStock = product.currentStock;
      if (movementType === 'IN') {
        newStock += quantityChanged;
      } else {
        if (product.currentStock < quantityChanged) {
          throw new Error(`Insufficient stock for product '${product.productName}'. Current: ${product.currentStock}, Requested reduction: ${quantityChanged}`);
        }
        newStock -= quantityChanged;
      }

      await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantityChanged,
          movementType,
          reason,
          createdBy,
        },
        include: {
          product: true,
          user: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return movement;
    });
  }
}
