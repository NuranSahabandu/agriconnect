const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['farmer', 'buyer'],
      required: [true, 'Role must be either "farmer" or "buyer"'],
      default: 'buyer',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    // Optional role-specific metadata
    farmName: {
      type: String,
      trim: true,
      default: '',
    },
    buyerType: {
      type: String,
      enum: ['Wholesale Buyer', 'Retail Buyer', 'Household Consumer', 'Restaurant / Hotel', 'Other', ''],
      default: 'Household Consumer',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.models.User || mongoose.model('User', userSchema)
