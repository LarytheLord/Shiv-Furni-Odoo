const db = require('../config/db');

exports.findAll = async () => {
    const query = `
        SELECT i.*, c.name as customer_name
        FROM invoices i
        JOIN contacts c ON i.customer_id = c.id
        ORDER BY i.invoice_date DESC
    `;
    const { rows } = await db.query(query);
    return rows;
};

exports.findById = async (id) => {
    const query = `
        SELECT i.*, c.name as customer_name
        FROM invoices i
        JOIN contacts c ON i.customer_id = c.id
        WHERE i.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.findLinesByInvoiceId = async (invoiceId) => {
    const query = `
        SELECT l.*, p.name as product_name, aa.name as analytical_account_name
        FROM invoice_lines l
        JOIN products p ON l.product_id = p.id
        LEFT JOIN analytical_accounts aa ON l.analytical_account_id = aa.id
        WHERE l.invoice_id = $1
    `;
    const { rows } = await db.query(query, [invoiceId]);
    return rows;
};

exports.create = async (invoice) => {
    const { sales_order_id, customer_id, invoice_date, due_date, total_amount } = invoice;
    const { rows } = await db.query(
        `INSERT INTO invoices (sales_order_id, customer_id, invoice_date, due_date, state, total_amount, payment_status)
         VALUES ($1, $2, $3, $4, 'draft', $5, 'not_paid') RETURNING *`,
        [sales_order_id, customer_id, invoice_date || new Date(), due_date, total_amount || 0]
    );
    return rows[0];
};

exports.createLine = async (line) => {
    const { invoice_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id } = line;
    const { rows } = await db.query(
        `INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [invoice_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id]
    );
    return rows[0];
};

exports.updateState = async (id, state) => {
    const { rows } = await db.query(
        'UPDATE invoices SET state = $1 WHERE id = $2 RETURNING *',
        [state, id]
    );
    return rows[0];
};

exports.updatePaymentStatus = async (id, amount_paid, status) => {
    const { rows } = await db.query(
        'UPDATE invoices SET paid_amount = $1, payment_status = $2 WHERE id = $3 RETURNING *',
        [amount_paid, status, id]
    );
    return rows[0];
};
