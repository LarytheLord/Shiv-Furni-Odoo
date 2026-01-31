const db = require('../config/db');

exports.findAll = async () => {
    const query = `
        SELECT po.*, c.name as vendor_name
        FROM purchase_orders po
        JOIN contacts c ON po.vendor_id = c.id
        ORDER BY po.order_date DESC
    `;
    const { rows } = await db.query(query);
    return rows;
};

exports.findById = async (id) => {
    const query = `
        SELECT po.*, c.name as vendor_name
        FROM purchase_orders po
        JOIN contacts c ON po.vendor_id = c.id
        WHERE po.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.findLinesByOrderId = async (orderId) => {
    const query = `
        SELECT l.*, p.name as product_name, aa.name as analytical_account_name
        FROM purchase_order_lines l
        JOIN products p ON l.product_id = p.id
        LEFT JOIN analytical_accounts aa ON l.analytical_account_id = aa.id
        WHERE l.order_id = $1
    `;
    const { rows } = await db.query(query, [orderId]);
    return rows;
};

exports.create = async (order) => {
    const { vendor_id, order_date, total_amount } = order;
    const { rows } = await db.query(
        `INSERT INTO purchase_orders (vendor_id, order_date, state, total_amount)
         VALUES ($1, $2, 'draft', $3) RETURNING *`,
        [vendor_id, order_date || new Date(), total_amount || 0]
    );
    return rows[0];
};

exports.createLine = async (line) => {
    const { order_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id } = line;
    const { rows } = await db.query(
        `INSERT INTO purchase_order_lines (order_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [order_id, product_id, description, quantity, unit_price, tax_amount, subtotal, analytical_account_id]
    );
    return rows[0];
};

exports.updateState = async (id, state) => {
    const { rows } = await db.query(
        'UPDATE purchase_orders SET state = $1 WHERE id = $2 RETURNING *',
        [state, id]
    );
    return rows[0];
};
