import { prisma } from '../config/prisma';

export interface CreateProductInput {
  productName: string;
  SKU: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minimumStockAlert?: number;
  warehouseLocation: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export class ProductService {
  static async getAll(query: {
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      where.OR = [
        { productName: { contains: searchTerm } },
        { SKU: { contains: searchTerm } },
        { category: { contains: searchTerm } },
        { warehouseLocation: { contains: searchTerm } },
      ];
    }

    // Low stock filter logic is handled in-memory or raw Prisma query if requested
    let products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { productName: 'asc' },
    });

    if (query.lowStockOnly) {
      products = products.filter(p => p.currentStock <= p.minimumStockAlert);
    }

    const total = await prisma.product.count({ where });

    return {
      products,
      meta: {
        total: query.lowStockOnly ? products.length : total,
        page,
        limit,
        totalPages: Math.ceil((query.lowStockOnly ? products.length : total) / limit),
      },
    };
  }

  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { timestamp: 'desc' },
          take: 20,
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  static async create(data: CreateProductInput, createdByUserId: string) {
    const existingSKU = await prisma.product.findUnique({
      where: { SKU: data.SKU },
    });

    if (existingSKU) {
      throw new Error(`Product with SKU '${data.SKU}' already exists.`);
    }

    const initialStock = data.currentStock || 0;

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          productName: data.productName,
          SKU: data.SKU,
          category: data.category,
          unitPrice: Number(data.unitPrice),
          currentStock: initialStock,
          minimumStockAlert: Number(data.minimumStockAlert || 10),
          warehouseLocation: data.warehouseLocation,
        },
      });

      if (initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantityChanged: initialStock,
            movementType: 'IN',
            reason: 'Initial Product Stock Registration',
            createdBy: createdByUserId,
          },
        });
      }

      return product;
    });
  }

  static async update(id: string, data: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Product not found');
    }

    if (data.SKU && data.SKU !== existing.SKU) {
      const skuCheck = await prisma.product.findUnique({ where: { SKU: data.SKU } });
      if (skuCheck) {
        throw new Error(`SKU '${data.SKU}' is already in use.`);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        unitPrice: data.unitPrice !== undefined ? Number(data.unitPrice) : existing.unitPrice,
        minimumStockAlert: data.minimumStockAlert !== undefined ? Number(data.minimumStockAlert) : existing.minimumStockAlert,
      },
    });

    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Product not found');
    }

    await prisma.product.delete({ where: { id } });
    return { id };
  }
}
