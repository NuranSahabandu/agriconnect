import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { LangProvider, useLang } from './context/LangContext'
import Home from './pages/Home'
import Products from './pages/Products'
import Search from './pages/Search'
import Requests from './pages/Requests'
import Dashboard from './pages/Dashboard'

function NavBar() {
  const { lang, toggleLang, t } = useLang()

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-800 hover:opacity-90">
          <span className="text-2xl">🌾</span>
          <span>AgriConnect</span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Marketplace
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-600">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition"
          >
            {t('home')}
          </Link>
          <Link
            to="/products"
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold transition flex items-center gap-1"
          >
            <span>👨🌾</span>
            <span>{t('products')}</span>
          </Link>
          <Link
            to="/search"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1"
          >
            <span>🔎</span>
            <span>{t('search')}</span>
          </Link>
          <Link
            to="/requests"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1"
          >
            <span>🤝</span>
            <span>{t('requests')}</span>
          </Link>
          <Link
            to="/dashboard"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1"
          >
            <span>📊</span>
            <span>{t('myDashboard')}</span>
          </Link>
        </div>

        {/* Language switch button */}
        <button
          type="button"
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
        >
          <span>🌐</span>
          <span>{lang === 'en' ? 'සිංහල' : 'English'}</span>
        </button>
      </div>
    </nav>
  )
}

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/search" element={<Search />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}

export default App
