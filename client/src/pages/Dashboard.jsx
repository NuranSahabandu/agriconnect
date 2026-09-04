import { useEffect, useState } from 'react'
import { getProducts, getRequests } from '../api'
import { useLang } from '../context/LangContext'

function formatCurrency(amount) {
  const value = Number(amount) || 0
  return `Rs. ${value.toLocaleString('en-US')}`
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${accent}`}>
        {icon}
      </div>
      <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function StatusBadge({ status, t }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  const labels = {
    pending: t('dashboard.pending'),
    accepted: t('dashboard.accepted'),
    rejected: t('dashboard.rejected'),
  }
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
        styles[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {labels[status] ?? status}
    </span>
  )
}

function Dashboard() {
  const { t } = useLang()
  const [products, setProducts] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('farmer')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [prods, reqs] = await Promise.all([getProducts(), getRequests()])
        if (!cancelled) {
          setProducts(prods)
          setRequests(reqs)
        }
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-24 text-slate-500">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
        <p>{t('dashboard.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-slate-600 max-w-md">{t('dashboard.error')}</p>
      </div>
    )
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length
  const estimatedSales = requests
    .filter((r) => r.status === 'accepted')
    .reduce((sum, r) => sum + (Number(r.total) || 0), 0)
  const totalEstimated = requests.reduce((sum, r) => sum + (Number(r.total) || 0), 0)

  const recentActivity = [...requests].sort((a, b) => b.id - a.id).slice(0, 5)

  function getProductName(productId) {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : t('dashboard.unknownProduct')
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('dashboard.title')}</h1>

      <div className="inline-flex bg-slate-100 rounded-full p-1 mb-8">
        <button
          type="button"
          onClick={() => setView('farmer')}
          className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
            view === 'farmer' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('dashboard.farmerView')}
        </button>
        <button
          type="button"
          onClick={() => setView('buyer')}
          className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
            view === 'buyer' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('dashboard.buyerView')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {view === 'farmer' ? (
          <>
            <StatCard
              label={t('dashboard.productsListed')}
              value={products.length}
              icon="📦"
              accent="bg-green-50 text-green-600"
            />
            <StatCard
              label={t('dashboard.pendingRequests')}
              value={pendingCount}
              icon="⏳"
              accent="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              label={t('dashboard.acceptedRequests')}
              value={acceptedCount}
              icon="✅"
              accent="bg-teal-50 text-teal-600"
            />
            <StatCard
              label={t('dashboard.estimatedSales')}
              value={formatCurrency(estimatedSales)}
              icon="💰"
              accent="bg-lime-50 text-lime-600"
            />
          </>
        ) : (
          <>
            <StatCard
              label={t('dashboard.requestsSent')}
              value={requests.length}
              icon="📦"
              accent="bg-green-50 text-green-600"
            />
            <StatCard
              label={t('dashboard.pending')}
              value={pendingCount}
              icon="⏳"
              accent="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              label={t('dashboard.accepted')}
              value={acceptedCount}
              icon="✅"
              accent="bg-teal-50 text-teal-600"
            />
            <StatCard
              label={t('dashboard.totalEstimated')}
              value={formatCurrency(totalEstimated)}
              icon="💰"
              accent="bg-lime-50 text-lime-600"
            />
          </>
        )}
      </div>

      <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">{t('dashboard.recentActivity')}</h2>
        {recentActivity.length === 0 ? (
          <p className="text-slate-500 text-center py-8">{t('dashboard.noRequests')}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivity.map((request) => (
              <div key={request.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{getProductName(request.productId)}</p>
                  <p className="text-sm text-slate-500">
                    {t('quantity')}: {request.qtyRequested}
                  </p>
                </div>
                <StatusBadge status={request.status} t={t} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
