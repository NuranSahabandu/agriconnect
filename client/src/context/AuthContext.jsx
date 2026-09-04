import { createContext, useContext, useState, useEffect } from 'react'
import { registerUser, loginUser, getMe } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('agriconnect_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('agriconnect_token') || null
  })

  const [loading, setLoading] = useState(true)

  // Verify token on mount if present
  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await getMe()
          if (res?.user) {
            setUser(res.user)
            localStorage.setItem('agriconnect_user', JSON.stringify(res.user))
          }
        } catch {
          // Keep local cached user if offline
        }
      }
      setLoading(false)
    }

    verifyAuth()
  }, [token])

  const register = async (userData) => {
    const res = await registerUser(userData)
    if (res.user && res.token) {
      setUser(res.user)
      setToken(res.token)
      localStorage.setItem('agriconnect_user', JSON.stringify(res.user))
      localStorage.setItem('agriconnect_token', res.token)
    }
    return res
  }

  const login = async (email, password) => {
    const res = await loginUser({ email, password })
    if (res.user && res.token) {
      setUser(res.user)
      setToken(res.token)
      localStorage.setItem('agriconnect_user', JSON.stringify(res.user))
      localStorage.setItem('agriconnect_token', res.token)
    }
    return res
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('agriconnect_user')
    localStorage.removeItem('agriconnect_token')
  }

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: Boolean(user),
    isFarmer: Boolean(user && user.role === 'farmer'),
    isBuyer: Boolean(user && (user.role === 'buyer' || user.role === 'customer')),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
