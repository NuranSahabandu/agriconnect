require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connectDB } = require('./config/db')
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const requestRoutes = require('./routes/requests')

const app = express()
const PORT = process.env.PORT || 5000

// Initialize MongoDB Atlas Connection
connectDB()

app.use(cors())
app.use(express.json())

// Mount Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/requests', requestRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
