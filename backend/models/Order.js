const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  gstPercent: { type: Number, default: 18 },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],

  // Shipping (online orders)
  shippingAddress: {
    street: String, city: String, state: String, pincode: String,
  },

  // POS billing fields
  customerName:    { type: String, default: '' },
  customerPhone:   { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  cashierName:     { type: String, default: '' },
  paidAmount:      { type: Number, default: 0 },

  subtotal:    { type: Number, required: true },
  gstAmount:   { type: Number, required: true },
  totalAmount: { type: Number, required: true },

  paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'credit'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed',
  },
  source: { type: String, enum: ['online', 'pos'], default: 'online' },
  notes: String,
}, { timestamps: true });

// Auto-generate order number: CC00001, CC00002 ...
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `CC${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
