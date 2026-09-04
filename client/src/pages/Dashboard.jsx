import { useEffect, useState } from 'react'
import { getProducts, getRequests } from '../api'
import { useLang } from '../context/LangContext'

function formatCurrency(amount) {
  const value = Number(amount) || 0
  return `Rs. ${value.toLocaleString('en-US')}`
}

function StatCard({ label, value, icon, accent, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
        active ? 'border-green-500 ring-2 ring-green-100' : 'border-slate-100'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${accent}`}>
        {icon}
      </div>
      <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </button>
  )
}

function StatusBadge({ status, t }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-600',
  }
  const labels = {
    pending: t('dashboard.pending'),
    accepted: t('dashboard.accepted'),
    rejected: t('dashboard.rejected'),
    cancelled: t('dashboard.cancelled'),
  }
  const key = (status || '').toLowerCase()
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
        styles[key] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {labels[key] ?? status}
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
  const [activePanel, setActivePanel] = useState(null) // { key: 'products'|'pending'|'accepted'|'all', label }

  function switchView(nextView) {
    setView(nextView)
    setActivePanel(null)
  }

  function togglePanel(key, label) {
    setActivePanel((prev) => (prev?.key === key ? null : { key, label }))
  }

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

  function requestTotal(r) {
    return Number(r.totalCost ?? r.total) || 0
  }

  function requestQty(r) {
    return r.quantity ?? r.qtyRequested ?? 0
  }

  const pendingCount = requests.filter((r) => (r.status || '').toLowerCase() === 'pending').length
  const acceptedCount = requests.filter((r) => (r.status || '').toLowerCase() === 'accepted').length
  const estimatedSales = requests
    .filter((r) => (r.status || '').toLowerCase() === 'accepted')
    .reduce((sum, r) => sum + requestTotal(r), 0)
  const totalEstimated = requests.reduce((sum, r) => sum + requestTotal(r), 0)

  // Requests already arrive most-recent-first from the API (Mongo sorts by
  // createdAt desc; the in-memory fallback unshifts new entries), so no
  // further sort is needed — ids aren't reliably numeric (Mongo ObjectIds).
  const recentActivity = requests.slice(0, 5)

  function getProductName(request) {
    if (request.productName) return request.productName
    const product = products.find((p) => String(p.id) === String(request.productId))
    return product ? product.name : t('dashboard.unknownProduct')
  }

  const pendingRequests = requests.filter((r) => (r.status || '').toLowerCase() === 'pending')
  const acceptedRequests = requests.filter((r) => (r.status || '').toLowerCase() === 'accepted')

  // Some cards summarize the same underlying list (e.g. "Estimated Sales" is
  // just accepted requests totalled up) — each still gets its own panel key
  // so clicking one doesn't collapse a different card's already-open panel.
  const panelItemsByKey = {
    productsListed: products,
    pendingRequests: pendingRequests,
    acceptedRequests: acceptedRequests,
    estimatedSales: acceptedRequests,
    requestsSent: requests,
    pendingBuyer: pendingRequests,
    acceptedBuyer: acceptedRequests,
    totalEstimated: requests,
  }
  const panelItems = panelItemsByKey[activePanel?.key]
  const isProductPanel = activePanel?.key === 'productsListed'

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('dashboard.title')}</h1>

      <div className="inline-flex bg-slate-100 rounded-full p-1 mb-8">
        <button
          type="button"
          onClick={() => switchView('farmer')}
          className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
            view === 'farmer' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('dashboard.farmerView')}
        </button>
        <button
          type="button"
          onClick={() => switchView('buyer')}
          className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
            view === 'buyer' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('dashboard.buyerView')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {view === 'farmer' ? (
          <>
            <StatCard
              label={t('dashboard.productsListed')}
              value={products.length}
              icon="📦"
              accent="bg-green-50 text-green-600"
              active={activePanel?.key === 'productsListed'}
              onClick={() => togglePanel('productsListed', t('dashboard.productsListed'))}
            />
            <StatCard
              label={t('dashboard.pendingRequests')}
              value={pendingCount}
              icon="⏳"
              accent="bg-emerald-50 text-emerald-600"
              active={activePanel?.key === 'pendingRequests'}
              onClick={() => togglePanel('pendingRequests', t('dashboard.pendingRequests'))}
            />
            <StatCard
              label={t('dashboard.acceptedRequests')}
              value={acceptedCount}
              icon="✅"
              accent="bg-teal-50 text-teal-600"
              active={activePanel?.key === 'acceptedRequests'}
              onClick={() => togglePanel('acceptedRequests', t('dashboard.acceptedRequests'))}
            />
            <StatCard
              label={t('dashboard.estimatedSales')}
              value={formatCurrency(estimatedSales)}
              icon="💰"
              accent="bg-lime-50 text-lime-600"
              active={activePanel?.key === 'estimatedSales'}
              onClick={() => togglePanel('estimatedSales', t('dashboard.estimatedSales'))}
            />
          </>
        ) : (
          <>
            <StatCard
              label={t('dashboard.requestsSent')}
              value={requests.length}
              icon="📦"
              accent="bg-green-50 text-green-600"
              active={activePanel?.key === 'requestsSent'}
              onClick={() => togglePanel('requestsSent', t('dashboard.requestsSent'))}
            />
            <StatCard
              label={t('dashboard.pending')}
              value={pendingCount}
              icon="⏳"
              accent="bg-emerald-50 text-emerald-600"
              active={activePanel?.key === 'pendingBuyer'}
              onClick={() => togglePanel('pendingBuyer', t('dashboard.pendingRequests'))}
            />
            <StatCard
              label={t('dashboard.accepted')}
              value={acceptedCount}
              icon="✅"
              accent="bg-teal-50 text-teal-600"
              active={activePanel?.key === 'acceptedBuyer'}
              onClick={() => togglePanel('acceptedBuyer', t('dashboard.acceptedRequests'))}
            />
            <StatCard
              label={t('dashboard.totalEstimated')}
              value={formatCurrency(totalEstimated)}
              icon="💰"
              accent="bg-lime-50 text-lime-600"
              active={activePanel?.key === 'totalEstimated'}
              onClick={() => togglePanel('totalEstimated', t('dashboard.totalEstimated'))}
            />
          </>
        )}
      </div>

      {activePanel && (
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-green-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">{activePanel.label}</h2>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="text-sm text-slate-500 hover:text-slate-800 font-medium px-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              {t('dashboard.close')} ✕
            </button>
          </div>

          {isProductPanel ? (
            panelItems.length === 0 ? (
              <p className="text-slate-500 text-center py-8">{t('dashboard.noProducts')}</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {panelItems.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-sm text-slate-500">
                        {product.category} · {product.location}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-slate-900">{formatCurrency(product.price)}</p>
                      <p className="text-sm text-slate-500">
                        {product.quantity} {product.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : panelItems.length === 0 ? (
            <p className="text-slate-500 text-center py-8">{t('dashboard.noRequests')}</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {panelItems.map((request) => (
                <div key={request.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{getProductName(request)}</p>
                    <p className="text-sm text-slate-500">
                      {t('dashboard.buyer')}: {request.buyer || '—'} · {t('quantity')}: {requestQty(request)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="font-semibold text-slate-900">{formatCurrency(requestTotal(request))}</p>
                    <StatusBadge status={request.status} t={t} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">{t('dashboard.recentActivity')}</h2>
        {recentActivity.length === 0 ? (
          <p className="text-slate-500 text-center py-8">{t('dashboard.noRequests')}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivity.map((request) => (
              <div key={request.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{getProductName(request)}</p>
                  <p className="text-sm text-slate-500">
                    {t('quantity')}: {requestQty(request)}
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
