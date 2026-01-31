import prisma from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Exporting data for ML training...');

    // Fetch Bill Lines
    const billLines = await prisma.vendorBillLine.findMany({
        where: { analyticalAccountId: { not: null } },
        include: {
            product: { include: { category: true } },
            vendorBill: { include: { vendor: true } },
            analyticalAccount: true
        }
    });

    // Fetch Invoice Lines
    const invoiceLines = await prisma.customerInvoiceLine.findMany({
        where: { analyticalAccountId: { not: null } },
        include: {
            product: { include: { category: true } },
            customerInvoice: { include: { customer: true } },
            analyticalAccount: true
        }
    });

    const data = [
        ...billLines.map(l => ({
            type: 'PURCHASE',
            description: l.description || l.product.name,
            amount: Number(l.total),
            partner: l.vendorBill.vendor.name,
            product: l.product.name,
            category: l.product.category?.name,
            account: l.analyticalAccount?.name,
            accountId: l.analyticalAccountId
        })),
        ...invoiceLines.map(l => ({
            type: 'SALE',
            description: l.description || l.product.name,
            amount: Number(l.total),
            partner: l.customerInvoice.customer.name,
            product: l.product.name,
            category: l.product.category?.name,
            account: l.analyticalAccount?.name,
            accountId: l.analyticalAccountId
        }))
    ];

    const outputPath = path.join(__dirname, '..', 'training_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Exported ${data.length} records to ${outputPath}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
