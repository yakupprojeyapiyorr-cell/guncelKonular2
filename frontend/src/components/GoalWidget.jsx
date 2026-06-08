import React, { useEffect, useState } from 'react'
import apiClient from '../lib/api'

const GOAL_TYPES = [
  { value: 'DAILY', label: 'Günlük' },
  { value: 'WEEKLY', label: 'Haftalık' },
  { value: 'MONTHLY', label: 'Aylık' },
]

const TARGET_TYPES = [
  { value: 'STUDY_MINUTES', label: 'Çalışma Dakikası' },
  { value: 'QUESTION_COUNT', label: 'Tamamlanan Görev' },
]

export default function GoalWidget() {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'DAILY',
    targetType: 'STUDY_MINUTES',
    targetValue: 60,
  })
  const [saving, setSaving] = useState(false)

  const fetchGoals = async () => {
    try {
      const { data } = await apiClient.get('/goals/active')
      setGoals(data)
    } catch {
      console.error('Hedefler yuklenemedi')
    }
  }

  useEffect(() => {
    void fetchGoals()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const today = new Date()
      const end = new Date(today)
      if (form.type === 'DAILY') end.setDate(end.getDate() + 1)
      else if (form.type === 'WEEKLY') end.setDate(end.getDate() + 7)
      else end.setMonth(end.getMonth() + 1)

      const payload = {
        type: form.type,
        targetType: form.targetType,
        targetValue: Number(form.targetValue),
        startDate: today.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      }
      await apiClient.post('/goals', payload)
      setShowForm(false)
      setForm({ type: 'DAILY', targetType: 'STUDY_MINUTES', targetValue: 60 })
      await fetchGoals()
    } catch (err) {
      console.error('Hedef olusturulamadi:', err)
    } finally {
      setSaving(false)
    }
  }

  const targetLabel = (targetType) =>
    TARGET_TYPES.find((t) => t.value === targetType)?.label || targetType

  const progressWidth = (progressPercentage) =>
    `${Math.min(100, Math.max(0, Number(progressPercentage) || 0))}%`

  return (
    <div className="bg-[#111620]/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 h-full shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎯</span> Aktif Hedeflerim
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-sm font-bold"
        >
          {showForm ? 'İptal' : '+ Yeni'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Periyot</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full mt-1 bg-[#111620] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                {GOAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Hedef Türü</label>
              <select
                value={form.targetType}
                onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                className="w-full mt-1 bg-[#111620] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                {TARGET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Hedef Değer</label>
            <input
              type="number"
              min="1"
              value={form.targetValue}
              onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
              className="w-full mt-1 bg-[#111620] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-bold transition"
          >
            {saving ? 'Kaydediliyor...' : 'Hedef Oluştur'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {goals.length === 0 ? (
          <div className="py-10 text-center text-slate-500 italic">Henüz bir hedef belirlemedin.</div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="space-y-3 group">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{goal.type}</span>
                  <h3 className="text-white font-bold text-sm mt-1">
                    {targetLabel(goal.targetType)}
                  </h3>
                </div>
                <span className="text-sm font-black text-white">
                  {goal.currentValue} / {goal.targetValue}
                </span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  style={{ width: progressWidth(goal.progressPercentage) }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
