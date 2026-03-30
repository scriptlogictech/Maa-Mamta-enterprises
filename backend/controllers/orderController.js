const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

const calcAmounts = (items) => {
  const subtotal   = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstAmount  = items.reduce((s, i) => s + (i.price * i.quantity * i.gstPercent) / 100, 0);
  return { subtotal, gstAmount, totalAmount: subtotal + gstAmount };
};

// POST /api/orders  (online)
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  const enriched = await Promise.all(items.map(async (item) => {
    const p = await Product.findById(item.product);
    if (!p) throw new Error(`Product not found`);
    if (p.stock < item.quantity) throw new Error(`Insufficient stock for ${p.name}`);
    return { product: p._id, name: p.name, quantity: item.quantity, price: p.price, gstPercent: p.gstPercent };
  }));

  const { subtotal, gstAmount, totalAmount } = calcAmounts(enriched);
  const order = await Order.create({
    user: req.user._id, items: enriched, shippingAddress,
    subtotal, gstAmount, totalAmount, paymentMethod, notes, source: 'online',
  });

  await Promise.all(enriched.map(i =>
    Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })
  ));

  res.status(201).json(order);
});

// GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'name image').sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name image sku');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  res.json(order);
});

// GET /api/orders  (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, source, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (source) filter.source = source;
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit).limit(Number(limit));
  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// PUT /api/orders/:id/status  (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (status) order.orderStatus = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  await order.save();
  res.json(order);
});

// POST /api/orders/pos  (admin POS)
const createPOSOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod, customerName, customerPhone, customerAddress, cashierName, paidAmount } = req.body;

  const enriched = await Promise.all(items.map(async (item) => {
    const p = await Product.findById(item.product);
    if (!p) throw new Error(`Product not found`);
    if (p.stock < item.quantity) throw new Error(`Insufficient stock for ${p.name}`);
    return { product: p._id, name: p.name, quantity: item.quantity, price: p.price, gstPercent: p.gstPercent };
  }));

  const { subtotal, gstAmount, totalAmount } = calcAmounts(enriched);
  const paid = Number(paidAmount) || totalAmount;
  const payStatus = paid >= totalAmount ? 'paid' : paid > 0 ? 'pending' : 'pending';

  const order = await Order.create({
    user:            req.user._id,
    items:           enriched,
    subtotal,
    gstAmount,
    totalAmount,
    paymentMethod,
    paymentStatus:   payStatus,
    orderStatus:     'delivered',
    source:          'pos',
    customerName:    customerName || '',
    customerPhone:   customerPhone || '',
    customerAddress: customerAddress || '',
    cashierName:     cashierName || '',
    paidAmount:      paid,
    notes:           customerName ? `Customer: ${customerName}` : 'Walk-in',
  });

  await Promise.all(enriched.map(i =>
    Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })
  ));

  res.status(201).json(order);
});

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, createPOSOrder };
