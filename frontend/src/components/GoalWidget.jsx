import React, { useEffect, useState } from 'react'
import apiClient from '../lib/api'

export default function GoalWidget() {
  const [goals, setGoals] = useState([])

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data } = await apiClient.get('/goals/active')
        setGoals(data)
      } catch {
        console.error('Hedefler yuklenemedi')
      }
    }

    fetchGoals()
  }, [])

  return (
    <div className="bg-[#111620]/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 h-full shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">Hedef</span> Aktif Hedeflerim
        </h2>
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-sm font-bold">
          + Yeni
        </button>
      </div>

      <div className="space-y-6">
        {goals.length === 0 ? (
          <div className="py-10 text-center text-slate-500 italic">Henuz bir hedef belirlemedin.</div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="space-y-3 group">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{goal.type}</span>
                  <h3 className="text-white font-bold text-sm mt-1">
                    {goal.lessonName} - {goal.targetType}
                  </h3>
                </div>
                <span className="text-sm font-black text-white">
                  {goal.currentValue} / {goal.targetValue}
                </span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  style={{ width: `${goal.progressPercentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
