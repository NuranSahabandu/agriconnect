const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const STORAGE_KEY = 'agriconnect_products'

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Fresh Red Tomatoes',
    category: 'Vegetables',
    quantity: 120,
    unit: 'kg',
    price: 180,
    location: 'Dambulla',
    farmer: 'Sunil Bandara',
    contact: '077 123 4567',
    description: 'Freshly harvested Grade A greenhouse tomatoes, firm and vibrant red.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Organic Carrots',
    category: 'Vegetables',
    quantity: 250,
    unit: 'kg',
    price: 240,
    location: 'Nuwara Eliya',
    farmer: 'K. Somapala',
    contact: '071 987 6543',
    description: 'Crisp, washed organic upland carrots packaged in 25kg crates.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Keeri Samba Rice',
    category: 'Grains & Rice',
    quantity: 500,
    unit: 'kg',
    price: 290,
    location: 'Polonnaruwa',
    farmer: 'Gamini Rice Mills',
    contact: '075 555 1234',
    description: 'Aged premium polished Keeri Samba paddy, low moisture guarantee.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Green Bird Chili',
    category: 'Spices',
    quantity: 45,
    unit: 'kg',
    price: 650,
    location: 'Jaffna',
    farmer: 'R. Sivakumar',
    contact: '076 345 8899',
    description: 'Spicy Jaffna green chilies, handpicked this morning.',
    createdAt: new Date().toISOString(),
  },
]

export function getLocalProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS))
      return INITIAL_PRODUCTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_PRODUCTS
  }
}

export function saveLocalProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    window.dispatchEvent(new Event('productsUpdated'))
  } catch (e) {
    console.error('Failed to save products to localStorage', e)
  }
}

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

export async function getProducts() {
  try {
    const serverProducts = await request('/api/products')
    if (Array.isArray(serverProducts) && serverProducts.length > 0) {
      saveLocalProducts(serverProducts)
      return serverProducts
    }
  } catch {
    // Backend offline or unreachable, fallback to localStorage seamlessly
  }
  return getLocalProducts()
}

export async function addProduct(product) {
  const current = getLocalProducts()
  const newId = current.length ? Math.max(...current.map((p) => p.id || 0)) + 1 : 1
  const newProduct = {
    ...product,
    id: newId,
    createdAt: new Date().toISOString(),
  }

  // Save to local storage first
  const updated = [newProduct, ...current]
  saveLocalProducts(updated)

  // Try sync to server
  try {
    await request('/api/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
    })
  } catch {
    // Ignore server error; local copy is secure
  }

  return newProduct
}

export async function updateProduct(id, updatedFields) {
  const current = getLocalProducts()
  const index = current.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Product not found')

  const updatedProduct = { ...current[index], ...updatedFields }
  current[index] = updatedProduct
  saveLocalProducts(current)

  try {
    await request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedProduct),
    })
  } catch {
    // Ignore server error; local copy is secure
  }

  return updatedProduct
}

export async function deleteProduct(id) {
  const current = getLocalProducts()
  const filtered = current.filter((p) => p.id !== id)
  saveLocalProducts(filtered)

  try {
    await request(`/api/products/${id}`, {
      method: 'DELETE',
    })
  } catch {
    // Ignore server error
  }

  return { success: true }
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

