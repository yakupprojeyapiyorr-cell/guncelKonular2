import React, { useEffect, useState } from 'react'
import apiClient from '../lib/api'

export default function StudyPlanCard() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await apiClient.get(`/plans?date=${today}`)
        setPlans(data)
      } catch (error) {
        console.error('Planlar yuklenemedi:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [today])

  const toggleComplete = async (plan) => {
    try {
      const { data } = await apiClient.put(`/plans/${plan.id}`, {
        ...plan,
        isCompleted: !plan.isCompleted,
      })
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? data : p)))
    } catch (error) {
      console.error('Plan guncellenemedi:', error)
    }
  }

  return (
    <div className="bg-[#111620]/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 h-full shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <span className="text-xl text-blue-400">Plan</span>
          </div>
          Gunun Calisma Plani
        </h2>
        <a href="/plans" className="text-sm font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
          Tumunu Gor
        </a>
      </div>

      <div className="space-y-4 relative z-10">
        {loading ? (
          <div className="py-10 text-center text-slate-500 animate-pulse">Planlar yukleniyor...</div>
        ) : plans.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <span className="text-4xl opacity-50 grayscale">Plan</span>
            <div>
              <p className="text-white font-bold">Bugun icin planin yok</p>
              <p className="text-slate-500 text-sm mt-1">Hemen bir calisma plani olustur!</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
              Plan Olustur +
            </button>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => toggleComplete(plan)}
              className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer group/item ${
                plan.isCompleted ? 'bg-emerald-500/5 border-emerald-500/10 opacity-70' : 'bg-[#0a0f18]/40 border-white/[0.05] hover:border-blue-500/30 hover:bg-blue-500/5'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                  plan.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-transparent group-hover/item:border-blue-500/50'
                }`}
              >
                <span className="text-xs font-bold">✓</span>
              </div>
              <div className="flex-1">
                <p className={`font-bold transition-all ${plan.isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>{plan.content}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bugun</span>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Onemli</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl border border-blue-500/20">
          <span className="text-2xl">AI</span>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">AI Tavsiyesi</p>
            <p className="text-slate-300 text-xs font-medium leading-relaxed">
              Bugun Turev konusuna odaklanman netlerini artirabilir. Basarilar!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
