const API_URL = import.meta.env.VITE_API_URL

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export function getProducts() {
  return request('/api/products')
}

export function addProduct(product) {
  return request('/api/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })
}

export async function searchProducts(filters = {}) {
  const { search, category, location, maxPrice, sortBy } = filters

  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (location) params.set('location', location)
  if (maxPrice !== undefined && maxPrice !== '') params.set('maxPrice', maxPrice)
  if (sortBy) params.set('sortBy', sortBy)

  const { results } = await request(`/api/products/search?${params.toString()}`)
  return results
}

export function getRequests() {
  return request('/api/requests')
}

export function addRequest(requestData) {
  return request('/api/requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  })
}
