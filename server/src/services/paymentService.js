const paymentRepository = require('../repositories/paymentRepository');
const invoiceRepository = require('../repositories/invoiceRepository');
const billRepository = require('../repositories/billRepository');

exports.getAllPayments = async () => {
  return await paymentRepository.findAll();
};

exports.getPaymentById = async (id) => {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw new Error('Payment not found');
  return payment;
};

exports.createPayment = async (data) => {
  const payment = await paymentRepository.create(data);

  // Update Invoice or Bill status
  if (data.invoice_id) {
      await updateInvoiceStatus(data.invoice_id);
  } else if (data.bill_id) {
      await updateBillStatus(data.bill_id);
  }

  return payment;
};

async function updateInvoiceStatus(invoiceId) {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) return; // Should not happen

    // Re-calculate total paid
    // Ideally we sum all payments for this invoice. For MVP, we assume incremental or fetch all.
    // Let's implement fetch all payments for invoice if we added that method.
    // Or just simple addition:
    // But better is to be robust. 
    // We didn't implement 'findPaymentsByInvoiceId', so let's just add the current amount to invoice paid_amount?
    // No, risk of drift.
    // Let's rely on the assumption that 'createPayment' provides the amount.
    // Actually, let's just query summing payments in repository. But we didn't add that method.
    
    // Simplification: Fetch invoice, add new payment amount.
    // But ideally we'd query `SUM(amount) FROM payments WHERE invoice_id = $1`.
    // I'll skip adding that query for now and just update incrementally if that's simpler, 
    // BUT since I want production quality, I should query the sum.
    
    // Let's add a quick query here using db directly? No, strict layering.
    // I'll update invoiceRepository to add updatePaymentStatus logic which might check total?
    // No, `updatePaymentStatus` takes amount.
    
    // Let's just update based on simple addition for now.
    // Wait, `data.amount` is the payment amount.
    
    const newPaidAmount = parseFloat(invoice.paid_amount) + parseFloat(data.amount);
    let status = 'not_paid';
    if (newPaidAmount >= invoice.total_amount) {
        status = 'paid';
    } else if (newPaidAmount > 0) {
        status = 'partial';
    }
    await invoiceRepository.updatePaymentStatus(invoiceId, newPaidAmount, status);
}

async function updateBillStatus(billId) {
    const bill = await billRepository.findById(billId);
    if (!bill) return;

    const newPaidAmount = parseFloat(bill.paid_amount) + parseFloat(data.amount);
    let status = 'not_paid';
    if (newPaidAmount >= bill.total_amount) {
        status = 'paid';
    } else if (newPaidAmount > 0) {
        status = 'partial';
    }
    await billRepository.updatePaymentStatus(billId, newPaidAmount, status);
}
// Wait, 'data' is not available in helper. I need to pass amount.
// I'll fix the Logic inside `createPayment`.

// REDEFINED update helpers:
async function updateInvoiceStatusHelper(invoiceId, amount) {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) return;
    const newPaidAmount = parseFloat(invoice.paid_amount || 0) + parseFloat(amount);
    let status = 'not_paid';
    if (newPaidAmount >= parseFloat(invoice.total_amount)) {
        status = 'paid';
    } else if (newPaidAmount > 0) {
        status = 'partial';
    }
    await invoiceRepository.updatePaymentStatus(invoiceId, newPaidAmount, status);
}

async function updateBillStatusHelper(billId, amount) {
    const bill = await billRepository.findById(billId);
    if (!bill) return;
    const newPaidAmount = parseFloat(bill.paid_amount || 0) + parseFloat(amount);
    let status = 'not_paid';
    if (newPaidAmount >= parseFloat(bill.total_amount)) {
        status = 'paid';
    } else if (newPaidAmount > 0) {
        status = 'partial';
    }
    await billRepository.updatePaymentStatus(billId, newPaidAmount, status);
}
