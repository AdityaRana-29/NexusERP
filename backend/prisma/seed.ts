import { PrismaClient } from '@prisma/client';
import { Role, CustomerType, CustomerStatus, ChallanStatus } from '../src/types/enums';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Roles & Users
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  const usersData = [
    {
      name: 'Super Admin',
      email: 'admin@erp.com',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
    },
    {
      name: 'Sarah Sales Manager',
      email: 'sales@erp.com',
      passwordHash: defaultPasswordHash,
      role: Role.SALES,
    },
    {
      name: 'Will Warehouse Head',
      email: 'warehouse@erp.com',
      passwordHash: defaultPasswordHash,
      role: Role.WAREHOUSE,
    },
    {
      name: 'Alex Accounts Lead',
      email: 'accounts@erp.com',
      passwordHash: defaultPasswordHash,
      role: Role.ACCOUNTS,
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const user of usersData) {
    const u = await prisma.user.upsert({
      where: { email: user.email },
      update: { passwordHash: user.passwordHash, role: user.role },
      create: user,
    });
    createdUsers[user.role] = u;
  }
  console.log('✅ Users seeded with credentials (password: Password123!)');

  // 2. Seed Customers
  const customersData = [
    {
      customerName: 'Acme Traders Ltd',
      mobileNumber: '+91 98765 43210',
      email: 'procurement@acmetraders.com',
      businessName: 'Acme Distribution Network',
      gstNumber: '27AAACA123411Z5',
      customerType: CustomerType.Distributor,
      address: 'Plot 42, Industrial Zone, Mumbai, MH',
      status: CustomerStatus.Active,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Key distributor for Western region. Prefers bulk deliveries on Mondays.',
    },
    {
      customerName: 'Apex Wholesale Mart',
      mobileNumber: '+91 98111 22334',
      email: 'orders@apexwholesale.in',
      businessName: 'Apex Enterprises',
      gstNumber: '07BBBCB567822Z9',
      customerType: CustomerType.Wholesale,
      address: 'Shop 104, Grain Market, Delhi, DL',
      status: CustomerStatus.Active,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Interested in seasonal discount offer on industrial fasteners.',
    },
    {
      customerName: 'Metro Retail Hardware',
      mobileNumber: '+91 99000 88776',
      email: 'contact@metrohardware.com',
      businessName: 'Metro Stores',
      gstNumber: '29CCCC1909033Z1',
      customerType: CustomerType.Retail,
      address: '12 Main Road, Indiranagar, Bengaluru, KA',
      status: CustomerStatus.Lead,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: 'New lead requested catalog and credit terms for initial stock.',
    },
  ];

  const createdCustomers = [];
  for (const cust of customersData) {
    const c = await prisma.customer.create({ data: cust });
    createdCustomers.push(c);
  }
  console.log(`✅ ${createdCustomers.length} Customers seeded.`);

  // 3. Seed Products
  const productsData = [
    {
      productName: 'Heavy Duty Steel Cable Ties 300mm',
      SKU: 'PRD-CBL-300',
      category: 'Electrical & Wiring',
      unitPrice: 25.50,
      currentStock: 500,
      minimumStockAlert: 100,
      warehouseLocation: 'Aisle 3, Shelf B2',
    },
    {
      productName: 'Industrial Safety Helmets - High Visibility',
      SKU: 'PRD-SAF-HLM',
      category: 'Safety Equipment',
      unitPrice: 450.00,
      currentStock: 120,
      minimumStockAlert: 30,
      warehouseLocation: 'Aisle 1, Rack C1',
    },
    {
      productName: 'Brass Ball Valve 1/2 Inch Threaded',
      SKU: 'PRD-PLM-VLV05',
      category: 'Plumbing & Valves',
      unitPrice: 180.00,
      currentStock: 8, // Low stock alert
      minimumStockAlert: 25,
      warehouseLocation: 'Aisle 4, Bin 12',
    },
    {
      productName: 'Stainless Steel Hex Screws M8x40 (Box of 100)',
      SKU: 'PRD-FST-M840',
      category: 'Fasteners & Hardware',
      unitPrice: 320.00,
      currentStock: 85,
      minimumStockAlert: 20,
      warehouseLocation: 'Aisle 2, Shelf A4',
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const p = await prisma.product.upsert({
      where: { SKU: prod.SKU },
      update: { ...prod },
      create: prod,
    });
    createdProducts.push(p);

    // Initial stock movement only if none exists for this product
    const existingMovement = await prisma.stockMovement.findFirst({
      where: { productId: p.id, reason: 'Opening Inventory Import' },
    });
    if (!existingMovement) {
      await prisma.stockMovement.create({
        data: {
          productId: p.id,
          quantityChanged: p.currentStock,
          movementType: 'IN',
          reason: 'Opening Inventory Import',
          createdBy: createdUsers[Role.WAREHOUSE].id,
        },
      });
    }
  }
  console.log(`✅ ${createdProducts.length} Products & initial stock movements seeded.`);

  // 4. Seed Initial Sales Challans
  const existingChallan = await prisma.challan.findUnique({
    where: { challanNumber: 'CHN-20260811-1001' },
  });

  if (!existingChallan) {
    const sampleChallan = await prisma.challan.create({
      data: {
        challanNumber: 'CHN-20260811-1001',
        customerId: createdCustomers[0].id,
        totalQuantity: 20,
        totalAmount: 510.00,
        status: ChallanStatus.Confirmed,
        createdBy: createdUsers[Role.SALES].id,
        items: {
          create: [
            {
              productId: createdProducts[0].id,
              productName: createdProducts[0].productName,
              sku: createdProducts[0].SKU,
              unitPrice: createdProducts[0].unitPrice,
              quantity: 20,
              subtotal: 510.00,
            },
          ],
        },
      },
    });

    // Create OUT movement for sample confirmed challan
    await prisma.stockMovement.create({
      data: {
        productId: createdProducts[0].id,
        quantityChanged: 20,
        movementType: 'OUT',
        reason: `Sales Challan #${sampleChallan.challanNumber}`,
        createdBy: createdUsers[Role.SALES].id,
      },
    });
  }

  console.log('✅ Initial Sales Challans & Stock logs seeded.');
  console.log('🎉 Seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
