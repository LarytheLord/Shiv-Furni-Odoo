const autoAnalyticalService = require('../services/autoAnalyticalService');

exports.getRules = async (req, res) => {
  try {
    const rules = await autoAnalyticalService.getAllRules();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRule = async (req, res) => {
  try {
    const rule = await autoAnalyticalService.getRuleById(req.params.id);
    res.json(rule);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createRule = async (req, res) => {
  try {
    const rule = await autoAnalyticalService.createRule(req.body);
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const rule = await autoAnalyticalService.updateRule(req.params.id, req.body);
    res.json(rule);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    await autoAnalyticalService.deleteRule(req.params.id);
    res.json({ message: 'Rule deleted' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
