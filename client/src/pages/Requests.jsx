import { useState } from 'react'

export default function Requests() {
  // Buyer ordering state
  const [orderQuantity, setOrderQuantity] = useState(20)
  const pricePerKg = 180
  const maxAvailable = 100
  const total = orderQuantity * pricePerKg

  // State for simulated requests to demonstrate the dashboard
  const [view, setView] = useState('buyer') // 'buyer' or 'farmer'

  const [activeRequests, setActiveRequests] = useState([
    { id: 1, type: 'sent', product: 'Tomato', emoji: '🍅', qty: 20, total: 3600, status: 'Pending', partner: 'Seller: Sunil Farm' },
    { id: 2, type: 'received', product: 'Carrot', emoji: '🥕', qty: 50, total: 11000, status: 'Pending', partner: 'Buyer: Nimal' }
  ])

  const handleSendRequest = () => {
    // Validate
    if (orderQuantity <= 0 || orderQuantity > maxAvailable) return;

    const newReq = {
      id: Date.now(),
      type: 'sent',
      product: 'Tomato',
      emoji: '🍅',
      qty: orderQuantity,
      total: total,
      status: 'Pending',
      partner: 'Seller: Sunil Farm'
    }
    setActiveRequests([newReq, ...activeRequests])
    
    // Switch to buyer view automatically to show the new request
    setView('buyer')
  }

  const updateStatus = (id, newStatus) => {
    setActiveRequests(reqs => 
      reqs.map(req => req.id === id ? { ...req, status: newStatus } : req)
    )
  }

  // Filter requests based on current dashboard view
  const displayedRequests = activeRequests.filter(req => req.type === (view === 'buyer' ? 'sent' : 'received'))

  return (
    <div className="max-w-6xl mx-auto p-6 md:py-12">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-4 border border-blue-200">
          🤝 Direct Ordering
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Request & Order Management</h1>
        <p className="text-lg text-slate-600">Send purchase requests, calculate costs automatically, and manage incoming orders.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left Column: Create Order (Buyer) */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>🛒</span> New Purchase Request
          </h2>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group">
            {/* Product Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-slate-100 flex items-start justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
              <div className="flex gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">🍅</div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Tomato</h3>
                  <p className="text-slate-600 font-medium">Sunil Farm</p>
                </div>
              </div>
              <div className="text-right relative z-10">
                <div className="text-2xl font-bold text-green-600">Rs. {pricePerKg} <span className="text-sm font-normal text-slate-500">/ kg</span></div>
                <div className="text-sm font-medium text-slate-500 mt-1">Available: {maxAvailable} kg</div>
              </div>
            </div>

            <div className="p-8">
              {/* Quantity Input */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Required Quantity (kg)
                  </label>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Auto-calculates</span>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    min="1"
                    max={maxAvailable}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-32 text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all text-center"
                  />
                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
                     <div 
                       className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-300 rounded-full"
                       style={{ width: `${Math.min((orderQuantity / maxAvailable) * 100, 100)}%` }}
                     ></div>
                  </div>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                <div className="flex justify-between items-center mb-3 text-slate-600 font-medium">
                  <span>Price per kg</span>
                  <span>Rs. {pricePerKg.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 text-slate-600 font-medium">
                  <span>Quantity requested</span>
                  <span>x {orderQuantity} kg</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                  <span>Total Estimated Cost</span>
                  <span className="text-2xl text-green-600">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleSendRequest}
                disabled={orderQuantity <= 0 || orderQuantity > maxAvailable}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 text-lg"
              >
                Send Purchase Request <span>🚀</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Manage Requests (Toggle between Buyer/Farmer) */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>📋</span> Request Dashboard
            </h2>
            
            {/* View Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex font-medium text-sm shadow-inner self-start sm:self-auto">
              <button 
                onClick={() => setView('buyer')}
                className={`px-4 py-2 rounded-lg transition-all ${view === 'buyer' ? 'bg-white text-slate-900 shadow border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                My Sent Requests
              </button>
              <button 
                onClick={() => setView('farmer')}
                className={`px-4 py-2 rounded-lg transition-all ${view === 'farmer' ? 'bg-white text-slate-900 shadow border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                Received Orders
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {displayedRequests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <div className="text-5xl mb-4 opacity-50">📭</div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No requests found</h3>
                <p className="text-slate-500">You don't have any {view === 'buyer' ? 'sent' : 'received'} requests yet.</p>
              </div>
            ) : (
              displayedRequests.map((req) => (
                <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl bg-slate-50 border border-slate-100 w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm">
                        {req.emoji}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{req.product}</h4>
                        <p className="text-slate-500 text-sm font-medium">{req.partner}</p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                      req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm shadow-yellow-100' :
                      req.status === 'Accepted' ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm shadow-green-100' :
                      req.status === 'Cancelled' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-red-100 text-red-700 border border-red-200 shadow-sm shadow-red-100'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        req.status === 'Pending' ? 'bg-yellow-500 animate-pulse' :
                        req.status === 'Accepted' ? 'bg-green-500' :
                        req.status === 'Cancelled' ? 'bg-slate-400' :
                        'bg-red-500'
                      }`}></span>
                      {req.status}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 mb-5 grid grid-cols-2 gap-4 border border-slate-100">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity Requested</span>
                      <span className="font-bold text-slate-800 text-lg">{req.qty} kg</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Cost</span>
                      <span className="font-bold text-green-600 text-lg">Rs. {req.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === 'Pending' && (
                    <div className="flex gap-3">
                      {view === 'buyer' ? (
                        <button 
                          onClick={() => updateStatus(req.id, 'Cancelled')}
                          className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all active:scale-95"
                        >
                          Cancel Request
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => updateStatus(req.id, 'Accepted')}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-all shadow-md shadow-green-600/20 active:scale-95"
                          >
                            Accept Order
                          </button>
                          <button 
                            onClick={() => updateStatus(req.id, 'Rejected')}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100 active:scale-95"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {req.status !== 'Pending' && (
                    <div className="text-center py-2 text-sm text-slate-500 font-semibold bg-slate-50 rounded-lg">
                      This request has been {req.status.toLowerCase()}.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
