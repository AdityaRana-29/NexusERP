import { prisma } from '../config/prisma';
import { CustomerType, CustomerStatus } from '../types/enums';

export interface CreateCustomerInput {
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType?: CustomerType;
  address: string;
  status?: CustomerStatus;
  followUpDate?: Date | string;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export class CustomerService {
  static async getAll(query: {
    search?: string;
    status?: CustomerStatus;
    customerType?: CustomerType;
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

    if (query.customerType) {
      where.customerType = query.customerType;
    }

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      where.OR = [
        { customerName: { contains: searchTerm } },
        { businessName: { contains: searchTerm } },
        { mobileNumber: { contains: searchTerm } },
        { email: { contains: searchTerm } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { challans: true, followUpNotes: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUpNotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        challans: {
          orderBy: { createdDate: 'desc' },
          take: 10,
          select: {
            id: true,
            challanNumber: true,
            totalQuantity: true,
            totalAmount: true,
            status: true,
            createdDate: true,
          },
        },
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  static async create(data: CreateCustomerInput) {
    const customer = await prisma.customer.create({
      data: {
        customerName: data.customerName,
        mobileNumber: data.mobileNumber,
        email: data.email,
        businessName: data.businessName,
        gstNumber: data.gstNumber,
        customerType: data.customerType || CustomerType.Retail,
        address: data.address,
        status: data.status || CustomerStatus.Lead,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        notes: data.notes,
      },
    });

    return customer;
  }

  static async update(id: string, data: UpdateCustomerInput) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Customer not found');
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : data.followUpDate === null ? null : existing.followUpDate,
      },
    });

    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Customer not found');
    }

    await prisma.customer.delete({ where: { id } });
    return { id };
  }

  static async addFollowUpNote(customerId: string, note: string, createdByUserId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new Error('Customer not found');
    }

    const followUpNote = await prisma.followUpNote.create({
      data: {
        customerId,
        note,
        createdBy: createdByUserId,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return followUpNote;
  }
}
