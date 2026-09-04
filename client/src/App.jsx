import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import { LangProvider, useLang } from './context/LangContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Products from './pages/Products'
import Search from './pages/Search'
import Requests from './pages/Requests'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Login from './pages/Login'

function NavBar() {
  const { lang, toggleLang, t } = useLang()
  const { user, isAuthenticated, logout } = useAuth()

  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
      isActive
        ? 'bg-green-100 text-green-800 shadow-xs font-bold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300 inline-block">🌾</span>
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-emerald-500 tracking-tight">
            AgriConnect
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1.5">
          <NavLink to="/" className={navLinkClasses}>Home</NavLink>
          <NavLink to="/products" className={navLinkClasses}>Products</NavLink>
          <NavLink to="/search" className={navLinkClasses}>{t('search')}</NavLink>
          <NavLink to="/requests" className={navLinkClasses}>Requests</NavLink>
          <NavLink to="/dashboard" className={navLinkClasses}>{t('myDashboard')}</NavLink>
        </div>

        {/* Actions: User Auth & Lang Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 pl-3 pr-1.5 py-1 rounded-full text-xs">
              <span className="font-semibold text-emerald-900 truncate max-w-[120px] sm:max-w-[160px]">
                {user.role === 'farmer' ? '👨🌾' : '🛒'} {user.name}
              </span>
              <span className="capitalize font-bold text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                {user.role}
              </span>
              <button
                type="button"
                onClick={logout}
                className="ml-1 text-slate-500 hover:text-red-700 hover:bg-white p-1 rounded-full transition cursor-pointer text-xs font-bold"
                title="Sign out"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-full shadow-xs transition active:scale-95 cursor-pointer"
              >
                Register
              </Link>
            </div>
          )}

          {/* Lang Toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-700 transition-all text-xs font-semibold shadow-xs hover:shadow active:scale-95 cursor-pointer"
          >
            <span className="text-base">🌍</span>
            <span>{lang === 'en' ? 'සිංහල' : 'English'}</span>
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
          {!isAuthenticated && (
            <NavLink to="/register" className={navLinkClasses}>Register</NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <LangProvider>
      <AuthProvider>
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
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  )
}

export default App
