const db = require('../config/db');

exports.findAll = async () => {
  const { rows } = await db.query('SELECT * FROM analytical_accounts ORDER BY id ASC');
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM analytical_accounts WHERE id = $1', [id]);
  return rows[0];
};

exports.create = async (account) => {
  const { name, code, description, active } = account;
  const { rows } = await db.query(
    `INSERT INTO analytical_accounts (name, code, description, active)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, code, description, active !== undefined ? active : true]
  );
  return rows[0];
};

exports.update = async (id, account) => {
  const { name, code, description, active } = account;
  const { rows } = await db.query(
    `UPDATE analytical_accounts 
     SET name = $1, code = $2, description = $3, active = $4
     WHERE id = $5 RETURNING *`,
    [name, code, description, active, id]
  );
  return rows[0];
};

exports.delete = async (id) => {
  await db.query('DELETE FROM analytical_accounts WHERE id = $1', [id]);
};
