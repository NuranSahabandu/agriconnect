const express = require('express')
const cors = require('cors')
const { products, requests } = require('./data')

const app = express()
const PORT = process.env.PORT || 5050

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/products', (req, res) => {
  res.json(products)
})

app.post('/api/products', (req, res) => {
  const product = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    ...req.body,
  }
  products.push(product)
  res.status(201).json(product)
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
