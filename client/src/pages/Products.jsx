import { useState, useEffect, useId } from 'react'
import { useLang } from '../context/LangContext'
import {
  getProducts,
  getLocalProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../api'

const CATEGORIES = [
  { id: 'Vegetables', labelKey: 'catVegetable', icon: '🥕', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'Fruits', labelKey: 'catFruit', icon: '🍎', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'Grains & Rice', labelKey: 'catGrain', icon: '🌾', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'Spices', labelKey: 'catSpice', icon: '🌶️', badgeColor: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'Other Produce', labelKey: 'catOther', icon: '📦', badgeColor: 'bg-slate-100 text-slate-800 border-slate-200' },
]

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
  'Other',
]

const UNITS = ['kg', 'g', 'bunches', 'crates', 'sacks', 'pieces']

const DEMO_PRESETS = [
  {
    name: 'Dambulla Red Tomatoes',
    category: 'Vegetables',
    quantity: '100',
    unit: 'kg',
    price: '180',
    location: 'Dambulla',
    farmer: 'Sunil Bandara',
    contact: '077 123 4567',
    description: 'Crisp, ripe grade-A greenhouse tomatoes ready for immediate pickup.',
  },
  {
    name: 'Nuwara Eliya Leeks',
    category: 'Vegetables',
    quantity: '150',
    unit: 'kg',
    price: '220',
    location: 'Nuwara Eliya',
    farmer: 'Upcountry Harvests',
    contact: '071 456 7890',
    description: 'Fresh highland leeks packed in aerated wooden crates.',
  },
  {
    name: 'Polonnaruwa Samba Rice',
    category: 'Grains & Rice',
    quantity: '400',
    unit: 'kg',
    price: '285',
    location: 'Polonnaruwa',
    farmer: 'Rajarata Millers',
    contact: '075 888 9911',
    description: 'High-purity milled white samba rice, 50kg sealed bags.',
  },
]

