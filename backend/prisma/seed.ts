import { PrismaClient, UserRole, ContactType, ApplyOn, BudgetStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.$executeRaw`TRUNCATE TABLE "invoice_payments" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "customer_invoice_lines" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "customer_invoices" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "sales_order_lines" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "sales_orders" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "bill_payments" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "vendor_bill_lines" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "vendor_bills" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "purchase_order_lines" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "purchase_orders" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "budget_alerts" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "budget_revisions" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "budget_lines" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "budgets" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "auto_analytical_rules" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "analytical_accounts" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "products" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "product_categories" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "contacts" CASCADE`;

    // Create Admin User
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@shivfurniture.com',
            password: adminPassword,
            name: 'Shiv Admin',
            role: UserRole.ADMIN
        }
    });
    console.log('✅ Created admin user');

    // Create Contacts (Vendors & Customers)
    const vendors = await Promise.all([
        prisma.contact.create({
            data: {
                name: 'Royal Wood Suppliers',
                email: 'orders@royalwood.in',
                phone: '+91 98765 11111',
                street: '45 Timber Market',
                city: 'Jodhpur',
                state: 'Rajasthan',
                pincode: '342001',
                type: ContactType.VENDOR
            }
        }),
        prisma.contact.create({
            data: {
                name: 'Modern Fabric House',
                email: 'sales@modernfabric.com',
                phone: '+91 98765 22222',
                street: '123 Textile Hub',
                city: 'Jaipur',
                state: 'Rajasthan',
                pincode: '302001',
                type: ContactType.VENDOR
            }
        }),
        prisma.contact.create({
            data: {
                name: 'Steel & Metal Works',
                email: 'info@steelworks.in',
                phone: '+91 98765 33333',
                street: '78 Industrial Estate',
                city: 'Bhilwara',
                state: 'Rajasthan',
                pincode: '311001',
                type: ContactType.VENDOR
            }
        })
    ]);

    const customers = await Promise.all([
        prisma.contact.create({
            data: {
                name: 'Grand Hotel Jaipur',
                email: 'purchase@grandhoteljaipur.com',
                phone: '+91 98765 44444',
                street: '1 Royal Heritage Lane',
                city: 'Jaipur',
                state: 'Rajasthan',
                pincode: '302001',
                type: ContactType.CUSTOMER
            }
        }),
        prisma.contact.create({
            data: {
                name: 'Urban Living Interiors',
                email: 'orders@urbanliving.in',
                phone: '+91 98765 55555',
                street: '56 Design District',
                city: 'Delhi',
                state: 'Delhi',
                pincode: '110001',
                type: ContactType.CUSTOMER
            }
        }),
        prisma.contact.create({
            data: {
                name: 'Comfort Home Furnishing',
                email: 'buy@comforthome.com',
                phone: '+91 98765 66666',
                street: '234 Furniture Lane',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                type: ContactType.CUSTOMER
            }
        })
    ]);
    console.log('✅ Created contacts');

    // Create Product Categories
    const categories = await Promise.all([
        prisma.productCategory.create({ data: { name: 'Living Room', code: 'LR' } }),
        prisma.productCategory.create({ data: { name: 'Bedroom', code: 'BR' } }),
        prisma.productCategory.create({ data: { name: 'Dining', code: 'DN' } }),
        prisma.productCategory.create({ data: { name: 'Office', code: 'OF' } }),
        prisma.productCategory.create({ data: { name: 'Raw Materials', code: 'RM' } })
    ]);
    console.log('✅ Created product categories');

    // Create Products
    const products = await Promise.all([
        prisma.product.create({ data: { code: 'SOF001', name: 'Royal Teak Sofa Set', categoryId: categories[0].id, costPrice: 45000, salePrice: 75000, taxRate: 18, unit: 'SET' } }),
        prisma.product.create({ data: { code: 'SOF002', name: 'Modern L-Shape Sofa', categoryId: categories[0].id, costPrice: 35000, salePrice: 55000, taxRate: 18, unit: 'SET' } }),
        prisma.product.create({ data: { code: 'BED001', name: 'King Size Bed Frame', categoryId: categories[1].id, costPrice: 25000, salePrice: 42000, taxRate: 18, unit: 'PCS' } }),
        prisma.product.create({ data: { code: 'BED002', name: 'Queen Size Bed with Storage', categoryId: categories[1].id, costPrice: 22000, salePrice: 38000, taxRate: 18, unit: 'PCS' } }),
        prisma.product.create({ data: { code: 'DIN001', name: '6-Seater Dining Table', categoryId: categories[2].id, costPrice: 18000, salePrice: 32000, taxRate: 18, unit: 'SET' } }),
        prisma.product.create({ data: { code: 'DIN002', name: 'Dining Chair Set (4)', categoryId: categories[2].id, costPrice: 8000, salePrice: 14000, taxRate: 18, unit: 'SET' } }),
        prisma.product.create({ data: { code: 'OFF001', name: 'Executive Office Desk', categoryId: categories[3].id, costPrice: 15000, salePrice: 28000, taxRate: 18, unit: 'PCS' } }),
        prisma.product.create({ data: { code: 'OFF002', name: 'Conference Table (10-seater)', categoryId: categories[3].id, costPrice: 35000, salePrice: 65000, taxRate: 18, unit: 'PCS' } }),
        prisma.product.create({ data: { code: 'RAW001', name: 'Teak Wood Planks', categoryId: categories[4].id, costPrice: 2500, salePrice: 0, taxRate: 5, unit: 'CFT' } }),
        prisma.product.create({ data: { code: 'RAW002', name: 'Premium Fabric Roll', categoryId: categories[4].id, costPrice: 1200, salePrice: 0, taxRate: 5, unit: 'MTR' } })
    ]);
    console.log('✅ Created products');

    // Create Analytical Accounts (Cost Centers)
    const analyticalAccounts = await Promise.all([
        prisma.analyticalAccount.create({ data: { code: 'CC001', name: 'Production', description: 'Manufacturing and production costs' } }),
        prisma.analyticalAccount.create({ data: { code: 'CC002', name: 'Raw Materials', description: 'Raw material procurement' } }),
        prisma.analyticalAccount.create({ data: { code: 'CC003', name: 'Labor', description: 'Direct labor costs' } }),
        prisma.analyticalAccount.create({ data: { code: 'CC004', name: 'Overhead', description: 'Factory overhead expenses' } }),
        prisma.analyticalAccount.create({ data: { code: 'CC005', name: 'Marketing', description: 'Sales and marketing expenses' } }),
        prisma.analyticalAccount.create({ data: { code: 'CC006', name: 'Administration', description: 'General admin expenses' } }),
        prisma.analyticalAccount.create({ data: { code: 'CC007', name: 'Logistics', description: 'Transportation and delivery' } })
    ]);
    console.log('✅ Created analytical accounts');

    // Create Auto-Analytical Rules
    await Promise.all([
        prisma.autoAnalyticalRule.create({
            data: {
                name: 'Raw Materials to CC002',
                sequence: 10,
                productCategoryId: categories[4].id,
                applyOn: ApplyOn.PURCHASE,
                analyticalAccountId: analyticalAccounts[1].id
            }
        }),
        prisma.autoAnalyticalRule.create({
            data: {
                name: 'High Value Purchases to Production',
                sequence: 20,
                useAmountFilter: true,
                amountMin: 50000,
                applyOn: ApplyOn.PURCHASE,
                analyticalAccountId: analyticalAccounts[0].id
            }
        }),
        prisma.autoAnalyticalRule.create({
            data: {
                name: 'Living Room Sales to Marketing',
                sequence: 30,
                productCategoryId: categories[0].id,
                applyOn: ApplyOn.SALE,
                analyticalAccountId: analyticalAccounts[4].id
            }
        })
    ]);
    console.log('✅ Created auto-analytical rules');

    // Create Budget for current financial year
    const currentYear = new Date().getFullYear();
    const fyStart = new Date(`${currentYear}-04-01`);
    const fyEnd = new Date(`${currentYear + 1}-03-31`);

    const budget = await prisma.budget.create({
        data: {
            name: `FY ${currentYear}-${currentYear + 1} Annual Budget`,
            dateFrom: fyStart,
            dateTo: fyEnd,
            description: 'Annual budget for Shiv Furniture operations',
            status: BudgetStatus.CONFIRMED,
            createdById: admin.id,
            budgetLines: {
                create: [
                    { analyticalAccountId: analyticalAccounts[0].id, plannedAmount: 500000, originalPlannedAmount: 500000 },
                    { analyticalAccountId: analyticalAccounts[1].id, plannedAmount: 800000, originalPlannedAmount: 800000 },
                    { analyticalAccountId: analyticalAccounts[2].id, plannedAmount: 300000, originalPlannedAmount: 300000 },
                    { analyticalAccountId: analyticalAccounts[3].id, plannedAmount: 150000, originalPlannedAmount: 150000 },
                    { analyticalAccountId: analyticalAccounts[4].id, plannedAmount: 200000, originalPlannedAmount: 200000 },
                    { analyticalAccountId: analyticalAccounts[5].id, plannedAmount: 100000, originalPlannedAmount: 100000 },
                    { analyticalAccountId: analyticalAccounts[6].id, plannedAmount: 120000, originalPlannedAmount: 120000 }
                ]
            }
        }
    });
    console.log('✅ Created budget with lines');

    // Create Portal User linked to customer
    const portalPassword = await bcrypt.hash('Portal@123', 12);
    await prisma.user.create({
        data: {
            email: 'portal@grandhotel.com',
            password: portalPassword,
            name: 'Grand Hotel Portal',
            role: UserRole.PORTAL_USER,
            contactId: customers[0].id
        }
    });
    console.log('✅ Created portal user');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@shivfurniture.com / Admin@123');
    console.log('   Portal: portal@grandhotel.com / Portal@123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
