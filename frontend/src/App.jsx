import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import LessonsPage from './pages/LessonsPage'
import ExamPage from './pages/ExamPage'
import StatsPage from './pages/StatsPage'
import PomodoroPage from './pages/PomodoroPage'
import PlanPage from './pages/PlanPage'
import AdminPanel from './pages/AdminPanel'

// Layout
import Layout from './components/Layout'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons"
          element={
            <ProtectedRoute>
              <Layout>
                <LessonsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <Layout>
                <StatsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pomodoro"
          element={
            <ProtectedRoute>
              <Layout>
                <PomodoroPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <Layout>
                <PlanPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Layout>
                <AdminPanel />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

function normalizeStatus(status = {}) {
  return {
    ...EMPTY_STATUS,
    ...status,
    phase: status.phase || (status.running ? 'RUNNING' : status.currentTick > 0 ? 'PAUSED' : 'READY'),
  }
}

function buildMicroAlert(order) {
  return {
    id: order.id,
    title: `Yeni Siparis ${order.id}`,
    subtitle: `${order.customerNodeId} -> ${order.microDepotNodeId}`,
    meta: `${Number(order.demandVolume || 0).toFixed(2)} m3 · ${order.status || 'OLUSTU'}`,
  }
}

function buildCapacityDispatchAlert(dr) {
  const vid = dr.vehicleId || 'ARAC'
  return {
    id: `cap-${vid}-${dr.referenceId || 'ref'}`,
    type: 'dispatch',
    vehicleId: vid,
    title: `Dikkat: ${vid} %50+ kapasite`,
    subtitle: 'Cikis icin onay bekleniyor',
    meta: `Doluluk: ${((dr.loadFraction || 0) * 100).toFixed(0)}% · WAITING_FOR_APPROVAL`,
    actionLabel: 'HAREKET ET',
  }
}

export default function App() {
  const [tab, setTab] = useState('overview')
  const [simData, setSimData] = useState(INITIAL_SIM_DATA)
  const [routePreview, setRoutePreview] = useState(null)
  const [routeForm, setRouteForm] = useState({ sourceNodeId: '', targetNodeId: '', tollPenalty: 1 })
  const [reportPeriod, setReportPeriod] = useState('daily')
  const [tickStep, setTickStep] = useState(60)
  const [microAlerts, setMicroAlerts] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now())
  const [lastStatusSyncAt, setLastStatusSyncAt] = useState(() => Date.now())
  const seenOrderIds = useRef(new Set())
  const seenCapacityAlertKeys = useRef(new Set())
  const simDataRef = useRef(INITIAL_SIM_DATA)

  const {
    status,
    nodes,
    edges,
    products,
    inventory,
    orders,
    replenishments,
    vehicles,
    vehicleAssignments,
    dispatchReadiness,
    reports,
    timeline,
    summary,
    kpis,
  } = simData

  const defaultFrom = nodes[0]?.id || ''
  const defaultTo = nodes[Math.min(1, Math.max(0, nodes.length - 1))]?.id || defaultFrom
  const resolvedRouteForm = {
    ...routeForm,
    sourceNodeId: routeForm.sourceNodeId || defaultFrom,
    targetNodeId: routeForm.targetNodeId || defaultTo,
  }

  const registerMicroAlert = (order) => {
    if (!order?.id || !order?.microDepotNodeId || seenOrderIds.current.has(order.id)) {
      return
    }

    seenOrderIds.current.add(order.id)
    setMicroAlerts((current) => [buildMicroAlert(order), ...current].slice(0, 6))
  }

  const loadAll = useCallback(async (period = reportPeriod) => {
    try {
      const [
        statusResponse,
        nodesResponse,
        edgesResponse,
        productsResponse,
        inventoryResponse,
        ordersResponse,
        replenishmentsResponse,
        vehiclesResponse,
        kpisResponse,
        reportsResponse,
        assignmentsResponse,
        timelineResponse,
        summaryResponse,
        dispatchReadinessResponse,
      ] = await Promise.all([
        api.get('/api/simulation/status'),
        api.get('/api/graph/nodes'),
        api.get('/api/graph/edges'),
        api.get('/api/products'),
        api.get('/api/inventory'),
        api.get('/api/orders'),
        api.get('/api/replenishments'),
        api.get('/api/vehicles'),
        api.get('/api/metrics/kpis'),
        api.get('/api/vehicle-reports', { params: { period } }),
        api.get('/api/simulation/vehicle-assignments'),
        api.get('/api/simulation/timeline', { params: { limit: 80 } }),
        api.get('/api/simulation/summary'),
        api.get('/api/simulation/dispatch-readiness'),
      ])

      const nextStatus = normalizeStatus(statusResponse.data)
      const nextSimData = {
        status: nextStatus,
        nodes: [...nodesResponse.data].sort((left, right) => left.id.localeCompare(right.id)),
        edges: edgesResponse.data,
        products: productsResponse.data,
        inventory: inventoryResponse.data,
        orders: ordersResponse.data,
        replenishments: replenishmentsResponse.data,
        vehicles: vehiclesResponse.data,
        vehicleAssignments: assignmentsResponse.data,
        dispatchReadiness: dispatchReadinessResponse.data,
        reports: reportsResponse.data,
        timeline: timelineResponse.data,
        summary: summaryResponse.data,
        kpis: kpisResponse.data,
      }

      const previousStatus = simDataRef.current.status
      const shouldResyncClock =
        previousStatus.currentTick !== nextStatus.currentTick ||
        previousStatus.running !== nextStatus.running

      if (shouldResyncClock) {
        const now = Date.now()
        setLastStatusSyncAt(now)
        setCurrentTimeMs(now)
      }

      simDataRef.current = nextSimData
      setSimData(nextSimData)

      setMicroAlerts((current) => {
        const nextAlerts = []
        for (const dr of nextSimData.dispatchReadiness || []) {
          if (!dr.capacityApprovalPending || !dr.vehicleId) {
            continue
          }
          const dedupeKey = `${dr.vehicleId}-${dr.referenceId || ''}`
          if (seenCapacityAlertKeys.current.has(dedupeKey)) {
            continue
          }
          seenCapacityAlertKeys.current.add(dedupeKey)
          nextAlerts.push(buildCapacityDispatchAlert(dr))
        }
        for (const order of nextSimData.orders) {
          if (seenOrderIds.current.has(order.id)) {
            continue
          }

          seenOrderIds.current.add(order.id)
          if (order.microDepotNodeId) {
            nextAlerts.push(buildMicroAlert(order))
          }
        }

        return [...nextAlerts.reverse(), ...current].slice(0, 8)
      })

      setError('')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Veriler alinamadi')
    }
  }, [reportPeriod])

  useEffect(() => {
    simDataRef.current = simData
  }, [simData])

  useEffect(() => {
    void loadAll(reportPeriod)
    const timer = window.setInterval(() => void loadAll(reportPeriod), SNAPSHOT_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [loadAll])

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTimeMs(Date.now()), SIMULATION_MS_PER_TICK)
    return () => window.clearInterval(timer)
  }, [])

  const progress = useMemo(
    () => (status.maxTicks > 0 ? Math.min(100, Math.round((status.currentTick / status.maxTicks) * 100)) : 0),
    [status],
  )

  const effectivePhase = status.phase || (status.running ? 'RUNNING' : status.currentTick > 0 ? 'PAUSED' : 'READY')
  const systemStatusLabel = {
    RUNNING: 'Calisiyor',
    ERROR: 'Hata',
    COMPLETED: 'Tamamlandi',
    PAUSED: 'Beklemede',
  }[effectivePhase] || 'Hazir'

  const visibleError = error || (effectivePhase === 'ERROR'
    ? `${status.errorMessage || 'Simulasyon beklenmeyen bir hata nedeniyle durdu.'}${Number(status.failureTick) >= 0 ? ` (${status.failureTick}. dakika)` : ''}. Lutfen once Sifirla ile sistemi temizleyin.`
    : '')

  const liveTick = useMemo(() => {
    if (!status.running) {
      return Number(status.currentTick || 0)
    }

    const elapsed = Math.max(0, currentTimeMs - lastStatusSyncAt)
    return Number(status.currentTick || 0) + Math.floor(elapsed / SIMULATION_MS_PER_TICK)
  }, [currentTimeMs, lastStatusSyncAt, status.currentTick, status.running])

  const simulationClock = useMemo(() => {
    const base = new Date('2026-03-29T08:00:00')
    base.setMinutes(base.getMinutes() + liveTick)
    return base
  }, [liveTick])

  const doAction = async (label, fn) => {
    try {
      await fn()
      setMessage(label)
      setError('')
      await loadAll()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Islem basarisiz')
    }
  }

  const loadRoute = () =>
    doAction('Rota onizlemesi hazirlandi', async () => {
      const response = await api.get('/api/graph/route', {
        params: {
          sourceNodeId: resolvedRouteForm.sourceNodeId,
          targetNodeId: resolvedRouteForm.targetNodeId,
          tollPenalty: Number(resolvedRouteForm.tollPenalty),
        },
      })
      setRoutePreview(response.data)
    })

  const advanceSimulation = () => {
    if (status.running) {
      setError('Simulasyon calisirken dakika ileri alinmaz. Once Durdur, sonra zamani ilerlet.')
      return
    }

    void doAction(`Simulasyon ${tickStep} dakika ileri alindi`, () =>
      api.post('/api/simulation/advance', null, { params: { ticks: tickStep } }),
    )
  }

  const shared = {
    api,
    nodes,
    edges,
    products,
    inventory,
    orders,
    replenishments,
    vehicles,
    vehicleAssignments,
    dispatchReadiness,
    reports,
    timeline,
    summary,
    reportPeriod,
    setReportPeriod,
    kpis,
    status,
    progress,
    routePreview,
    routeForm: resolvedRouteForm,
    setRouteForm,
    loadRoute,
    doAction,
    registerMicroAlert,
    simulationMsPerTick: SIMULATION_MS_PER_TICK,
    lastStatusSyncAt,
    simulationClock,
  }

  return (
    <Shell>
      <PageHeader
        title="Sehir Lojistik Kontrol Merkezi"
        subtitle="Mikro depo karsilama, replenishment ve filo hareketleri tek panelde."
        status={systemStatusLabel}
      >
        <ActionButton onClick={() => doAction('Simulasyon baslatildi', () => api.post('/api/simulation/start'))}>
          ▶ Baslat
        </ActionButton>
        <ActionButton onClick={() => doAction('Simulasyon durduruldu', () => api.post('/api/simulation/stop'))} variant="secondary">
          ⏸ Durdur
        </ActionButton>
        <ActionButton onClick={() => doAction('Simulasyon sifirlandi', () => api.post('/api/simulation/reset'))} variant="secondary">
          ↺ Sifirla
        </ActionButton>
        <div className="flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-[#111620] px-3 py-1.5">
          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Dakika</span>
          <input
            type="number"
            min="1"
            value={tickStep}
            onChange={(event) => setTickStep(Math.max(1, Number(event.target.value) || 1))}
            className="w-16 bg-transparent text-[13px] font-semibold text-white outline-none tabular-nums"
          />
        </div>
        <ActionButton onClick={advanceSimulation} variant="accent">
          +{tickStep} dk
        </ActionButton>
        <ClockPanel
          label="Operasyon Saati"
          value={simulationClock.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        />
      </PageHeader>

      <div className="mt-4 flex gap-1.5">
        {tabs.map((item) => (
          <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>
            <span className="mr-1.5 opacity-60">{item.icon}</span>
            {item.label}
          </TabButton>
        ))}
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {visibleError && <Notice tone="error">{visibleError}</Notice>}

      <AlertTicker
        title="Mikro Depo Siparis Akisi"
        items={microAlerts}
        emptyMessage="Yeni siparis dustugunde burada bildirim karti belirecek."
        onAction={(item) => {
          if (item.type === 'dispatch' && item.vehicleId) {
            if (window.confirm(`${item.vehicleId} araci yola ciksin mi?`)) {
              doAction(`${item.vehicleId} dispatch baslatildi`, () =>
                api.post('/api/simulation/dispatch-ready', null, { params: { vehicleId: item.vehicleId } })
              )
            }
          }
        }}
      />

      {tab === 'overview' && <OverviewScreen {...shared} />}
      {tab === 'map' && <MapScreen {...shared} />}
      {tab === 'operations' && <OperationsScreen {...shared} />}
      {tab === 'fleet' && <FleetScreen {...shared} />}
    </Shell>
  )
}
