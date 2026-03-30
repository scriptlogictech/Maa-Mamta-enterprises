const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// GET /api/products - public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

// POST /api/products - admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// PUT /api/products/:id - admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

// DELETE /api/products/:id - admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  product.isActive = false;
  await product.save();
  res.json({ message: 'Product deactivated' });
});

// GET /api/products/admin/all - admin (includes inactive)
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products);
});

// PATCH /api/products/:id/stock - admin
const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body; // operation: 'add' | 'set'
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  product.stock = operation === 'add' ? product.stock + quantity : quantity;
  await product.save();
  res.json(product);
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getAllProductsAdmin, updateStock };
