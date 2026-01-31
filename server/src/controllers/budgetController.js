const budgetService = require('../services/budgetService');

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await budgetService.getAllBudgets();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBudget = async (req, res) => {
  try {
    const budget = await budgetService.getBudgetById(req.params.id);
    res.json(budget);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const budget = await budgetService.createBudget(req.body);
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    // Pass userId for revision tracking
    const budget = await budgetService.updateBudget(req.params.id, req.body, req.user.id);
    res.json(budget);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    await budgetService.deleteBudget(req.params.id);
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
