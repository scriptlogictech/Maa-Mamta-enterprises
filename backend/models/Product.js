const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  category: { type: String, required: true, enum: ['Cola', 'Orange', 'Lemon', 'Independence', 'Sure', 'SunCrush', 'Raskik-Mango', 'Raskik Nimbu Pani', 'Other'] },
  size: { type: String, required: true }, // e.g. '250ml', '500ml', '1L', '2L'
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  reorderLevel: { type: Number, default: 50 },
  sku: { type: String, unique: true },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  gstPercent: { type: Number, default: 18 },
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.reorderLevel;
});

module.exports = mongoose.model('Product', productSchema);
