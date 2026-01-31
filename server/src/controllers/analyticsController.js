const analyticsService = require('../services/analyticsService');

exports.getBudgetVsActuals = async (req, res) => {
  try {
    const report = await analyticsService.getBudgetVsActuals();
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
