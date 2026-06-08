import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import apiClient from '../lib/api'
import { useAuthStore } from '../store/authStore'
import AmbientSounds from '../components/AmbientSounds'
import TaskAttachmentsModal from '../components/TaskAttachmentsModal'
import FileViewer from '../components/FileViewer'

export default function PomodoroPage() {
  const location = useLocation()
  const { user, token } = useAuthStore()
  
  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('work')
  const [activeSessionId, setActiveSessionId] = useState(null)
  
  // Task integration
  const [tasks, setTasks] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState(location.state?.taskId || '')
  const [selectedCategory, setSelectedCategory] = useState('OTHER')
  const [showAttachments, setShowAttachments] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)

  const [stats, setStats] = useState({
    totalMinutesToday: 0,
    totalHours: 0,
    sessionsToday: 0,
  })
  const [error, setError] = useState('')

  const fetchTodayStats = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/pomodoro/stats/today')
      setStats(data)
    } catch (err) {
      console.error('Pomodoro istatistikleri yuklenemedi:', err)
    }
  }, [])

  const handleFileDownload = useCallback(async (fileUrl, fileName) => {
    try {
      const baseUrl = 'http://localhost:8080'
      const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
      const cleanBase = base.endsWith('/api') && fileUrl.startsWith('/api') ? base.slice(0, -4) : base
      const downloadUrl = `${cleanBase}${fileUrl}`
      
      const response = await fetch(downloadUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (!response.ok) {
        throw new Error(`İndirme başarısız: ${response.status}`)
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Dosya indir hatası:', error)
      alert('Dosya indirme hatası: ' + error.message)
    }
  }, [token])

  const finishCurrentSession = useCallback(async (durationMinutes, sessionIdOverride = activeSessionId) => {
    const sessionId = sessionIdOverride
    setIsRunning(false)

    if (!sessionId) {
      await fetchTodayStats()
      return
    }

    try {
      await apiClient.post(`/pomodoro/sessions/${sessionId}/end?durationMinutes=${durationMinutes}`)
      setActiveSessionId(null)
      await fetchTodayStats()
    } catch (err) {
      console.error('Pomodoro oturumu bitirilemedi:', err)
      setError('Pomodoro oturumu kaydedilemedi.')
    }
  }, [activeSessionId, fetchTodayStats])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          apiClient.get('/pomodoro/stats/today'),
          apiClient.get('/tasks')
        ])
        if (isMounted) {
          setStats(statsRes.data)
          setTasks(tasksRes.data.filter(t => !t.completed))
        }
      } catch (err) {
        console.error('Veriler yuklenemedi:', err)
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [])

  // Dosyaları seçilen görev değişince yükle
  useEffect(() => {
    if (!selectedTaskId) {
      setAttachments([])
      return
    }

    const fetchAttachments = async () => {
      try {
        const { data } = await apiClient.get(`/tasks/${selectedTaskId}/attachments`)
        setAttachments(data)
      } catch (error) {
        console.error('Dosyalar yüklenemedi:', error)
        setAttachments([])
      }
    }

    void fetchAttachments()
  }, [selectedTaskId])

  // useEffect for isRunning removed to prevent reset on pause

  useEffect(() => {
    if (!isRunning) return undefined

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          void finishCurrentSession(mode === 'work' ? workMinutes : breakMinutes, activeSessionId)
          const nextMode = mode === 'work' ? 'break' : 'work'
          setMode(nextMode)
          return nextMode === 'work' ? workMinutes * 60 : breakMinutes * 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, mode, activeSessionId, finishCurrentSession, workMinutes, breakMinutes])

  const startSession = async () => {
    if (mode !== 'work') {
      setIsRunning(true)
      return
    }

    try {
      if (!activeSessionId) {
        const queryParams = new URLSearchParams()
        if (selectedTaskId) queryParams.append('taskId', selectedTaskId)
        if (!selectedTaskId && selectedCategory) queryParams.append('category', selectedCategory)
        
        const params = queryParams.toString() ? `?${queryParams.toString()}` : ''
        const { data } = await apiClient.post(`/pomodoro/sessions/start${params}`)
        setActiveSessionId(data.id)
      }
      setIsRunning(true)
      setError('')
    } catch (err) {
      console.error('Pomodoro oturumu baslatilamadi:', err)
      setError('Pomodoro oturumu baslatilamadi.')
    }
  }

  const handlePause = async () => {
    setIsRunning(false)
    if (mode === 'work' && activeSessionId) {
      await finishCurrentSession(Math.max(1, Math.round(((workMinutes * 60) - timeLeft) / 60)))
    }
  }

  const handleReset = async () => {
    if (activeSessionId && mode === 'work') {
      await finishCurrentSession(Math.max(1, Math.round(((workMinutes * 60) - timeLeft) / 60)))
    } else {
      setIsRunning(false)
      setActiveSessionId(null)
    }

    setTimeLeft(workMinutes * 60)
    setMode('work')
  }

  // Demo/Test: Skip forward by 5 minutes
  const handleSkipForward = () => {
    const skipSeconds = 5 * 60 // 5 minutes
    setTimeLeft((prev) => Math.max(0, prev - skipSeconds))
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">Pomodoro</h1>
        <p className="text-slate-400 font-medium">25 dakika calis, 5 dakika mola ver ve oturumlarini sisteme kaydet.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Panel */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Ayarlar</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Hangi Görev Üzerinde Çalışıyorsunuz?</label>
                <select 
                  disabled={isRunning}
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" className="bg-[#111620] text-slate-400">Genel Odaklanma (Görev Yok)</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#111620]">{t.title}</option>
                  ))}
                </select>
              </div>

              {!selectedTaskId && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Çalışma Kategorisi</label>
                  <select 
                    disabled={isRunning}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SOFTWARE" className="bg-[#111620]">💻 Yazılım</option>
                    <option value="EDUCATION" className="bg-[#111620]">📚 Eğitim/Okul</option>
                    <option value="READING" className="bg-[#111620]">📖 Kitap/Okuma</option>
                    <option value="SPORT" className="bg-[#111620]">🏃‍♂️ Spor</option>
                    <option value="OTHER" className="bg-[#111620]">📌 Diğer</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Çalışma Süresi (Dk)</label>
                <input 
                  type="number"
                  min="1" max="120"
                  disabled={isRunning || user?.subscriptionType !== 'PREMIUM'}
                  value={workMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setWorkMinutes(val)
                    if (!isRunning && mode === 'work') setTimeLeft(val * 60)
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mola Süresi (Dk)</label>
                <input 
                  type="number"
                  min="1" max="30"
                  disabled={isRunning || user?.subscriptionType !== 'PREMIUM'}
                  value={breakMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setBreakMinutes(val)
                    if (!isRunning && mode === 'break') setTimeLeft(val * 60)
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white disabled:opacity-50"
                />
              </div>

              {user?.subscriptionType !== 'PREMIUM' && (
                <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                  Süreleri değiştirmek ve derin odak seslerini açmak için <Link to="/pricing" className="font-bold underline">Premium&apos;a Geçin</Link>
                </div>
              )}
            </div>
          </div>

          <AmbientSounds
            isPremium={user?.subscriptionType === 'PREMIUM'}
            isRunning={isRunning}
          />
        </div>

        {/* Timer Panel */}
        <div className="w-full md:w-2/3 bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl p-12 text-center flex flex-col justify-center">
        <div className={`text-8xl font-bold mb-6 ${mode === 'work' ? 'text-blue-400' : 'text-emerald-400'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-xl font-semibold mb-8 text-slate-300">{mode === 'work' ? 'Calisma Zamani' : 'Mola Zamani'}</div>

        <div className="flex gap-4 justify-center mb-6">
          <button onClick={startSession} disabled={isRunning} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-semibold transition">
            Basla
          </button>
          <button onClick={handlePause} disabled={!isRunning} className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-semibold transition">
            Duraklat
          </button>
          <button onClick={handleReset} className="bg-slate-600 hover:bg-slate-500 text-white px-8 py-3 rounded-2xl font-semibold transition">
            Sifirla
          </button>
          <button 
            onClick={handleSkipForward}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-semibold transition"
            title="Demo/Test: +5 min'i ilerle"
          >
            ⏩ +5 Min
          </button>
        </div>

          <div className="inline-block bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-semibold text-slate-300">
            {mode === 'work' ? 'Calisma Oturumu' : 'Mola Oturumu'}
            {selectedTaskId && mode === 'work' && ' (Görevde)'}
          </div>

          {selectedTaskId && mode === 'work' && (
            <button
              onClick={() => setShowAttachments(true)}
              className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-2xl font-semibold transition"
            >
              📎 Görev Dosyaları
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111620]/80 border border-white/[0.08] rounded-3xl shadow-2xl p-6">
          <h3 className="text-slate-500 text-sm font-semibold mb-2">Bugunun Oturumlari</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.sessionsToday}</p>
        </div>
        <div className="bg-[#111620]/80 border border-white/[0.08] rounded-3xl shadow-2xl p-6">
          <h3 className="text-slate-500 text-sm font-semibold mb-2">Bugun Toplam</h3>
          <p className="text-3xl font-bold text-emerald-400">{Number(stats.totalHours || 0).toFixed(1)}h</p>
        </div>
        <div className="bg-[#111620]/80 border border-white/[0.08] rounded-3xl shadow-2xl p-6">
          <h3 className="text-slate-500 text-sm font-semibold mb-2">Dakika</h3>
          <p className="text-3xl font-bold text-purple-400">{stats.totalMinutesToday}</p>
        </div>
      </div>

      {/* Görev Dosyaları Bölümü */}
      {selectedTaskId && attachments.length > 0 && (
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            📎 Görev Dosyaları
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map((att) => (
              <div
                key={att.id}
                onClick={() => setSelectedFile(att)}
                className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getFileIcon(att.fileType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate" title={att.fileName}>
                      {att.fileName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(att.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(att); }}
                    className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition font-medium flex items-center justify-center gap-2"
                  >
                    👁️ Görüntüle
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFileDownload(att.fileUrl, att.fileName); }}
                    className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition font-medium flex items-center justify-center gap-2"
                  >
                    📥 İndir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAttachments && selectedTaskId && (
        <TaskAttachmentsModal
          taskId={selectedTaskId}
          onClose={() => setShowAttachments(false)}
        />
      )}

      {selectedFile && (
        <FileViewer 
          file={selectedFile} 
          onClose={() => setSelectedFile(null)} 
        />
      )}
    </div>
  )
}

// Helper function to get file icon
function getFileIcon(fileType) {
  if (!fileType) return '📎'
  const type = fileType.toLowerCase()
  if (type.includes('pdf')) return '📄'
  if (type.includes('word') || type.includes('document')) return '📝'
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
  if (type.includes('image')) return '🖼️'
  if (type.includes('video')) return '🎥'
  return '📎'
}

// Helper function to get download URL
function getDownloadUrl(uri) {
  const baseUrl = 'http://localhost:8080'
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const cleanBase = base.endsWith('/api') && uri.startsWith('/api') ? base.slice(0, -4) : base
  return `${cleanBase}${uri}`
}
