import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/api'

const PRIORITY_COLORS = {
  CRITICAL: 'border-red-500 bg-red-500/10 text-red-300',
  HIGH: 'border-amber-500 bg-amber-500/10 text-amber-300',
  MEDIUM: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
  LOW: 'border-slate-500 bg-slate-500/10 text-slate-400',
}

const PRIORITY_LABELS = {
  CRITICAL: 'Kritik',
  HIGH: 'Yüksek',
  MEDIUM: 'Orta',
  LOW: 'Düşük',
}

const DIFFICULTY_STARS = {
  EASY: '⭐',
  MEDIUM: '⭐⭐',
  HARD: '⭐⭐⭐',
}

function urgencyScore(task) {
  const p = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }[task.priority || 'MEDIUM']
  const d = { HARD: 0, MEDIUM: 1, EASY: 2 }[task.difficulty || 'MEDIUM']
  return p * 10 + d
}

export default function MostUrgentTasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await apiClient.get('/tasks')
        const urgent = data
          .filter((t) => !t.completed && !t.parentTaskId)
          .filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH')
          .sort((a, b) => urgencyScore(a) - urgencyScore(b))
          .slice(0, 5)
        setTasks(urgent)
      } catch (err) {
        console.error('Acil gorevler yuklenemedi:', err)
      } finally {
        setLoading(false)
      }
    }
    void fetchTasks()
  }, [])

  if (loading) {
    return (
      <div className="bg-[#111620]/60 border border-white/[0.08] rounded-3xl p-6 text-slate-500 text-sm">
        Yükleniyor...
      </div>
    )
  }

  return (
    <div className="bg-[#111620]/60 backdrop-blur-md border border-red-500/20 rounded-3xl p-6 shadow-2xl">
      <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
        🔴 En Acil Görevler
      </h2>

      {tasks.length === 0 ? (
        <p className="text-slate-500 text-sm">Kritik veya yüksek öncelikli bekleyen görev yok.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PRIORITY_COLORS[task.priority || 'MEDIUM']}`}>
                    {PRIORITY_LABELS[task.priority || 'MEDIUM']}
                  </span>
                  <span className="text-xs text-yellow-500">
                    {DIFFICULTY_STARS[task.difficulty || 'MEDIUM']}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/pomodoro', { state: { taskId: task.id } })}
                className="ml-3 opacity-70 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 p-2 bg-indigo-500/10 rounded-lg transition shrink-0"
                title="Odaklan"
              >
                ▶
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
