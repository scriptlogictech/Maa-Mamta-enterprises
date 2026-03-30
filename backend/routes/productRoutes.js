const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getAllProductsAdmin, updateStock } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getProducts);
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.post('/', protect, adminOnly, createProduct);
router.get('/:id', getProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.patch('/:id/stock', protect, adminOnly, updateStock);

module.exports = router;
