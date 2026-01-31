const contactRepository = require('../repositories/contactRepository');

exports.getAllContacts = async () => {
  return await contactRepository.findAll();
};

exports.getContactById = async (id) => {
  const contact = await contactRepository.findById(id);
  if (!contact) {
    throw new Error('Contact not found');
  }
  return contact;
};

exports.createContact = async (contactData) => {
  // Add validation logic here if needed
  return await contactRepository.create(contactData);
};

exports.updateContact = async (id, contactData) => {
  const existing = await contactRepository.findById(id);
  if (!existing) {
    throw new Error('Contact not found');
  }
  return await contactRepository.update(id, contactData);
};

exports.deleteContact = async (id) => {
  const existing = await contactRepository.findById(id);
  if (!existing) {
    throw new Error('Contact not found');
  }
  return await contactRepository.delete(id);
};
