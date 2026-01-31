const productRepository = require('../repositories/productRepository');

exports.getAllProducts = async () => {
  return await productRepository.findAll();
};

exports.getProductById = async (id) => {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

exports.createProduct = async (data) => {
  return await productRepository.create(data);
};

exports.updateProduct = async (id, data) => {
  const existing = await productRepository.findById(id);
  if (!existing) {
    throw new Error('Product not found');
  }
  return await productRepository.update(id, data);
};

exports.deleteProduct = async (id) => {
  const existing = await productRepository.findById(id);
  if (!existing) {
    throw new Error('Product not found');
  }
  return await productRepository.delete(id);
};
