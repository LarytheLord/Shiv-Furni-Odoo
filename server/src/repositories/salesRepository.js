const db = require('../config/db');

exports.findAll = async () => {
    const query = `
        SELECT so.*, c.name as customer_name
        FROM sales_orders so
        JOIN contacts c ON so.customer_id = c.id
        ORDER BY so.order_date DESC
    `;
    const { rows } = await db.query(query);
    return rows;
};

exports.findById = async (id) => {
    const query = `
        SELECT so.*, c.name as customer_name
        FROM sales_orders so
        JOIN contacts c ON so.customer_id = c.id
        WHERE so.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.findLinesByOrderId = async (orderId) => {
    const query = `
        SELECT l.*, p.name as product_name, aa.name as analytical_account_name
        FROM sales_order_lines l
        JOIN products p ON l.product_id = p.id
        LEFT JOIN analytical_accounts aa ON l.analytical_account_id = aa.id
        WHERE l.order_id = $1
    `;
    const { rows } = await db.query(query, [orderId]);
    return rows;
};

exports.create = async (order) => {
    const { customer_id, order_date, total_amount } = order;
    const { rows } = await db.query(
        `INSERT INTO sales_orders (customer_id, order_date, state, total_amount)
         VALUES ($1, $2, 'draft', $3) RETURNING *`,
        [customer_id, order_date || new Date(), total_amount || 0]
    );
    return rows[0];
};

exports.createLine = async (line) => {
    const { order_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id } = line;
    const { rows } = await db.query(
        `INSERT INTO sales_order_lines (order_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [order_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id]
    );
    return rows[0];
};

exports.updateState = async (id, state) => {
    const { rows } = await db.query(
        'UPDATE sales_orders SET state = $1 WHERE id = $2 RETURNING *',
        [state, id]
    );
    return rows[0];
};
