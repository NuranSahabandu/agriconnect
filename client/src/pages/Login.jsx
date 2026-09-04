import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { lang } = useLang()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      setLoading(true)
      const res = await login(email.trim(), password)
      if (res?.user?.role === 'farmer') {
        navigate('/products')
      } else {
        navigate('/search')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'farmer') {
      setEmail('sunil.farmer@agriconnect.lk')
      setPassword('password123')
    } else {
      setEmail('kasun.buyer@agriconnect.lk')
      setPassword('password123')
    }
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-4xl">🌾</span>
            <span className="text-3xl font-extrabold text-emerald-800 tracking-tight">AgriConnect</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'si' ? 'ගිණුමට ඇතුල් වන්න' : 'Sign in to AgriConnect'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {lang === 'si'
              ? 'ඔබේ ගොවි හෝ ගැනුම්කරු ගිණුමට ප්‍රවේශ වන්න'
              : 'Access your farmer or buyer account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <span>⚡ Demo:</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo('farmer')}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                👨🌾 As Farmer
              </button>
              <button
                type="button"
                onClick={() => fillDemo('buyer')}
                className="px-2.5 py-1 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                🛒 As Customer
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {lang === 'si' ? 'විද්‍යුත් තැපෑල' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {lang === 'si' ? 'මුරපදය' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-base">🔄</span>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>{lang === 'si' ? 'ඇතුල් වන්න' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>{lang === 'si' ? 'නව ගිණුමක් අවශ්‍යද? ' : "Don't have an account? "}</span>
            <Link to="/register" className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline">
              {lang === 'si' ? 'ලියාපදිංචි වන්න (Register)' : 'Register here'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
