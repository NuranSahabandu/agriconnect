import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import { LangProvider, useLang } from './context/LangContext'
import Home from './pages/Home'
import Products from './pages/Products'
import Search from './pages/Search'
import Requests from './pages/Requests'
import Dashboard from './pages/Dashboard'

function NavBar() {
  const { lang, toggleLang, t } = useLang()

  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-full font-medium transition-all duration-200 ${
      isActive
        ? 'bg-green-100 text-green-800 shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300 inline-block">🌾</span>
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-emerald-500 tracking-tight">
            AgriConnect
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={navLinkClasses}>Home</NavLink>
          <NavLink to="/products" className={navLinkClasses}>Products</NavLink>
          <NavLink to="/search" className={navLinkClasses}>{t('search')}</NavLink>
          <NavLink to="/requests" className={navLinkClasses}>Requests</NavLink>
          <NavLink to="/dashboard" className={navLinkClasses}>{t('myDashboard')}</NavLink>
        </div>

        {/* Action / Lang Toggle */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-700 transition-all font-semibold shadow-sm hover:shadow active:scale-95"
          >
            <span className="text-lg">🌍</span>
            {lang === 'en' ? 'සිංහල' : 'English'}
          </button>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden overflow-x-auto border-t border-slate-100 bg-white/50 backdrop-blur-md">
        <div className="flex p-3 gap-2 min-w-max">
          <NavLink to="/" className={navLinkClasses}>Home</NavLink>
          <NavLink to="/products" className={navLinkClasses}>Products</NavLink>
          <NavLink to="/search" className={navLinkClasses}>{t('search')}</NavLink>
          <NavLink to="/requests" className={navLinkClasses}>Requests</NavLink>
          <NavLink to="/dashboard" className={navLinkClasses}>{t('myDashboard')}</NavLink>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <NavBar />
          <main className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/search" element={<Search />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </LangProvider>
  )
}

export default App
