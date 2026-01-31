const db = require('../config/db');

exports.findAll = async () => {
    const query = `
        SELECT p.*, c.name as partner_name
        FROM payments p
        JOIN contacts c ON p.partner_id = c.id
        ORDER BY p.payment_date DESC
    `;
    const { rows } = await db.query(query);
    return rows;
};

exports.findById = async (id) => {
    const query = `
        SELECT p.*, c.name as partner_name
        FROM payments p
        JOIN contacts c ON p.partner_id = c.id
        WHERE p.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

exports.create = async (payment) => {
    const { type, partner_id, amount, payment_date, reference, invoice_id, bill_id } = payment;
    const { rows } = await db.query(
        `INSERT INTO payments (type, partner_id, amount, payment_date, reference, invoice_id, bill_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [type, partner_id, amount, payment_date || new Date(), reference, invoice_id, bill_id]
    );
    return rows[0];
};
