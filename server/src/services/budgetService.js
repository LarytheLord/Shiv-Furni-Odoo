const budgetRepository = require('../repositories/budgetRepository');

exports.getAllBudgets = async () => {
  return await budgetRepository.findAll();
};

exports.getBudgetById = async (id) => {
  const budget = await budgetRepository.findById(id);
  if (!budget) {
    throw new Error('Budget not found');
  }
  const revisions = await budgetRepository.getRevisionsByBudgetId(id);
  return { ...budget, revisions };
};

exports.createBudget = async (data) => {
  return await budgetRepository.create(data);
};

exports.updateBudget = async (id, data, userId) => {
  const existing = await budgetRepository.findById(id);
  if (!existing) {
    throw new Error('Budget not found');
  }

  // Create revision logic if amount changes
  if (parseFloat(existing.amount) !== parseFloat(data.amount)) {
      await budgetRepository.createRevision({
          budget_id: id,
          old_amount: existing.amount,
          new_amount: data.amount,
          reason: data.revision_reason || 'Amount updated',
          changed_by: userId
      });
  }

  return await budgetRepository.update(id, data);
};

exports.deleteBudget = async (id) => {
  const existing = await budgetRepository.findById(id);
  if (!existing) {
    throw new Error('Budget not found');
  }
  return await budgetRepository.delete(id);
};
