const salesService = require('../services/salesService');

// Sales Orders
exports.getSalesOrders = async (req, res) => {
  try {
    const orders = await salesService.getAllSalesOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSalesOrder = async (req, res) => {
  try {
    const order = await salesService.getSalesOrderById(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createSalesOrder = async (req, res) => {
  try {
    const order = await salesService.createSalesOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.confirmSalesOrder = async (req, res) => {
    try {
        const order = await salesService.confirmSalesOrder(req.params.id);
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Invoices
exports.createInvoiceFromSO = async (req, res) => {
    try {
        const invoice = await salesService.createInvoiceFromSO(req.body.sales_order_id);
        res.status(201).json(invoice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await salesService.getAllInvoices();
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getInvoice = async (req, res) => {
    try {
        const invoice = await salesService.getInvoiceById(req.params.id);
        res.json(invoice);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

exports.postInvoice = async (req, res) => {
    try {
        const invoice = await salesService.postInvoice(req.params.id);
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
