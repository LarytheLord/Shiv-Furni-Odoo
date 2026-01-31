const autoAnalyticalRepository = require('../repositories/autoAnalyticalRepository');

exports.getAllRules = async () => {
  return await autoAnalyticalRepository.findAll();
};

exports.getRuleById = async (id) => {
  const rule = await autoAnalyticalRepository.findById(id);
  if (!rule) {
    throw new Error('Rule not found');
  }
  return rule;
};

exports.createRule = async (data) => {
  return await autoAnalyticalRepository.create(data);
};

exports.updateRule = async (id, data) => {
  const existing = await autoAnalyticalRepository.findById(id);
  if (!existing) {
    throw new Error('Rule not found');
  }
  return await autoAnalyticalRepository.update(id, data);
};

exports.deleteRule = async (id) => {
  const existing = await autoAnalyticalRepository.findById(id);
  if (!existing) {
    throw new Error('Rule not found');
  }
  return await autoAnalyticalRepository.delete(id);
};

// Rule Engine
exports.matchAnalyticalAccount = async (item) => {
    // item should contain product details (category, name)
    const rules = await autoAnalyticalRepository.findAll();

    for (const rule of rules) {
        let match = false;
        const itemValue = item[rule.field_name]; // e.g. item.category

        if (itemValue === undefined) continue;

        if (rule.operator === '=') {
            match = itemValue === rule.value;
        } else if (rule.operator === 'ILIKE') {
            match = itemValue.toLowerCase().includes(rule.value.toLowerCase());
        }
        // Add more operators if needed

        if (match) {
            return rule.analytical_account_id;
        }
    }
    return null;
};
