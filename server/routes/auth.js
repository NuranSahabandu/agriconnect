const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { getIsConnected } = require('../config/db')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'agriconnect_secret_jwt_key_2026'

// In-memory fallback in case MongoDB Atlas is unreachable during hackathon
const memoryUsers = []

// Helper to format user response without sending password
function sanitizeUser(userDoc) {
  return {
    id: userDoc._id ? userDoc._id.toString() : userDoc.id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    phone: userDoc.phone,
    location: userDoc.location,
    farmName: userDoc.farmName || '',
    buyerType: userDoc.buyerType || '',
    createdAt: userDoc.createdAt,
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location, farmName, buyerType } = req.body

    // Basic Validation
    if (!name || !email || !password || !phone || !location) {
      return res.status(400).json({
        error: 'Please fill all required fields: name, email, password, phone, and location.',
      })
    }

    if (!['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({
        error: 'Role must be either "farmer" or "buyer".',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.',
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const hashedPassword = await bcrypt.hash(password, 10)

    let savedUser = null
    const isDbReady = getIsConnected()

    if (isDbReady) {
      // 1. MongoDB Atlas Storage
      const existingUser = await User.findOne({ email: normalizedEmail })
      if (existingUser) {
        return res.status(409).json({
          error: 'An account with this email address already exists. Please login instead.',
        })
      }

      const newUser = new User({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        phone: phone.trim(),
        location: location.trim(),
        farmName: farmName ? farmName.trim() : '',
        buyerType: buyerType || (role === 'buyer' ? 'Household Consumer' : ''),
      })

      savedUser = await newUser.save()
      console.log(`🌾 [MongoDB Atlas] New ${role} registered and saved: ${savedUser.email} (ID: ${savedUser._id})`)
    } else {
      // 2. Fallback memory store if Atlas is offline/connecting
      const existingUser = memoryUsers.find((u) => u.email === normalizedEmail)
      if (existingUser) {
        return res.status(409).json({
          error: 'An account with this email address already exists.',
        })
      }

      const fallbackUser = {
        id: (memoryUsers.length + 1).toString(),
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        phone: phone.trim(),
        location: location.trim(),
        farmName: farmName ? farmName.trim() : '',
        buyerType: buyerType || '',
        createdAt: new Date().toISOString(),
      }
      memoryUsers.push(fallbackUser)
      savedUser = fallbackUser
      console.warn(`⚠️ [Fallback Mode] Saved ${role} in local memory: ${savedUser.email}`)
    }

    const sanitized = sanitizeUser(savedUser)
    const token = jwt.sign(
      { id: sanitized.id, email: sanitized.email, role: sanitized.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      success: true,
      message: `${role === 'farmer' ? 'Farmer' : 'Customer'} registered successfully!`,
      token,
      user: sanitized,
      database: isDbReady ? 'MongoDB Atlas' : 'Local Fallback',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({
      error: error.message || 'Internal server error during registration.',
    })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const isDbReady = getIsConnected()
    let foundUser = null

    if (isDbReady) {
      foundUser = await User.findOne({ email: normalizedEmail })
    } else {
      foundUser = memoryUsers.find((u) => u.email === normalizedEmail)
    }

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const isMatch = await bcrypt.compare(password, foundUser.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const sanitized = sanitizeUser(foundUser)
    const token = jwt.sign(
      { id: sanitized.id, email: sanitized.email, role: sanitized.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: sanitized,
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Server error during login.' })
  }
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const isDbReady = getIsConnected()
    let user = null

    if (isDbReady) {
      user = await User.findById(decoded.id)
    } else {
      user = memoryUsers.find((u) => u.id === decoded.id)
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({ user: sanitizeUser(user) })
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
})

// GET /api/auth/users (for dashboard / inspection)
router.get('/users', async (req, res) => {
  try {
    const isDbReady = getIsConnected()
    let allUsers = []

    if (isDbReady) {
      const dbUsers = await User.find().select('-password').sort({ createdAt: -1 })
      allUsers = dbUsers.map(sanitizeUser)
    } else {
      allUsers = memoryUsers.map(sanitizeUser)
    }

    res.json({
      count: allUsers.length,
      database: isDbReady ? 'MongoDB Atlas' : 'Local Fallback',
      users: allUsers,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
