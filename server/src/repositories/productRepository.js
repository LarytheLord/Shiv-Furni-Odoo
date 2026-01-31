const db = require('../config/db');

exports.findAll = async () => {
  const { rows } = await db.query('SELECT * FROM products ORDER BY id ASC');
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [id]);
  return rows[0];
};

exports.create = async (product) => {
  const { name, category, cost_price, selling_price, tax_percentage } = product;
  const { rows } = await db.query(
    `INSERT INTO products (name, category, cost_price, selling_price, tax_percentage)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, category, cost_price || 0, selling_price || 0, tax_percentage || 0]
  );
  return rows[0];
};

exports.update = async (id, product) => {
  const { name, category, cost_price, selling_price, tax_percentage } = product;
  const { rows } = await db.query(
    `UPDATE products 
     SET name = $1, category = $2, cost_price = $3, selling_price = $4, tax_percentage = $5
     WHERE id = $6 RETURNING *`,
    [name, category, cost_price, selling_price, tax_percentage, id]
  );
  return rows[0];
};

exports.delete = async (id) => {
  await db.query('DELETE FROM products WHERE id = $1', [id]);
};
