const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const poQuery = 'SELECT COUNT(*) FROM purchase_orders';
    const soQuery = 'SELECT COUNT(*) FROM sales_orders';
    const budgetQuery = 'SELECT COUNT(*) FROM budgets WHERE end_date >= CURRENT_DATE';

    const { rows: poRows } = await db.query(poQuery);
    const { rows: soRows } = await db.query(soQuery);
    const { rows: budgetRows } = await db.query(budgetQuery);

    res.json({
        total_po: parseInt(poRows[0].count),
        total_so: parseInt(soRows[0].count),
        active_budgets: parseInt(budgetRows[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
