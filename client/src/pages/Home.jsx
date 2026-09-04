import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user } = useAuth()
  const isBuyer = user?.role === 'buyer' || user?.role === 'customer'
  const isFarmer = user?.role === 'farmer'

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-green-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-100 blur-3xl opacity-50"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-emerald-100 blur-3xl opacity-50"></div>
        </div>

        <header className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-medium text-sm mb-8 border border-green-200">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            The Future of Agricultural Commerce
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            Empowering Farmers. <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              Connecting Buyers.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            AgriConnect is a streamlined marketplace bridging the gap between agriculture and commerce. List products, find the best matches, and trade directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            {isFarmer ? (
              <Link to="/products" className="group relative inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1 w-full sm:w-auto text-lg overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Manage Harvest 🌾
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </Link>
            ) : isBuyer ? (
              <Link to="/products" className="group relative inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1 w-full sm:w-auto text-lg overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Browse Produce 🛒
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </Link>
            ) : (
              <Link to="/products" className="group relative inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1 w-full sm:w-auto text-lg overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Start Selling 🌾
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </Link>
            )}
            <Link to="/search" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-semibold py-4 px-8 rounded-2xl shadow-sm transition-all hover:-translate-y-1 w-full sm:w-auto text-lg">
              Explore Market 🔎
            </Link>
          </div>
        </header>
      </div>

      {/* Best Match Highlight Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-slate-900 rounded-3xl p-1 relative overflow-hidden shadow-2xl shadow-slate-900/20 group hover:shadow-3xl transition-shadow duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="bg-slate-900 rounded-[22px] p-8 md:p-12 relative flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-semibold text-sm mb-6 border border-yellow-500/20">
                ⭐ Innovative Feature
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Smart "Best Match" Algorithm</h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Finding the right product is easier than ever. Search for specific requirements like <span className="text-white font-medium">"Tomato in Dambulla under Rs.200"</span> and our system will automatically highlight the best farmer match for your needs!
              </p>
            </div>
            
            <div className="flex-1 w-full max-w-md">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transform transition-transform duration-500 hover:scale-105 hover:-rotate-1">
                 <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/10">
                   <div>
                     <h3 className="font-bold text-xl text-yellow-400 flex items-center gap-2">⭐ Best Match</h3>
                     <p className="text-lg font-semibold text-white mt-1">Sunil Farm</p>
                   </div>
                   <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg shadow-green-500/30">
                     95% Match
                   </div>
                 </div>
                 <div className="space-y-3 text-slate-200">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🍅</div>
                     <div>
                       <p className="font-medium text-white">Tomato</p>
                       <p className="text-sm text-slate-400">180 kg available</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">💰</div>
                     <div>
                       <p className="font-medium text-white">Rs. 180 / kg</p>
                       <p className="text-sm text-slate-400">Great value</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">📍</div>
                     <div>
                       <p className="font-medium text-white">Dambulla</p>
                       <p className="text-sm text-slate-400">Central Province</p>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Everything you need to trade</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A comprehensive suite of tools built for farmers and buyers to connect seamlessly in a unified platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 group hover:-translate-y-2">
            <div className="bg-gradient-to-br from-green-100 to-green-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              {isBuyer ? '🛒' : '👨‍🌾'}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {isBuyer ? 'Fresh Marketplace' : 'Product Listing'}
            </h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {isBuyer
                ? 'Explore fresh farm harvests with transparent pricing, available stock, and direct contact with verified farmers.'
                : 'List your agricultural products with categories, quantities, pricing, and precise location details.'}
            </p>
            <Link to="/products" className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors">
              {isBuyer ? 'Browse produce' : 'Add a product'} 
              <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group hover:-translate-y-2">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              🔎
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Search</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">Find exactly what you need. Filter by category, location, and sort by price to discover the best deals.</p>
            <Link to="/search" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Search market 
              <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-purple-100 transition-all duration-300 group hover:-translate-y-2">
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              🤝
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Direct Ordering</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">Send purchase requests directly to farmers. Automatic price calculation and status tracking included.</p>
            <Link to="/requests" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors">
              View requests 
              <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300 group hover:-translate-y-2">
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              📊
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Unified Dashboard</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">Track your sales, pending requests, and overall activity with simple and intuitive real-time statistics.</p>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors">
              Open dashboard 
              <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <span className="text-3xl">🌾</span> AgriConnect
          </div>
          <div className="text-slate-500 text-sm flex gap-6">
            <Link to="/" className="hover:text-green-600 transition-colors">Terms</Link>
            <Link to="/" className="hover:text-green-600 transition-colors">Privacy</Link>
            <Link to="/" className="hover:text-green-600 transition-colors">Contact</Link>
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} AgriConnect. Empowering agriculture.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
