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

export function getRequests() {
  return request('/api/requests')
}

export function addRequest(requestData) {
  return request('/api/requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  })
}
