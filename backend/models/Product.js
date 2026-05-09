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
      'Suncrush',
      'Raskik Mango',
      'Raskik Nimbu Paani',
      'Power Up',
      'Fizz',
      'Mazza',
      'Amul Kool',
      'Other'
    ]
  },

  size: {
    type: String,
    required: true,
    enum: [
      '70 ml',
      '125 ml',
      '150 ml',
      '160 ml',
      '180 ml',
      '185 ml',
      '200 ml',
      '250 ml',
      '300 ml',
      '330 ml',
      '345 ml', 
      '500 ml',
      '750 ml',
      '1 l',
      '1.2 l',
      '1.5 l',
      '1.7 l',
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

  gstPercent: { type: Number, default: 0, min: 0, max: 100 }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.reorderLevel;
});

module.exports = mongoose.model('Product', productSchema);