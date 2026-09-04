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
    <nav className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/search">{t('search')}</Link>
        <Link to="/requests">Requests</Link>
        <Link to="/dashboard">{t('myDashboard')}</Link>
      </div>
      <button
        type="button"
        onClick={toggleLang}
        className="px-3 py-1 rounded bg-green-600 text-white text-sm"
      >
        {lang === 'en' ? 'සිංහල' : 'English'}
      </button>
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
