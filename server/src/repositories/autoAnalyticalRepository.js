const db = require('../config/db');

exports.findAll = async () => {
  const { rows } = await db.query('SELECT * FROM auto_analytical_rules ORDER BY priority ASC');
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM auto_analytical_rules WHERE id = $1', [id]);
  return rows[0];
};

exports.create = async (rule) => {
  const { priority, field_name, operator, value, analytical_account_id } = rule;
  const { rows } = await db.query(
    `INSERT INTO auto_analytical_rules (priority, field_name, operator, value, analytical_account_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [priority, field_name, operator, value, analytical_account_id]
  );
  return rows[0];
};

exports.update = async (id, rule) => {
  const { priority, field_name, operator, value, analytical_account_id } = rule;
  const { rows } = await db.query(
    `UPDATE auto_analytical_rules 
     SET priority = $1, field_name = $2, operator = $3, value = $4, analytical_account_id = $5
     WHERE id = $6 RETURNING *`,
    [priority, field_name, operator, value, analytical_account_id, id]
  );
  return rows[0];
};

exports.delete = async (id) => {
  await db.query('DELETE FROM auto_analytical_rules WHERE id = $1', [id]);
};
