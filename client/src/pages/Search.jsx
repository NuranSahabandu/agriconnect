import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api'

export default function Search() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All')
  const [maxPrice, setMaxPrice] = useState(1000)
  const [sortBy, setSortBy] = useState('default')

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProducts()
        setProducts(data || [])
      } catch (err) {
        console.error("Failed to fetch products:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Derived unique categories and locations for the dropdowns
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))]
  const locations = ['All', ...new Set(products.map(p => p.location).filter(Boolean))]

  // Filtering & Sorting Logic
  const processedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategory = category === 'All' || p.category === category
      const matchLocation = location === 'All' || p.location === location
      const matchPrice = p.price <= maxPrice
      
      return matchSearch && matchCategory && matchLocation && matchPrice
    })

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    }

    // Best Match Scoring Algorithm
    // Only calculate if the user is actually searching for something specific
    const isSearching = searchTerm.trim() !== '' || location !== 'All' || category !== 'All'
    
    if (isSearching) {
      filtered = filtered.map(p => {
        let score = 50 // Base score
        
        // Exact text matches give a huge boost
        if (searchTerm && p.name.toLowerCase() === searchTerm.toLowerCase()) score += 30
        else if (searchTerm && p.name.toLowerCase().includes(searchTerm.toLowerCase())) score += 15
        
        // Location matches
        if (location !== 'All' && p.location === location) score += 20
        
        // Price competitiveness (cheaper gives slightly better score)
        const priceRatio = p.price / maxPrice
        score += (1 - priceRatio) * 10 // Up to 10 points for being cheap
        
        // Availability bonus
        if (p.quantity > 50) score += 5
        
        return { ...p, matchScore: Math.min(Math.round(score), 99) }
      })
      
      // Sort by score if active, unless user explicitly wanted to sort by price
      if (sortBy === 'default') {
        filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      }
    } else {
      // Clean up score if not actively searching
      filtered = filtered.map(p => ({ ...p, matchScore: null }))
    }

    return filtered
  }, [products, searchTerm, category, location, maxPrice, sortBy])

  // Identify the single "Best Match" to highlight
  const bestMatchId = useMemo(() => {
    if (processedProducts.length === 0) return null
    if (searchTerm === '' && location === 'All' && category === 'All') return null
    
    const topProduct = processedProducts[0]
    return (topProduct.matchScore && topProduct.matchScore > 75) ? topProduct.id : null
  }, [processedProducts, searchTerm, location, category])

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold text-lg animate-pulse">Loading Marketplace...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:py-12 font-sans selection:bg-green-200">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
          <span>🔎</span> Discover Products
        </h1>
        <p className="text-lg text-slate-600">Find exactly what you need with our advanced matching algorithm.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-28">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span>🎛️</span> Filters
            </h2>
            
            <div className="space-y-6">
              {/* Search Text */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Search Term</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="e.g. Tomato..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Max Price Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700">Max Price (Rs)</label>
                  <span className="text-green-700 font-bold text-sm bg-green-50 px-2 py-0.5 rounded-md">
                    {maxPrice}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="5000" 
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium">
                  <span>Rs.50</span>
                  <span>Rs.5000+</span>
                </div>
              </div>
            </div>
            
            {/* Reset Button */}
            <button 
              onClick={() => {
                setSearchTerm(''); setCategory('All'); setLocation('All'); setMaxPrice(5000); setSortBy('default');
              }}
              className="w-full mt-8 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{processedProducts.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer text-sm shadow-sm"
              >
                <option value="default">Best Match</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {processedProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center">
              <span className="text-6xl mb-4 opacity-50">🌱</span>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
              <p className="text-slate-500 max-w-md">Try adjusting your search terms or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {processedProducts.map(product => {
                const isBestMatch = product.id === bestMatchId
                
                return (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative border ${
                      isBestMatch ? 'border-yellow-400 ring-4 ring-yellow-400/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Best Match Badge */}
                    {isBestMatch && (
                      <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 text-xs font-bold px-4 py-1.5 flex justify-between items-center z-10 shadow-sm">
                        <span className="flex items-center gap-1">⭐ Best Match</span>
                        <span className="bg-white/30 px-2 py-0.5 rounded-full">{product.matchScore}% Score</span>
                      </div>
                    )}
                    
                    <div className={`p-6 ${isBestMatch ? 'pt-10' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {product.category}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 mt-3 leading-tight">{product.name}</h3>
                        </div>
                      </div>
                      
                      <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">
                        {product.description || 'Fresh agricultural product directly from the farm.'}
                      </p>
                      
                      <div className="bg-slate-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4 border border-slate-100">
                        <div>
                          <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Price</span>
                          <span className="font-bold text-green-700 text-lg">Rs.{product.price} <span className="text-sm font-medium text-slate-500">/{product.unit}</span></span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock</span>
                          <span className="font-bold text-slate-800 text-lg">{product.quantity} <span className="text-sm font-medium text-slate-500">{product.unit}</span></span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mb-6">
                        <span className="text-slate-400">📍</span> {product.location}
                      </div>
                      
                      {/* Navigate to Requests page with product context - simple routing for demo */}
                      <Link 
                        to="/requests"
                        className={`block w-full text-center py-3 rounded-xl font-bold transition-all shadow-sm ${
                          isBestMatch 
                            ? 'bg-yellow-400 hover:bg-yellow-500 text-amber-950' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
