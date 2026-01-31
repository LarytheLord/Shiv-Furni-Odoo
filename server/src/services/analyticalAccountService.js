const analyticalAccountRepository = require('../repositories/analyticalAccountRepository');

exports.getAllAccounts = async () => {
  return await analyticalAccountRepository.findAll();
};

exports.getAccountById = async (id) => {
  const account = await analyticalAccountRepository.findById(id);
  if (!account) {
    throw new Error('Analytical Account not found');
  }
  return account;
};

exports.createAccount = async (data) => {
  return await analyticalAccountRepository.create(data);
};

exports.updateAccount = async (id, data) => {
  const existing = await analyticalAccountRepository.findById(id);
  if (!existing) {
    throw new Error('Analytical Account not found');
  }
  return await analyticalAccountRepository.update(id, data);
};

exports.deleteAccount = async (id) => {
  const existing = await analyticalAccountRepository.findById(id);
  if (!existing) {
    throw new Error('Analytical Account not found');
  }
  return await analyticalAccountRepository.delete(id);
};
