import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

const SRI_LANKA_LOCATIONS = [
  'Dambulla',
  'Nuwara Eliya',
  'Jaffna',
  'Kandy',
  'Polonnaruwa',
  'Matale',
  'Kurunegala',
  'Anuradhapura',
  'Badulla',
  'Ratnapura',
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Galle',
  'Matara',
  'Hambantota',
  'Other',
]

const BUYER_TYPES = [
  'Household Consumer',
  'Wholesale Buyer',
  'Retail Shop / Supermarket',
  'Restaurant / Hotel',
  'Food Processor / Exporter',
]

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { lang } = useLang()

  const [role, setRole] = useState('farmer') // 'farmer' | 'buyer'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: 'Dambulla',
    customLocation: '',
    farmName: '',
    buyerType: 'Household Consumer',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const fillDemoData = (selectedRole) => {
    setRole(selectedRole)
    if (selectedRole === 'farmer') {
      setFormData({
        name: 'Sunil Bandara',
        email: `sunil.farmer.${Math.floor(Math.random() * 1000)}@agriconnect.lk`,
        password: 'password123',
        confirmPassword: 'password123',
        phone: '077 123 4567',
        location: 'Dambulla',
        customLocation: '',
        farmName: 'Bandara Green Valley Farm',
        buyerType: '',
      })
    } else {
      setFormData({
        name: 'Kasun Perera',
        email: `kasun.buyer.${Math.floor(Math.random() * 1000)}@agriconnect.lk`,
        password: 'password123',
        confirmPassword: 'password123',
        phone: '071 987 6543',
        location: 'Colombo',
        customLocation: '',
        farmName: '',
        buyerType: 'Wholesale Buyer',
      })
    }
    setErrors({})
    setServerError('')
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters).'
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    const cleanedPhone = formData.phone.replace(/\D/g, '')
    if (!cleanedPhone || cleanedPhone.length < 9) {
      newErrors.phone = 'Please enter a valid phone number (at least 9 digits).'
    }

    const finalLocation =
      formData.location === 'Other' ? formData.customLocation.trim() : formData.location
    if (!finalLocation) {
      newErrors.location = 'Please select or enter your location.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMsg('')

    if (!validate()) return

    const finalLocation =
      formData.location === 'Other' ? formData.customLocation.trim() : formData.location

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role,
      phone: formData.phone.trim(),
      location: finalLocation,
      farmName: role === 'farmer' ? formData.farmName.trim() : '',
      buyerType: role === 'buyer' ? formData.buyerType : '',
    }

    try {
      setLoading(true)
      const res = await register(payload)
      setSuccessMsg(`Welcome to AgriConnect! Registered successfully into ${res.database || 'MongoDB Atlas'}.`)

      setTimeout(() => {
        if (role === 'farmer') {
          navigate('/products')
        } else {
          navigate('/search')
        }
      }, 1200)
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-4xl">🌾</span>
            <span className="text-3xl font-extrabold text-emerald-800 tracking-tight">AgriConnect</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {lang === 'si' ? 'ගිණුමක් සාදන්න' : 'Create Your Account'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {lang === 'si'
              ? 'ගොවීන් සහ ගැනුම්කරුවන් සෘජුවම සම්බන්ධ වන ශ්‍රී ලංකාවේ කෘෂිකාර්මික වෙළඳපොළ'
              : 'Join Sri Lanka’s direct farmer-to-buyer agricultural network'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          {/* Role Switcher Cards */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
              {lang === 'si' ? 'ඔබේ භූමිකාව තෝරන්න' : 'Select Account Type'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Farmer Option */}
              <button
                type="button"
                onClick={() => {
                  setRole('farmer')
                  setErrors({})
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'farmer'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">👨🌾</span>
                  {role === 'farmer' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {lang === 'si' ? 'ගොවි මහතා (Farmer)' : 'Farmer'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                    {lang === 'si' ? 'අස්වැන්න විකිණීමට' : 'List & sell agricultural harvests'}
                  </p>
                </div>
              </button>

              {/* Buyer / Customer Option */}
              <button
                type="button"
                onClick={() => {
                  setRole('buyer')
                  setErrors({})
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'buyer'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🛒</span>
                  {role === 'buyer' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {lang === 'si' ? 'ගැනුම්කරු (Customer)' : 'Customer / Buyer'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                    {lang === 'si' ? 'නිෂ්පාදන මිලදී ගැනීමට' : 'Search & purchase farm produce'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Demo Pre-fill for Hackathon presentation */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <span>⚡ Quick Demo:</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemoData('farmer')}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                👨🌾 Fill Farmer
              </button>
              <button
                type="button"
                onClick={() => fillDemoData('buyer')}
                className="px-2.5 py-1 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                🛒 Fill Customer
              </button>
            </div>
          </div>

          {/* Alerts */}
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {lang === 'si' ? 'සම්පූර්ණ නම' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={role === 'farmer' ? 'e.g., Sunil Bandara' : 'e.g., Kasun Perera'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {lang === 'si' ? 'විද්‍යුත් තැපෑල' : 'Email Address'} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'si' ? 'මුරපදය' : 'Password'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'si' ? 'මුරපදය තහවුරු කරන්න' : 'Confirm Password'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Phone & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'si' ? 'දුරකථන අංකය' : 'Phone / WhatsApp'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="077 123 4567"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'si' ? 'ප්‍රදේශය / නගරය' : 'District / City'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 cursor-pointer"
                >
                  {SRI_LANKA_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      📍 {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.location === 'Other' && (
              <div>
                <input
                  type="text"
                  name="customLocation"
                  value={formData.customLocation}
                  onChange={handleChange}
                  placeholder="Enter your town or area"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
              </div>
            )}

            {/* Role-Specific Field: Farm Name or Buyer Type */}
            {role === 'farmer' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'si' ? 'ගොවිපල හෝ ව්‍යාපාර නම' : 'Farm / Business Name'} (Optional)
                </label>
                <input
                  type="text"
                  name="farmName"
                  value={formData.farmName}
                  onChange={handleChange}
                  placeholder="e.g., Sunil Organic Greenhouse"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'si' ? 'ගැනුම්කරු වර්ගය' : 'Customer Category'}
                </label>
                <select
                  name="buyerType"
                  value={formData.buyerType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 cursor-pointer"
                >
                  {BUYER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      🛒 {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Database Notice */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span>🍃</span>
              <span>
                User accounts are securely saved to <strong>MongoDB Atlas</strong> with encrypted passwords.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-base">🔄</span>
                  <span>Registering user in MongoDB Atlas...</span>
                </>
              ) : (
                <>
                  <span>{role === 'farmer' ? '👨🌾' : '🛒'}</span>
                  <span>
                    {lang === 'si'
                      ? `${role === 'farmer' ? 'ගොවි' : 'ගැනුම්කරු'} ගිණුම සාදන්න`
                      : `Register as ${role === 'farmer' ? 'Farmer' : 'Customer'}`}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>{lang === 'si' ? 'දැනටමත් ගිණුමක් තිබේද? ' : 'Already have an account? '}</span>
            <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline">
              {lang === 'si' ? 'ඇතුල් වන්න (Sign In)' : 'Sign In'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
