const salesRepository = require('../repositories/salesRepository');
const invoiceRepository = require('../repositories/invoiceRepository');
const autoAnalyticalService = require('./autoAnalyticalService');
const productService = require('./productService');

// === Sales Orders ===

exports.getAllSalesOrders = async () => {
    return await salesRepository.findAll();
};

exports.getSalesOrderById = async (id) => {
    const so = await salesRepository.findById(id);
    if (!so) throw new Error('Sales Order not found');
    const lines = await salesRepository.findLinesByOrderId(id);
    return { ...so, lines };
};

exports.createSalesOrder = async (data) => {
    const { customer_id, order_date, lines } = data;
    
    // Calculate total
    let total_amount = 0;
    const processedLines = [];
    
    for (const line of lines) {
        const product = await productService.getProductById(line.product_id);
        const subtotal = line.quantity * line.unit_price; 
        total_amount += subtotal; 
        
        // Auto Analytical
        let analytical_account_id = line.analytical_account_id;
        if (!analytical_account_id) {
            analytical_account_id = await autoAnalyticalService.matchAnalyticalAccount({
                ...product
            });
        }
        
        processedLines.push({ ...line, subtotal, analytical_account_id });
    }

    const so = await salesRepository.create({ customer_id, order_date, total_amount });
    
    for (const line of processedLines) {
        await salesRepository.createLine({ ...line, order_id: so.id });
    }
    
    return exports.getSalesOrderById(so.id);
};

exports.confirmSalesOrder = async (id) => {
    return await salesRepository.updateState(id, 'confirmed');
};

// === Invoices ===

exports.createInvoiceFromSO = async (soId) => {
    const so = await exports.getSalesOrderById(soId);
    if (!so) throw new Error('SO not found');
    
    const invoice = await invoiceRepository.create({
        sales_order_id: so.id,
        customer_id: so.customer_id,
        total_amount: so.total_amount
    });
    
    for (const line of so.lines) {
        await invoiceRepository.createLine({
            invoice_id: invoice.id,
            product_id: line.product_id,
            description: line.description,
            quantity: line.quantity,
            unit_price: line.unit_price,
            tax_amount: line.tax_amount,
            subtotal: line.subtotal,
            analytical_account_id: line.analytical_account_id
        });
    }
    
    return exports.getInvoiceById(invoice.id);
};

exports.getAllInvoices = async () => {
    return await invoiceRepository.findAll();
};

exports.getInvoiceById = async (id) => {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) throw new Error('Invoice not found');
    const lines = await invoiceRepository.findLinesByInvoiceId(id);
    return { ...invoice, lines };
};

exports.postInvoice = async (id) => {
    return await invoiceRepository.updateState(id, 'posted');
};
