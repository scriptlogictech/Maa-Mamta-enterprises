const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },

  category: {
    type: String,
    required: true,
    enum: [
      'Cola',
      'Orange',
      'Lemon',
      'Independence',
      'Sure',
      'SunCrush',
      'Raskik-Mango',
      'Raskik Nimbu Pani',
      'Other'
    ]
  },

  size: {
    type: String,
    required: true,
    enum: [
      '125 ml',
      '150 ml',
      '180 ml',
      '185 ml',
      '200 ml',
      '250 ml',
      '330 ml',
      '500 ml',
      '750 ml',
      '1 l',
      '1.5 l',
      '2.25 l'
    ]
  },

  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function (value) {
        return value <= this.mrp;
      },
      message: 'Price cannot be greater than MRP'
    }
  },

  mrp: { type: Number, required: true, min: 0 },

  stock: { type: Number, required: true, default: 0 },
  reorderLevel: { type: Number, default: 50 },



  image: { type: String, default: '' },

  isActive: { type: Boolean, default: true },

  gstPercent: { type: Number, default: 18, min: 0, max: 100 }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.reorderLevel;
});

module.exports = mongoose.model('Product', productSchema);