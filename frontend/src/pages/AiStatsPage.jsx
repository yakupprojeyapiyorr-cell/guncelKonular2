import React, { useState, useEffect } from 'react'
import apiClient from '../lib/api'
import FocusTrendChart from '../components/FocusTrendChart'
import CategoryPieChart from '../components/CategoryPieChart'

export default function AiStatsPage() {
  const [stats, setStats] = useState(null)
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: userStats } = await apiClient.get('/stats/me')
      setStats(userStats)
    } catch (error) {
      console.error('Veriler yüklenirken hata oluştu:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchAi = async () => {
    setAiLoading(true)
    try {
      const totalFocusMinutes = Math.round((stats?.totalPomodoroHours || 0) * 60)
      const tasksCompleted = stats?.completedTasks ?? stats?.totalQuestions ?? 0
      const tasksPending = stats?.pendingTasks ?? 0

      const { data: aiData } = await apiClient.get(
        `/ai/suggestions?focusMinutes=${totalFocusMinutes}&completedTasks=${tasksCompleted}&pendingTasks=${tasksPending}`
      )
      setSuggestion(aiData.suggestion)
    } catch (error) {
      console.error('AI verisi yuklenemedi', error)
      setSuggestion('Yapay Zeka asistanına şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin.')
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Yükleniyor...</div>

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">AI Verimlilik Analizi</h1>
        <p className="text-slate-400 font-medium">Google Gemini altyapısı ile size özel odaklanma stratejileri</p>
      </div>

      <FocusTrendChart />

      <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] rounded-3xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Zaman Dağılımı (Kategoriler)</h3>
        <CategoryPieChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-6 rounded-2xl shadow-xl">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Toplam Odaklanma</h3>
            <p className="text-4xl font-black text-orange-400">{stats?.totalPomodoroHours?.toFixed(1) || 0} Saat</p>
          </div>

          <div className="bg-[#111620]/60 backdrop-blur-md border border-indigo-500/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-indigo-400/80 text-xs font-bold uppercase tracking-wider mb-2">Tamamlanan Görev</h3>
            <p className="text-4xl font-black text-white">
              {stats?.completedTasks ?? stats?.totalQuestions ?? 0}{' '}
              <span className="text-sm font-medium text-slate-500">adet</span>
            </p>
          </div>

          <div className="bg-[#111620]/60 backdrop-blur-md border border-rose-500/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-rose-400/80 text-xs font-bold uppercase tracking-wider mb-2">Bekleyen Görev</h3>
            <p className="text-4xl font-black text-white">
              {stats?.pendingTasks ?? 0}{' '}
              <span className="text-sm font-medium text-slate-500">adet</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#1A237E]/40 to-[#111620] backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-8 shadow-2xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Powered by Gemini
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-3xl">✨</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">FocusFlow AI Asistan</h2>
                <p className="text-indigo-300/80 text-sm">Gerçek zamanlı verimlilik analizi</p>
              </div>
              <button
                onClick={handleFetchAi}
                disabled={aiLoading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
              >
                {aiLoading ? 'Analiz Ediliyor...' : 'Analizi Başlat'}
              </button>
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 relative flex flex-col justify-center min-h-[200px]">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                  {suggestion === '' ? (
                    <p className="text-indigo-300 text-sm text-center">Analizi başlatmak için yukarıdaki butona tıklayın.</p>
                  ) : (
                    <>
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-indigo-300 text-sm">Gemini AI modelinden tavsiyeler alınıyor...</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-slate-200 leading-relaxed text-lg whitespace-pre-wrap animate-fadeUp">
                  {suggestion || 'Analizi başlatmak için yukarıdaki butona tıklayın.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
