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

app.get('/api/products', async (req, res) => {
  const products = await Product.find()
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

app.post('/api/requests', async (req, res) => {
  const newRequest = await Request.create(req.body)
  res.status(201).json(newRequest)
})

app.patch('/api/requests/:id', async (req, res) => {
  const existingRequest = await Request.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })

  if (!existingRequest) {
    return res.status(404).json({ error: 'Request not found' })
  }

  res.json(existingRequest)
})

app.use('/api/products/search', require('./listing/listingRoutes'))

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
