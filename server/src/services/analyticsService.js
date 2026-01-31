const db = require('../config/db');

exports.getBudgetVsActuals = async () => {
    // Fetch all budgets
    const budgetsQuery = `
        SELECT b.*, aa.name as analytical_account_name
        FROM budgets b
        JOIN analytical_accounts aa ON b.analytical_account_id = aa.id
    `;
    const { rows: budgets } = await db.query(budgetsQuery);

    const report = [];

    for (const budget of budgets) {
        // Calculate Actuals (Bills + Invoices lines tailored to this account within period)
        // Note: For simplicity, we add Invoices (Revenue) and subtract Bills (Expense) if we want Net?
        // Or usually Budget is specific: "Marketing Budget" (Expense).
        // Let's assume for now we sum BOTH but usually one dominates.
        // Actually, let's treat them as separate buckets or assume the user manages them.
        // We will return: Actual Expense (Bills), Actual Income (Invoices).
        
        const expenseQuery = `
            SELECT SUM(l.subtotal) as total
            FROM vendor_bill_lines l
            JOIN vendor_bills vb ON l.bill_id = vb.id
            WHERE l.analytical_account_id = $1
            AND vb.bill_date BETWEEN $2 AND $3
            AND vb.state = 'posted'
        `;
        const { rows: expenseRows } = await db.query(expenseQuery, [budget.analytical_account_id, budget.start_date, budget.end_date]);
        const actualExpense = parseFloat(expenseRows[0].total || 0);

        const incomeQuery = `
            SELECT SUM(l.subtotal) as total
            FROM invoice_lines l
            JOIN invoices i ON l.invoice_id = i.id
            WHERE l.analytical_account_id = $1
            AND i.invoice_date BETWEEN $2 AND $3
            AND i.state = 'posted'
        `;
        const { rows: incomeRows } = await db.query(incomeQuery, [budget.analytical_account_id, budget.start_date, budget.end_date]);
        const actualIncome = parseFloat(incomeRows[0].total || 0);

        // Variance: Budget - Actual Expense (if expense budget). 
        // We'll provide raw data for frontend to interpret.
        
        report.push({
            budget_id: budget.id,
            analytical_account: budget.analytical_account_name,
            start_date: budget.start_date,
            end_date: budget.end_date,
            budget_amount: parseFloat(budget.amount),
            actual_expense: actualExpense,
            actual_income: actualIncome,
            variance_expense: parseFloat(budget.amount) - actualExpense,
            // Assuming budget is expense for coloring logic usually
            achievement_expense_pct: (actualExpense / parseFloat(budget.amount)) * 100
        });
    }

    return report;
};
