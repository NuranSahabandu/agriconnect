require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connectDB } = require('./config/db')
const authRoutes = require('./routes/auth')
const { products, requests } = require('./data')

const app = express()
const PORT = process.env.PORT || 5000

// Initialize MongoDB Atlas Connection
connectDB()

app.use(cors())
app.use(express.json())

// Mount Authentication Routes
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.get('/api/products', (req, res) => {
  res.json(products)
})

app.post('/api/products', (req, res) => {
  const product = {
    id: products.length ? Math.max(...products.map((p) => p.id || 0)) + 1 : 1,
    ...req.body,
  }
  products.push(product)
  res.status(201).json(product)
})

app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }
  products[index] = { ...products[index], ...req.body, id }
  res.json(products[index])
})

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }
  const deleted = products.splice(index, 1)[0]
  res.json(deleted)
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
