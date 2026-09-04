const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Product = require('../models/Product')
const { getIsConnected } = require('../config/db')
const { products: initialProducts } = require('../data')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'agriconnect_secret_jwt_key_2026'

// Local memory fallback if MongoDB Atlas is temporarily unreachable
let memoryProducts = [...initialProducts]

// Middleware to ensure only farmers can add, edit, or delete product listings
function requireFarmer(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication token required to manage products.',
    })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.role !== 'farmer') {
      return res.status(403).json({
        error: 'Forbidden: Customers cannot create, edit, or delete farmer product listings.',
      })
    }
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired session token. Please sign in as a farmer.',
    })
  }
}

// Format product for frontend compatibility (ensuring `id` is accessible as string or number)
function formatProduct(doc) {
  if (!doc) return null
  const obj = doc.toObject ? doc.toObject() : { ...doc }
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: obj._id ? obj._id.toString() : obj.id,
  }
}

// GET /api/products - Fetch all products (public for all users and customers)
router.get('/', async (req, res) => {
  try {
    const isDbReady = getIsConnected()

    if (isDbReady) {
      const dbProducts = await Product.find().sort({ createdAt: -1 })
      return res.json(dbProducts.map(formatProduct))
    }

    return res.json(memoryProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return res.json(memoryProducts)
  }
})

// POST /api/products - Farmer adds new product (Farmers only)
router.post('/', requireFarmer, async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      price,
      location,
      farmer,
      contact,
      description,
    } = req.body

    // Validation
    if (!name || !category || quantity === undefined || price === undefined || !location || !farmer || !contact) {
      return res.status(400).json({
        error: 'Please fill all required fields: name, category, quantity, price, location, farmer, and contact.',
      })
    }

    const numQty = parseFloat(quantity)
    const numPrice = parseFloat(price)

    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number.' })
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number.' })
    }

    const isDbReady = getIsConnected()

    if (isDbReady) {
      // 1. SAVE TO MONGODB ATLAS IN 'products' COLLECTION
      const newProduct = new Product({
        name: name.trim(),
        category: category.trim(),
        quantity: numQty,
        unit: unit ? unit.trim() : 'kg',
        price: numPrice,
        location: location.trim(),
        farmer: farmer.trim(),
        contact: contact.trim(),
        description: description ? description.trim() : '',
        status: 'available',
      })

      const saved = await newProduct.save()
      console.log(`🌾 [MongoDB Atlas] Farmer added product to 'products' collection: "${saved.name}" (ID: ${saved._id})`)

      return res.status(201).json(formatProduct(saved))
    }

    // 2. Fallback memory save
    const fallbackId = memoryProducts.length
      ? Math.max(...memoryProducts.map((p) => Number(p.id) || 0)) + 1
      : 1

    const fallbackProduct = {
      id: fallbackId,
      name: name.trim(),
      category: category.trim(),
      quantity: numQty,
      unit: unit ? unit.trim() : 'kg',
      price: numPrice,
      location: location.trim(),
      farmer: farmer.trim(),
      contact: contact.trim(),
      description: description ? description.trim() : '',
      status: 'available',
      createdAt: new Date().toISOString(),
    }

    memoryProducts.unshift(fallbackProduct)
    console.warn(`⚠️ [Fallback Mode] Saved product to local memory: ${fallbackProduct.name}`)

    return res.status(201).json(fallbackProduct)
  } catch (error) {
    console.error('Error saving product to MongoDB Atlas:', error)
    return res.status(500).json({
      error: error.message || 'Failed to save product to MongoDB Atlas database.',
    })
  }
})

// PUT /api/products/:id - Update product (Farmers only)
router.put('/:id', requireFarmer, async (req, res) => {
  try {
    const { id } = req.params
    const isDbReady = getIsConnected()

    if (isDbReady && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      })

      if (!updated) {
        return res.status(404).json({ error: 'Product not found' })
      }

      console.log(`✏️ [MongoDB Atlas] Product updated: ${updated.name} (ID: ${updated._id})`)
      return res.json(formatProduct(updated))
    }

    // Fallback update
    const index = memoryProducts.findIndex((p) => String(p.id) === String(id))
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' })
    }

    memoryProducts[index] = { ...memoryProducts[index], ...req.body, id: memoryProducts[index].id }
    return res.json(memoryProducts[index])
  } catch (error) {
    console.error('Error updating product:', error)
    return res.status(500).json({ error: error.message || 'Failed to update product' })
  }
})

// DELETE /api/products/:id - Delete product (Farmers only)
router.delete('/:id', requireFarmer, async (req, res) => {
  try {
    const { id } = req.params
    const isDbReady = getIsConnected()

    if (isDbReady && mongoose.Types.ObjectId.isValid(id)) {
      const deleted = await Product.findByIdAndDelete(id)
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' })
      }

      console.log(`🗑️ [MongoDB Atlas] Product deleted: ${deleted.name} (ID: ${deleted._id})`)
      return res.json(formatProduct(deleted))
    }

    // Fallback delete
    const index = memoryProducts.findIndex((p) => String(p.id) === String(id))
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const deleted = memoryProducts.splice(index, 1)[0]
    return res.json(deleted)
  } catch (error) {
    console.error('Error deleting product:', error)
    return res.status(500).json({ error: error.message || 'Failed to delete product' })
  }
})

module.exports = router
