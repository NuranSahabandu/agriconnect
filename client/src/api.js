const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const STORAGE_KEY_PRODUCTS = 'agriconnect_products'
const STORAGE_KEY_USERS = 'agriconnect_registered_users'

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
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
      return INITIAL_PRODUCTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_PRODUCTS
  }
}

export function saveLocalProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products))
    window.dispatchEvent(new Event('productsUpdated'))
  } catch (e) {
    console.error('Failed to save products to localStorage', e)
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('agriconnect_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status} ${res.statusText}`)
  }

  return data
}

// ---------------- AUTH API ----------------

export async function registerUser(userData) {
  try {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    return res
  } catch (err) {
    // If backend is not running, save to localStorage fallback so user can still register
    console.warn('Backend unavailable, using local registration fallback:', err.message)
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]')
    if (existing.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('An account with this email already exists.')
    }
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
    }
    existing.push(newUser)
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(existing))

    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        location: newUser.location,
        farmName: newUser.farmName || '',
        buyerType: newUser.buyerType || '',
      },
      database: 'Local Fallback',
    }
  }
}

export async function loginUser(credentials) {
  try {
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  } catch (err) {
    // Fallback search in local storage
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]')
    const user = existing.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
    )
    if (user) {
      return {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          farmName: user.farmName || '',
          buyerType: user.buyerType || '',
        },
      }
    }
    throw err
  }
}

export async function getMe() {
  return request('/api/auth/me')
}

// ---------------- PRODUCTS API ----------------

export async function getProducts() {
  try {
    const serverProducts = await request('/api/products')
    if (Array.isArray(serverProducts) && serverProducts.length > 0) {
      saveLocalProducts(serverProducts)
      return serverProducts
    }
  } catch {
    // Fallback to localStorage
  }
  return getLocalProducts()
}

export async function addProduct(product) {
  try {
    const savedServerProduct = await request('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })

    if (savedServerProduct) {
      const current = getLocalProducts().filter((p) => String(p.id) !== String(savedServerProduct.id))
      const updated = [savedServerProduct, ...current]
      saveLocalProducts(updated)
      return savedServerProduct
    }
  } catch (err) {
    console.warn('Backend unavailable, saving product locally:', err.message)
  }

  // Fallback if backend offline
  const current = getLocalProducts()
  const newId = current.length ? Math.max(...current.map((p) => Number(p.id) || 0)) + 1 : 1
  const newProduct = {
    ...product,
    id: newId,
    createdAt: new Date().toISOString(),
  }
  const updated = [newProduct, ...current]
  saveLocalProducts(updated)
  return newProduct
}

export async function updateProduct(id, updatedFields) {
  try {
    const updatedServerProduct = await request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    })

    if (updatedServerProduct) {
      const current = getLocalProducts().map((p) =>
        String(p.id) === String(id) ? updatedServerProduct : p
      )
      saveLocalProducts(current)
      return updatedServerProduct
    }
  } catch (err) {
    console.warn('Backend unavailable, updating product locally:', err.message)
  }

  // Fallback update
  const current = getLocalProducts()
  const index = current.findIndex((p) => String(p.id) === String(id))
  if (index === -1) throw new Error('Product not found')

  const updatedProduct = { ...current[index], ...updatedFields }
  current[index] = updatedProduct
  saveLocalProducts(current)
  return updatedProduct
}

export async function deleteProduct(id) {
  try {
    await request(`/api/products/${id}`, {
      method: 'DELETE',
    })
  } catch (err) {
    console.warn('Backend unavailable, deleting product locally:', err.message)
  }

  const current = getLocalProducts()
  const filtered = current.filter((p) => String(p.id) !== String(id))
  saveLocalProducts(filtered)
  return { success: true }
}

// ---------------- REQUESTS API ----------------

export function getRequests() {
  return request('/api/requests')
}

export function addRequest(requestData) {
  return request('/api/requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  })
}

export function updateRequest(id, statusData) {
  return request(`/api/requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  })
}
