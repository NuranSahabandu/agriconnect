const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Vegetables',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      default: 'kg',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    farmer: {
      type: String,
      required: [true, 'Farmer name is required'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'sold_out', 'hidden'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
)

// Explicitly save inside 'products' collection in MongoDB
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema, 'products')
