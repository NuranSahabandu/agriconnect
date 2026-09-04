require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { connectDB } = require('./config/db')
const authRoutes = require('./routes/auth')
const Product = require('./models/Product')
const Request = require('./models/Request')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.get('/api/products', async (req, res) => {
  const products = await Product.find()
  res.json(products)
})

app.post('/api/products', async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json(product)
})

app.put('/api/products/:id', async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(updated)
})

app.delete('/api/products/:id', async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id)
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(deleted)
})

app.get('/api/requests', async (req, res) => {
  const requests = await Request.find()
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
