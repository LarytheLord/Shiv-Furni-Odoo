const contactService = require('../services/contactService');

exports.getContacts = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContact = async (req, res) => {
  try {
    const contact = await contactService.getContactById(req.params.id);
    res.json(contact);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const contact = await contactService.createContact(req.body);
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await contactService.updateContact(req.params.id, req.body);
    res.json(contact);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await contactService.deleteContact(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
