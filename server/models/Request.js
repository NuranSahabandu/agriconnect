const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema(
  {
    status: { type: String, default: 'pending' },
  },
  {
    strict: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

module.exports = mongoose.model('Request', requestSchema)