export default function Products() {
  const { t } = useLang()
  const formId = useId()

  const [products, setProducts] = useState(() => getLocalProducts())
  const [editingId, setEditingId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Notification state
  const [toast, setToast] = useState(null)

  // Form State
  const initialFormState = {
    name: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    price: '',
    location: 'Dambulla',
    customLocation: '',
    farmer: '',
    contact: '',
    description: '',
  }

  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})

  // Refresh products & subscribe to external updates
  const refreshProducts = async () => {
    try {
      const data = await getProducts()
      if (data) setProducts(data)
    } catch (err) {
      console.error('Failed to load products:', err)
    }
  }

  useEffect(() => {
    refreshProducts()

    const handleUpdate = () => {
      setProducts(getLocalProducts())
    }
    window.addEventListener('productsUpdated', handleUpdate)
    return () => window.removeEventListener('productsUpdated', handleUpdate)
  }, [])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3800)
  }

  const handleOpenAddModal = () => {
    setEditingId(null)
    setFormData(initialFormState)
    setErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData(initialFormState)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = t('errNameRequired')
    }

    if (!formData.category) {
      newErrors.category = t('errCategoryRequired')
    }

    const qty = parseFloat(formData.quantity)
    if (isNaN(qty) || qty <= 0) {
      newErrors.quantity = t('errQuantityRequired')
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      newErrors.price = t('errPriceRequired')
    }

    const finalLocation =
      formData.location === 'Other'
        ? formData.customLocation.trim()
        : formData.location

    if (!finalLocation) {
      newErrors.location = t('errLocationRequired')
    }

    if (!formData.farmer.trim()) {
      newErrors.farmer = t('errFarmerRequired')
    }

    // Phone validation: at least 9 numeric digits
    const cleanedPhone = formData.contact.replace(/\D/g, '')
    if (!cleanedPhone || cleanedPhone.length < 9) {
      newErrors.contact = t('errContactRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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

  const applyDemoPreset = (preset) => {
    setFormData({
      ...preset,
      customLocation: '',
    })
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('Please correct the highlighted form errors.', 'error')
      return
    }

    const finalLocation =
      formData.location === 'Other'
        ? formData.customLocation.trim()
        : formData.location

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      price: Number(formData.price),
      location: finalLocation,
      farmer: formData.farmer.trim(),
      contact: formData.contact.trim(),
      description: formData.description.trim(),
    }

    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        showToast(t('productUpdatedSuccess'))
      } else {
        await addProduct(payload)
        showToast(t('productAddedSuccess'))
      }

      handleCloseModal()
      await refreshProducts()
    } catch (err) {
      console.error(err)
      showToast('Error saving product. Please try again.', 'error')
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)

    const isCustomLoc = !SRI_LANKA_LOCATIONS.includes(product.location)
    setFormData({
      name: product.name || '',
      category: product.category || 'Vegetables',
      quantity: product.quantity ? String(product.quantity) : '',
      unit: product.unit || 'kg',
      price: product.price ? String(product.price) : '',
      location: isCustomLoc ? 'Other' : product.location,
      customLocation: isCustomLoc ? product.location : '',
      farmer: product.farmer || '',
      contact: product.contact || '',
      description: product.description || '',
    })

    setErrors({})
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      setDeleteConfirmId(null)
      if (editingId === id) {
        handleCloseModal()
      }
      showToast(t('productDeletedSuccess'))
      await refreshProducts()
    } catch (err) {
      console.error(err)
      showToast('Failed to delete product', 'error')
    }
  }

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmer?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter

    return matchesSearch && matchesCategory
  })

  // Statistics
  const totalListings = products.length
  const totalStockKg = products.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)
  const totalInventoryValue = products.reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.price) || 0),
    0
  )
  const uniqueCategories = new Set(products.map((p) => p.category)).size

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium transition-all transform duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span className="text-lg">{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero / Header */}
      <header className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white py-10 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-400/30 px-3 py-1 rounded-full text-xs tracking-wide uppercase font-semibold text-emerald-200 mb-3">
              <span>🌾 Member 1: Farmer Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t('farmerTitle')}
            </h1>
            <p className="text-emerald-100 text-base max-w-2xl mt-2">
              {t('farmerSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-emerald-50 active:scale-95 transition-all text-sm cursor-pointer"
            >
              <span className="text-lg">➕</span>
              <span>{t('addNewProduct')}</span>
            </button>
            <span className="inline-flex items-center gap-1.5 bg-emerald-900/50 border border-emerald-500/40 text-emerald-100 font-medium px-4 py-3 rounded-xl text-sm">
              <span>📋</span>
              <span>{totalListings} {t('myListings')}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Quick Stats Grid */}
        <section aria-label="Farmer Statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl shrink-0">
              📦
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">{t('totalListings')}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">{totalListings}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-2xl shrink-0">
              ⚖️
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">{t('totalQuantity')}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">
                {totalStockKg.toLocaleString()} <span className="text-xs font-normal text-slate-700">units</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">
              💰
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">{t('totalValue')}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">
                Rs. {totalInventoryValue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl shrink-0">
              🏷️
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">{t('categoriesCount')}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">
                {uniqueCategories} <span className="text-xs font-normal text-slate-700">types</span>
              </p>
            </div>
          </div>
        </section>

        {/* Listings Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchListings')}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              )}
            </div>

            {/* "+ Add Product" quick button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-sm transition active:scale-95 cursor-pointer"
            >
              <span>➕</span>
              <span>{t('addNewProduct')}</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategoryFilter === 'All'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('catAll')}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{t(cat.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Listings Section Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>{t('myListings')}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {filteredProducts.length}
            </span>
          </h2>
          <span className="text-xs text-slate-700">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <div className="text-5xl mb-3">🌾</div>
            <h3 className="text-lg font-bold text-slate-700">
              {searchTerm || selectedCategoryFilter !== 'All'
                ? 'No matching products found'
                : t('noProductsFound')}
            </h3>
            <p className="text-sm text-slate-700 max-w-md mx-auto mt-1 mb-5">
              {searchTerm || selectedCategoryFilter !== 'All'
                ? 'Try clearing your search query or choosing another category filter.'
                : t('noProductsDesc')}
            </p>
            {searchTerm || selectedCategoryFilter !== 'All' ? (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategoryFilter('All')
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-md cursor-pointer"
              >
                ➕ {t('addNewProduct')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const categoryObj =
                CATEGORIES.find((c) => c.id === product.category) ||
                CATEGORIES[CATEGORIES.length - 1]

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryObj.badgeColor}`}
                      >
                        <span>{categoryObj.icon}</span>
                        <span>{product.category}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <span>📍</span>
                        <span>{product.location}</span>
                      </span>
                    </div>

                    {/* Product Name */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Stock & Total Value */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-700 block">Available Stock:</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {product.quantity} {product.unit || 'kg'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-700 block">Total Value:</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          Rs. {(Number(product.price) * Number(product.quantity)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Farmer Details */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <span>👨🌾</span>
                        <span className="truncate">{product.farmer || 'Farmer'}</span>
                      </div>
                      {product.contact && (
                        <a
                          href={`tel:${product.contact.replace(/\s+/g, '')}`}
                          className="hover:underline text-emerald-700 font-medium shrink-0 flex items-center gap-1"
                        >
                          <span>📞</span>
                          <span>{product.contact}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Price Tag and Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xl font-extrabold text-emerald-700">
                        Rs. {Number(product.price).toLocaleString()}
                      </div>
                      <span className="text-[11px] text-slate-700 font-medium">
                        per {product.unit || 'kg'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <span>✏️</span>
                        <span>{t('edit')}</span>
                      </button>

                      {deleteConfirmId === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          <span>🗑️</span>
                          <span>{t('delete')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* POPUP MODAL FOR ADD / EDIT PRODUCT */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal()
            }
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{editingId ? '✏️' : '🌾'}</span>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {editingId ? t('editProduct') : t('addNewProduct')}
                  </h2>
                  <p className="text-xs text-slate-700">
                    {editingId
                      ? 'Update the details of your active marketplace listing'
                      : 'Fill in the details below to list your harvest for buyers'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              {/* Quick Demo Fill Helper */}
              {!editingId && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900">
                  <p className="font-semibold mb-2 flex items-center gap-1.5 text-emerald-800">
                    <span>⚡ Quick Demo Fill:</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyDemoPreset(preset)}
                        className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 px-2.5 py-1.5 rounded-lg transition text-xs font-medium active:scale-95 cursor-pointer shadow-xs"
                      >
                        {preset.name.split(' ')[1] || preset.name} (Rs. {preset.price})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form */}
              <form id="product-modal-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Product Name */}
                <div>
                  <label
                    htmlFor={`${formId}-modal-name`}
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    {t('productName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formId}-modal-name`}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('productNamePlaceholder')}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                        : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.name}
                    </p>
                  )}
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`${formId}-modal-category`}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      {t('category')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`${formId}-modal-category`}
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {t(cat.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-modal-unit`}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      {t('unit')}
                    </label>
                    <select
                      id={`${formId}-modal-unit`}
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 cursor-pointer"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantity & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Quantity */}
                  <div>
                    <label
                      htmlFor={`${formId}-modal-quantity`}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      {t('quantity')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id={`${formId}-modal-quantity`}
                        type="number"
                        name="quantity"
                        min="1"
                        step="any"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="100"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition pr-14 focus:outline-none focus:ring-2 ${
                          errors.quantity
                            ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                            : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-700 font-medium select-none">
                        {formData.unit}
                      </span>
                    </div>
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {errors.quantity}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label
                      htmlFor={`${formId}-modal-price`}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      {t('price')} (Rs.) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-700 font-medium select-none">
                        Rs.
                      </span>
                      <input
                        id={`${formId}-modal-price`}
                        type="number"
                        name="price"
                        min="1"
                        step="any"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder={t('pricePlaceholder')}
                        className={`w-full pl-10 pr-14 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                          errors.price
                            ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                            : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-700 select-none">
                        /{formData.unit}
                      </span>
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {errors.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Batch Total Calculated Preview */}
                {formData.quantity && formData.price && !isNaN(formData.quantity) && !isNaN(formData.price) && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span>Estimated Total Listing Value:</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      Rs. {(Number(formData.quantity) * Number(formData.price)).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Location Selection */}
                <div>
                  <label
                    htmlFor={`${formId}-modal-location`}
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    {t('location')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${formId}-modal-location`}
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 cursor-pointer"
                  >
                    {SRI_LANKA_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        📍 {loc}
                      </option>
                    ))}
                  </select>

                  {formData.location === 'Other' && (
                    <input
                      type="text"
                      name="customLocation"
                      value={formData.customLocation}
                      onChange={handleChange}
                      placeholder={t('otherLocation')}
                      className={`mt-2 w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.location
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                          : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                    />
                  )}

                  {errors.location && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.location}
                    </p>
                  )}
                </div>

                {/* Farmer Name & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`${formId}-modal-farmer`}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      {t('farmerName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${formId}-modal-farmer`}
                      type="text"
                      name="farmer"
                      value={formData.farmer}
                      onChange={handleChange}
                      placeholder={t('farmerNamePlaceholder')}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                        errors.farmer
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                          : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                    />
                    {errors.farmer && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {errors.farmer}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-modal-contact`}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      {t('contactNumber')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${formId}-modal-contact`}
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder={t('contactPlaceholder')}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                        errors.contact
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                          : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                    />
                    {errors.contact && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {errors.contact}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor={`${formId}-modal-description`}
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    {t('description')}
                  </label>
                  <textarea
                    id={`${formId}-modal-description`}
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('descriptionPlaceholder')}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition cursor-pointer"
              >
                {t('cancelEdit')}
              </button>

              <button
                type="submit"
                form="product-modal-form"
                className={`flex items-center gap-2 py-2.5 px-6 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer ${
                  editingId
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                <span>{editingId ? '💾' : '🌾'}</span>
                <span>{editingId ? t('updateProduct') : t('addProduct')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
