require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connectDB } = require('./config/db')
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const { requests } = require('./data')

const app = express()
const PORT = process.env.PORT || 5050

// Initialize MongoDB Atlas Connection
connectDB()

app.use(cors())
app.use(express.json())

// Mount Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.get('/api/requests', (req, res) => {
  res.json(requests)
})

app.post('/api/requests', (req, res) => {
  const newRequest = {
    id: requests.length ? requests[requests.length - 1].id + 1 : 1,
    status: 'pending',
    ...req.body,
  }
  requests.push(newRequest)
  res.status(201).json(newRequest)
})

app.patch('/api/requests/:id', (req, res) => {
  const id = Number(req.params.id)
  const existingRequest = requests.find((r) => r.id === id)

  if (!existingRequest) {
    return res.status(404).json({ error: 'Request not found' })
  }

  Object.assign(existingRequest, req.body)
  res.json(existingRequest)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
