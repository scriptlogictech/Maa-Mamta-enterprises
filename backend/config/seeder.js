const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const products = [
  { name: 'Campa Cola 250ml', category: 'Cola', size: '250ml', price: 15, mrp: 20, stock: 500, sku: 'CC-250', gstPercent: 18 },
  { name: 'Campa Cola 500ml', category: 'Cola', size: '500ml', price: 25, mrp: 30, stock: 400, sku: 'CC-500', gstPercent: 18 },
  { name: 'Campa Cola 1L',    category: 'Cola', size: '1L',    price: 45, mrp: 55, stock: 250, sku: 'CC-1L',  gstPercent: 18 },
  { name: 'Campa Cola 2L',    category: 'Cola', size: '2L',    price: 80, mrp: 95, stock: 150, sku: 'CC-2L',  gstPercent: 18 },
  { name: 'Campa Orange 250ml', category: 'Orange', size: '250ml', price: 15, mrp: 20, stock: 450, sku: 'CO-250', gstPercent: 18 },
  { name: 'Campa Orange 500ml', category: 'Orange', size: '500ml', price: 25, mrp: 30, stock: 350, sku: 'CO-500', gstPercent: 18 },
  { name: 'Campa Orange 1L',    category: 'Orange', size: '1L',    price: 45, mrp: 55, stock: 200, sku: 'CO-1L',  gstPercent: 18 },
  { name: 'Campa Lemon 250ml',  category: 'Lemon',  size: '250ml', price: 15, mrp: 20, stock: 420, sku: 'CL-250', gstPercent: 18 },
  { name: 'Campa Lemon 500ml',  category: 'Lemon',  size: '500ml', price: 25, mrp: 30, stock: 330, sku: 'CL-500', gstPercent: 18 },
  { name: 'Campa Water 500ml',  category: 'Water',  size: '500ml', price: 10, mrp: 15, stock: 800, sku: 'CW-500', gstPercent: 12 },
  { name: 'Campa Water 1L',     category: 'Water',  size: '1L',    price: 18, mrp: 22, stock: 600, sku: 'CW-1L',  gstPercent: 12 },
  { name: 'Campa Water 2L',     category: 'Water',  size: '2L',    price: 30, mrp: 40, stock: 40,  sku: 'CW-2L',  gstPercent: 12, reorderLevel: 50 },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // Users
  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass  = await bcrypt.hash('user123',  12);

  const [admin, user] = await User.insertMany([
    { name: 'Admin User', email: 'admin@campa.com', password: adminPass, role: 'admin', phone: '9999999999' },
    { name: 'Ravi Kumar',  email: 'user@campa.com',  password: userPass,  role: 'user',  phone: '8888888888' },
  ]);
  console.log('Users seeded');

  const insertedProducts = await Product.insertMany(products);
  console.log('Products seeded');

  // Sample orders for dashboard data
  const now = new Date();
  const orders = [];
  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now - daysAgo * 86400000);
    const p1 = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
    const p2 = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
    const qty1 = Math.ceil(Math.random() * 10);
    const qty2 = Math.ceil(Math.random() * 8);
    const subtotal = p1.price * qty1 + p2.price * qty2;
    const gstAmount = subtotal * 0.18;
    orders.push({
      user: Math.random() > 0.5 ? admin._id : user._id,
      items: [
        { product: p1._id, name: p1.name, quantity: qty1, price: p1.price, gstPercent: 18 },
        { product: p2._id, name: p2.name, quantity: qty2, price: p2.price, gstPercent: 18 },
      ],
      subtotal, gstAmount, totalAmount: subtotal + gstAmount,
      paymentMethod: ['cash', 'upi', 'card'][Math.floor(Math.random() * 3)],
      paymentStatus: 'paid',
      orderStatus: ['delivered', 'delivered', 'delivered', 'shipped', 'processing'][Math.floor(Math.random() * 5)],
      source: Math.random() > 0.4 ? 'online' : 'pos',
      createdAt: date, updatedAt: date,
    });
  }
  await Order.insertMany(orders);
  console.log('Orders seeded');

  console.log('\n✅ Database seeded successfully!');
  console.log('Admin login: admin@campa.com / admin123');
  console.log('User login:  user@campa.com  / user123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
