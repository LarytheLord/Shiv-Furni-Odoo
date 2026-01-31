const purchaseRepository = require('../repositories/purchaseRepository');
const billRepository = require('../repositories/billRepository');
const autoAnalyticalService = require('./autoAnalyticalService');
const productService = require('./productService');

// === Purchase Orders ===

exports.getAllPurchaseOrders = async () => {
    return await purchaseRepository.findAll();
};

exports.getPurchaseOrderById = async (id) => {
    const po = await purchaseRepository.findById(id);
    if (!po) throw new Error('Purchase Order not found');
    const lines = await purchaseRepository.findLinesByOrderId(id);
    return { ...po, lines };
};

exports.createPurchaseOrder = async (data) => {
    const { vendor_id, order_date, lines } = data;
    
    // Calculate total
    let total_amount = 0;
    const processedLines = [];
    
    for (const line of lines) {
        const product = await productService.getProductById(line.product_id);
        const subtotal = line.quantity * line.unit_price; // tax handling simplified
        total_amount += subtotal; // add tax if needed
        
        // Auto Analytical
        let analytical_account_id = line.analytical_account_id;
        if (!analytical_account_id) {
            analytical_account_id = await autoAnalyticalService.matchAnalyticalAccount({
                ...product
            });
        }
        
        processedLines.push({ ...line, subtotal, analytical_account_id });
    }

    const po = await purchaseRepository.create({ vendor_id, order_date, total_amount });
    
    for (const line of processedLines) {
        await purchaseRepository.createLine({ ...line, order_id: po.id });
    }
    
    return exports.getPurchaseOrderById(po.id);
};

exports.confirmPurchaseOrder = async (id) => {
    return await purchaseRepository.updateState(id, 'confirmed');
};

// === Vendor Bills ===

exports.createBillFromPO = async (poId) => {
    const po = await exports.getPurchaseOrderById(poId);
    if (!po) throw new Error('PO not found');
    
    const bill = await billRepository.create({
        purchase_order_id: po.id,
        vendor_id: po.vendor_id,
        total_amount: po.total_amount
    });
    
    for (const line of po.lines) {
        await billRepository.createLine({
            bill_id: bill.id,
            product_id: line.product_id,
            description: line.description,
            quantity: line.quantity,
            unit_price: line.unit_price,
            tax_amount: line.tax_amount,
            subtotal: line.subtotal,
            analytical_account_id: line.analytical_account_id
        });
    }
    
    return exports.getBillById(bill.id);
};

exports.getAllBills = async () => {
    return await billRepository.findAll();
};

exports.getBillById = async (id) => {
    const bill = await billRepository.findById(id);
    if (!bill) throw new Error('Bill not found');
    const lines = await billRepository.findLinesByBillId(id);
    return { ...bill, lines };
};

exports.postBill = async (id) => {
    return await billRepository.updateState(id, 'posted');
};
