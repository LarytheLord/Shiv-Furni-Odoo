const analyticalAccountService = require('../services/analyticalAccountService');

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await analyticalAccountService.getAllAccounts();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAccount = async (req, res) => {
  try {
    const account = await analyticalAccountService.getAccountById(req.params.id);
    res.json(account);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const account = await analyticalAccountService.createAccount(req.body);
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const account = await analyticalAccountService.updateAccount(req.params.id, req.body);
    res.json(account);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await analyticalAccountService.deleteAccount(req.params.id);
    res.json({ message: 'Analytical Account deleted' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
