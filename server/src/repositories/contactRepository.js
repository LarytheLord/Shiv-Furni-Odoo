const db = require('../config/db');

exports.findAll = async () => {
  const { rows } = await db.query('SELECT * FROM contacts ORDER BY id ASC');
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM contacts WHERE id = $1', [id]);
  return rows[0];
};

exports.create = async (contact) => {
  const { name, type, email, phone, portal_access, user_id } = contact;
  const { rows } = await db.query(
    `INSERT INTO contacts (name, type, email, phone, portal_access, user_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, type, email, phone, portal_access || false, user_id || null]
  );
  return rows[0];
};

exports.update = async (id, contact) => {
  const { name, type, email, phone, portal_access, user_id } = contact;
  const { rows } = await db.query(
    `UPDATE contacts 
     SET name = $1, type = $2, email = $3, phone = $4, portal_access = $5, user_id = $6
     WHERE id = $7 RETURNING *`,
    [name, type, email, phone, portal_access, user_id, id]
  );
  return rows[0];
};

exports.delete = async (id) => {
  await db.query('DELETE FROM contacts WHERE id = $1', [id]);
};
