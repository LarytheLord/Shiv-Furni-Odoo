const purchaseService = require('../services/purchaseService');

// Purchase Orders
exports.getPurchaseOrders = async (req, res) => {
  try {
    const orders = await purchaseService.getAllPurchaseOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPurchaseOrder = async (req, res) => {
  try {
    const order = await purchaseService.getPurchaseOrderById(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const order = await purchaseService.createPurchaseOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.confirmPurchaseOrder = async (req, res) => {
    try {
        const order = await purchaseService.confirmPurchaseOrder(req.params.id);
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Vendor Bills
exports.createBillFromPO = async (req, res) => {
    try {
        const bill = await purchaseService.createBillFromPO(req.body.purchase_order_id);
        res.status(201).json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getBills = async (req, res) => {
    try {
        const bills = await purchaseService.getAllBills();
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getBill = async (req, res) => {
    try {
        const bill = await purchaseService.getBillById(req.params.id);
        res.json(bill);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

exports.postBill = async (req, res) => {
    try {
        const bill = await purchaseService.postBill(req.params.id);
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
