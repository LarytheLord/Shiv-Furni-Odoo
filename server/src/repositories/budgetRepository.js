const db = require('../config/db');

exports.findAll = async () => {
    const query = `
        SELECT b.*, a.name as analytical_account_name 
        FROM budgets b
        JOIN analytical_accounts a ON b.analytical_account_id = a.id
        ORDER BY b.start_date DESC
    `;
  const { rows } = await db.query(query);
  return rows;
};

exports.findById = async (id) => {
    const query = `
        SELECT b.*, a.name as analytical_account_name 
        FROM budgets b
        JOIN analytical_accounts a ON b.analytical_account_id = a.id
        WHERE b.id = $1
    `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

exports.create = async (budget) => {
  const { analytical_account_id, amount, start_date, end_date } = budget;
  const { rows } = await db.query(
    `INSERT INTO budgets (analytical_account_id, amount, start_date, end_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [analytical_account_id, amount, start_date, end_date]
  );
  return rows[0];
};

exports.update = async (id, budget) => {
  const { amount, start_date, end_date } = budget;
  // We assume analytical_account_id is usually not changed in update, but if needed we can add it.
  const { rows } = await db.query(
    `UPDATE budgets 
     SET amount = $1, start_date = $2, end_date = $3
     WHERE id = $4 RETURNING *`,
    [amount, start_date, end_date, id]
  );
  return rows[0];
};

exports.delete = async (id) => {
  await db.query('DELETE FROM budgets WHERE id = $1', [id]);
};

// Revisions
exports.createRevision = async (revision) => {
    const { budget_id, old_amount, new_amount, reason, changed_by } = revision;
    await db.query(
        `INSERT INTO budget_revisions (budget_id, old_amount, new_amount, reason, changed_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [budget_id, old_amount, new_amount, reason, changed_by]
    );
};

exports.getRevisionsByBudgetId = async (budgetId) => {
    const query = `
        SELECT br.*, u.name as changed_by_name
        FROM budget_revisions br
        JOIN users u ON br.changed_by = u.id
        WHERE br.budget_id = $1
        ORDER BY br.changed_at DESC
    `;
    const { rows } = await db.query(query, [budgetId]);
    return rows;
};
