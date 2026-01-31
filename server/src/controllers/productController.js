const productService = require('../services/productService');

exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
