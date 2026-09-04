const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
    },
    farmer: {
      type: String,
      required: [true, 'Farmer name is required'],
    },
    buyer: {
      type: String,
      required: [true, 'Buyer name is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
    },
    totalCost: {
      type: Number,
      required: [true, 'Total cost is required'],
      min: [0.01, 'Total cost must be greater than 0'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.models.Request || mongoose.model('Request', requestSchema, 'requests')
