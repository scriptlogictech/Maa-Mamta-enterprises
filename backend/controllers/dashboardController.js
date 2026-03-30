const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const startOf = (unit) => {
  const now = new Date();
  if (unit === 'day') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (unit === 'week') {
    const day = now.getDay();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  }
  if (unit === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
};

// GET /api/dashboard/stats
const getStats = asyncHandler(async (req, res) => {
  const [todayOrders, weekOrders, monthOrders, totalUsers, lowStockCount] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: startOf('day') }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOf('week') }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOf('month') }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ $expr: { $lte: ['$stock', '$reorderLevel'] } }),
  ]);

  res.json({
    today: { sales: todayOrders[0]?.total || 0, orders: todayOrders[0]?.count || 0 },
    week: { sales: weekOrders[0]?.total || 0, orders: weekOrders[0]?.count || 0 },
    month: { sales: monthOrders[0]?.total || 0, orders: monthOrders[0]?.count || 0 },
    totalUsers,
    lowStockCount,
  });
});

// GET /api/dashboard/sales-chart?period=daily|weekly|monthly
const getSalesChart = asyncHandler(async (req, res) => {
  const { period = 'daily' } = req.query;

  let groupId, matchDate, labelFormat;

  if (period === 'daily') {
    // Last 7 days
    matchDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
  } else if (period === 'weekly') {
    // Last 8 weeks
    matchDate = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
    groupId = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
  } else {
    // Last 12 months
    matchDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  }

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: matchDate }, paymentStatus: 'paid' } },
    { $group: { _id: groupId, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
  ]);

  res.json(data);
});

// GET /api/dashboard/top-products
const getTopProducts = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: startOf('month') } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ]);
  res.json(data);
});

// GET /api/dashboard/recent-orders
const getRecentOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ paymentStatus: 'paid' })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(10);
  res.json(orders);
});

// GET /api/dashboard/category-sales
const getCategorySales = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: startOf('month') } } },
    { $unwind: '$items' },
    { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $group: { _id: '$product.category', total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { total: -1 } },
  ]);
  res.json(data);
});

module.exports = { getStats, getSalesChart, getTopProducts, getRecentOrders, getCategorySales };
