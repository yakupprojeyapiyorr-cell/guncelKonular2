import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 6000,
})

const tabs = ['dashboard', 'vehicles', 'depots', 'orders', 'metrics']

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [status, setStatus] = useState({ running: false, currentTick: 0, maxTicks: 0 })
  const [kpis, setKpis] = useState({ totalOrders: 0, completedOrders: 0, totalDistance: 0, avgDeliveryTime: 0, depotStock: {} })
  const [vehicles, setVehicles] = useState([])
  const [orders, setOrders] = useState([])
  const [_nodes, setNodes] = useState([])
  const [_edges, setEdges] = useState([])
  const [metrics, setMetrics] = useState({
    distancePerVehicle: {},
    utilizationPerVehicle: {},
    depotDispatchCount: {},
    delayedOrders: 0,
    depotStockChanges: {},
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [statusRes, kpisRes, vehiclesRes, ordersRes, nodesRes, edgesRes, distanceRes, utilizationRes, dispatchRes, delayedRes, stockRes] = await Promise.all([
        api.get('/api/simulation/status'),
        api.get('/api/metrics/kpis'),
        api.get('/api/vehicles'),
        api.get('/api/orders'),
        api.get('/api/graph/nodes'),
        api.get('/api/graph/edges'),
        api.get('/api/metrics/distance-per-vehicle'),
        api.get('/api/metrics/utilization-per-vehicle'),
        api.get('/api/metrics/depot-dispatch-count'),
        api.get('/api/metrics/delayed-orders'),
        api.get('/api/metrics/depot-stock-changes'),
      ])
      setStatus(statusRes.data)
      setKpis(kpisRes.data)
      setVehicles(vehiclesRes.data)
      setOrders(ordersRes.data)
      setNodes(nodesRes.data)
      setEdges(edgesRes.data)
      setMetrics({
        distancePerVehicle: distanceRes.data,
        utilizationPerVehicle: utilizationRes.data,
        depotDispatchCount: dispatchRes.data,
        delayedOrders: delayedRes.data,
        depotStockChanges: stockRes.data,
      })
      setError('')
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'API yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    const timer = window.setInterval(loadAll, 3500)
    return () => window.clearInterval(timer)
  }, [])

  const progress = useMemo(() => {
    if (status.maxTicks <= 0) return 0
    return Math.min(100, Math.round((status.currentTick / status.maxTicks) * 100))
  }, [status])

  const rowsVehicles = useMemo(() => vehicles.map((v) => ({
    ...v,
    utilization: metrics.utilizationPerVehicle[v.id] || 0,
    distance: metrics.distancePerVehicle[v.id] || 0,
  })), [vehicles, metrics])

  const rowsOrders = useMemo(() => orders.map((o) => ({
    ...o,
    deliveryTime: o.deliveryTime || 'N/A',
  })), [orders])

  const chartData = useMemo(() => {
    return Object.entries(metrics.distancePerVehicle || {}).map(([vehicleId, value]) => ({ vehicleId, distance: Number(value) }))
  }, [metrics.distancePerVehicle])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex h-screen">
        <aside className="w-72 border-r border-slate-300 bg-white p-4">
          <h1 className="mb-4 text-2xl font-bold">TezProjesi Dashboard</h1>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`mb-2 w-full text-left rounded px-3 py-2 font-semibold ${activeTab === t ? 'bg-sky-100 text-sky-900' : 'hover:bg-slate-100'}`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
          <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-2 text-sm">
            <p>Durum: <strong>{status.running ? 'Running' : 'Idle'}</strong></p>
            <p>Tick: {status.currentTick} / {status.maxTicks}</p>
            <p>Progres: {progress}%</p>
            <p>Geçikmiş: {metrics.delayedOrders}</p>
          </div>
          <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-2 text-sm">
            <p>KPI (Toplam):</p>
            <p>Order: {kpis.totalOrders}</p>
            <p>Completed: {kpis.completedOrders}</p>
            <p>Distance: {kpis.totalDistance.toFixed(1)} km</p>
            <p>Avg time: {kpis.avgDeliveryTime.toFixed(2)} tick</p>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-4">
          {error && <div className="mb-3 rounded border border-rose-300 bg-rose-50 p-3 text-rose-700">{error}</div>}
          {loading && <div className="mb-3 rounded border border-blue-300 bg-blue-50 p-3 text-blue-700">Yükleniyor...</div>}

          {activeTab === 'dashboard' && (
            <section>
              <h2 className="text-xl font-bold mb-3">Dashboard</h2>
              <div className="mb-4 h-6 overflow-hidden rounded bg-slate-200">
                <div className="h-full bg-sky-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded border bg-white p-3">Toplam Sipariş: <strong>{kpis.totalOrders}</strong></div>
                <div className="rounded border bg-white p-3">Tamamlanan: <strong>{kpis.completedOrders}</strong></div>
                <div className="rounded border bg-white p-3">Geçikme: <strong>{metrics.delayedOrders}</strong></div>
                <div className="rounded border bg-white p-3">Toplam Mesafe: <strong>{kpis.totalDistance.toFixed(1)} km</strong></div>
              </div>
            </section>
          )}

          {activeTab === 'vehicles' && (
            <section>
              <h2 className="text-xl font-bold mb-3">Araçlar</h2>
              <div className="overflow-auto rounded border bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Durum</th>
                      <th className="px-3 py-2">Lokasyon</th>
                      <th className="px-3 py-2">Yük</th>
                      <th className="px-3 py-2">Mesafe</th>
                      <th className="px-3 py-2">Utilizasyon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsVehicles.map((v) => (
                      <tr key={v.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{v.id}</td>
                        <td className="px-3 py-2">{v.status}</td>
                        <td className="px-3 py-2">{v.locationNodeId}</td>
                        <td className="px-3 py-2">{v.currentLoad}/{v.capacityVolume}</td>
                        <td className="px-3 py-2">{v.distance.toFixed(1)}</td>
                        <td className="px-3 py-2">{Math.round(v.utilization || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'depots' && (
            <section>
              <h2 className="text-xl font-bold mb-3">Depolar</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(kpis.depotStock || {}).map(([id, stock]) => (
                  <div key={id} className="rounded border bg-white p-3">
                    <p className="text-sm text-slate-500">Depo</p>
                    <p className="text-lg font-semibold">{id}</p>
                    <p>Stok: {stock}</p>
                  </div>
                ))}
              </div>
              <h3 className="mt-4 text-lg font-semibold">Depot dispatch</h3>
              <ul className="list-disc pl-5">
                {Object.entries(metrics.depotDispatchCount || {}).map(([id, count]) => (
                  <li key={id}>{id}: {count} dispatch</li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'orders' && (
            <section>
              <h2 className="text-xl font-bold mb-3">Siparişler</h2>
              <div className="overflow-auto rounded border bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Depot</th>
                      <th className="px-3 py-2">Hacim</th>
                      <th className="px-3 py-2">Durum</th>
                      <th className="px-3 py-2">Araç</th>
                      <th className="px-3 py-2">Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsOrders.map((o) => (
                      <tr key={o.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{o.id}</td>
                        <td className="px-3 py-2">{o.microDepotNodeId}</td>
                        <td className="px-3 py-2">{o.demandVolume}</td>
                        <td className="px-3 py-2">{o.status}</td>
                        <td className="px-3 py-2">{o.assignedVehicleId || '-'}</td>
                        <td className="px-3 py-2">{o.deliveryTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'metrics' && (
            <section>
              <h2 className="text-xl font-bold mb-3">Metrikler</h2>
              <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                <div className="h-72 rounded border bg-white p-3">
                  <h3 className="mb-2 text-base font-semibold">Mesafe / araç</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vehicleId" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="distance" fill="#2563EB" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-72 rounded border bg-white p-3">
                  <h3 className="mb-2 text-base font-semibold">Utilizasyon - araç</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={Object.entries(metrics.utilizationPerVehicle || {}).map(([id, val]) => ({ vehicleId: id, utilization: Number(val) }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vehicleId" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="utilization" stroke="#22C55E" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded border bg-white p-3">Depot stok değişimi: <strong>{Object.values(metrics.depotStockChanges).reduce((acc, v) => acc + Number(v), 0)}</strong></div>
                <div className="rounded border bg-white p-3">Dispatch sayısı: <strong>{Object.values(metrics.depotDispatchCount).reduce((acc, v) => acc + Number(v), 0)}</strong></div>
                <div className="rounded border bg-white p-3">Toplam utilization: <strong>{Object.values(metrics.utilizationPerVehicle).reduce((acc, v) => acc + Number(v), 0)}</strong></div>
                <div className="rounded border bg-white p-3">Geciken: <strong>{metrics.delayedOrders}</strong></div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
