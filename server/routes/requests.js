const express = require('express')
const mongoose = require('mongoose')
const Request = require('../models/Request')
const { getIsConnected } = require('../config/db')
const { requests: initialRequests } = require('../data')

const router = express.Router()

// Local memory fallback if MongoDB Atlas is temporarily unreachable
let memoryRequests = [...initialRequests]

// Format request for frontend compatibility
function formatRequest(doc) {
  if (!doc) return null
  const obj = doc.toObject ? doc.toObject() : { ...doc }
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: obj._id ? obj._id.toString() : obj.id,
  }
}

// GET /api/requests - Fetch all requests
router.get('/', async (req, res) => {
  try {
    const isDbReady = getIsConnected()

    if (isDbReady) {
      const dbRequests = await Request.find().sort({ createdAt: -1 })
      return res.json(dbRequests.map(formatRequest))
    }

    return res.json(memoryRequests)
  } catch (error) {
    console.error('Error fetching requests:', error)
    return res.json(memoryRequests)
  }
})

// POST /api/requests - Create a new request
router.post('/', async (req, res) => {
  try {
    const { productId, productName, farmer, buyer, quantity, totalCost } = req.body

    // Validation
    if (!productId || !productName || !farmer || !buyer || quantity === undefined || totalCost === undefined) {
      return res.status(400).json({
        error: 'Please fill all required fields.',
      })
    }

    const numQty = parseFloat(quantity)
    const numTotal = parseFloat(totalCost)

    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number.' })
    }

    if (isNaN(numTotal) || numTotal <= 0) {
      return res.status(400).json({ error: 'Total cost must be a positive number.' })
    }

    const isDbReady = getIsConnected()

    if (isDbReady) {
      const newRequest = new Request({
        productId: String(productId),
        productName: productName.trim(),
        farmer: farmer.trim(),
        buyer: buyer.trim(),
        quantity: numQty,
        totalCost: numTotal,
        status: 'Pending',
      })

      const saved = await newRequest.save()
      console.log(`🤝 [MongoDB Atlas] New purchase request created for: "${saved.productName}" (ID: ${saved._id})`)

      return res.status(201).json(formatRequest(saved))
    }

    // Fallback memory save
    const fallbackId = memoryRequests.length
      ? Math.max(...memoryRequests.map((r) => Number(r.id) || 0)) + 1
      : 1

    const fallbackRequest = {
      id: fallbackId,
      productId: String(productId),
      productName: productName.trim(),
      farmer: farmer.trim(),
      buyer: buyer.trim(),
      quantity: numQty,
      totalCost: numTotal,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }

    memoryRequests.unshift(fallbackRequest)
    console.warn(`⚠️ [Fallback Mode] Saved request to local memory for: ${fallbackRequest.productName}`)

    return res.status(201).json(fallbackRequest)
  } catch (error) {
    console.error('Error saving request:', error)
    return res.status(500).json({
      error: error.message || 'Failed to save request.',
    })
  }
})

// PATCH /api/requests/:id - Update request status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const isDbReady = getIsConnected()

    if (isDbReady && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Request.findByIdAndUpdate(id, { status }, {
        new: true,
        runValidators: true,
      })

      if (!updated) {
        return res.status(404).json({ error: 'Request not found' })
      }

      console.log(`✏️ [MongoDB Atlas] Request updated: ${updated.productName} (Status: ${updated.status})`)
      return res.json(formatRequest(updated))
    }

    // Fallback update
    const index = memoryRequests.findIndex((r) => String(r.id) === String(id))
    if (index === -1) {
      return res.status(404).json({ error: 'Request not found' })
    }

    memoryRequests[index] = { ...memoryRequests[index], status }
    return res.json(memoryRequests[index])
  } catch (error) {
    console.error('Error updating request:', error)
    return res.status(500).json({ error: error.message || 'Failed to update request' })
  }
})

module.exports = router
