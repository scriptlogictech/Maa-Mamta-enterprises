const express = require('express');
const { getStats, getSalesChart, getTopProducts, getRecentOrders, getCategorySales } = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', protect, adminOnly, getStats);
router.get('/sales-chart', protect, adminOnly, getSalesChart);
router.get('/top-products', protect, adminOnly, getTopProducts);
router.get('/recent-orders', protect, adminOnly, getRecentOrders);
router.get('/category-sales', protect, adminOnly, getCategorySales);

module.exports = router;
