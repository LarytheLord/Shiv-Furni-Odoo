const db = require('../config/db');

exports.findAll = async () => {
    const query = `
        SELECT vb.*, c.name as vendor_name
        FROM vendor_bills vb
        JOIN contacts c ON vb.vendor_id = c.id
        ORDER BY vb.bill_date DESC
    `;
    const { rows } = await db.query(query);
    return rows;
};

exports.findById = async (id) => {
    const query = `
        SELECT vb.*, c.name as vendor_name
        FROM vendor_bills vb
        JOIN contacts c ON vb.vendor_id = c.id
        WHERE vb.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.findLinesByBillId = async (billId) => {
    const query = `
        SELECT l.*, p.name as product_name, aa.name as analytical_account_name
        FROM vendor_bill_lines l
        JOIN products p ON l.product_id = p.id
        LEFT JOIN analytical_accounts aa ON l.analytical_account_id = aa.id
        WHERE l.bill_id = $1
    `;
    const { rows } = await db.query(query, [billId]);
    return rows;
};

exports.create = async (bill) => {
    const { purchase_order_id, vendor_id, bill_date, due_date, total_amount } = bill;
    const { rows } = await db.query(
        `INSERT INTO vendor_bills (purchase_order_id, vendor_id, bill_date, due_date, state, total_amount, payment_status)
         VALUES ($1, $2, $3, $4, 'draft', $5, 'not_paid') RETURNING *`,
        [purchase_order_id, vendor_id, bill_date || new Date(), due_date, total_amount || 0]
    );
    return rows[0];
};

exports.createLine = async (line) => {
    const { bill_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id } = line;
    const { rows } = await db.query(
        `INSERT INTO vendor_bill_lines (bill_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [bill_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id]
    );
    return rows[0];
};

exports.updateState = async (id, state) => {
    const { rows } = await db.query(
        'UPDATE vendor_bills SET state = $1 WHERE id = $2 RETURNING *',
        [state, id]
    );
    return rows[0];
};

exports.updatePaymentStatus = async (id, amount_paid, status) => {
    const { rows } = await db.query(
        'UPDATE vendor_bills SET paid_amount = $1, payment_status = $2 WHERE id = $3 RETURNING *',
        [amount_paid, status, id]
    );
    return rows[0];
};
