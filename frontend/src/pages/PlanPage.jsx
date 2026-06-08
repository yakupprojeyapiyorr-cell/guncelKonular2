import React, { useEffect, useMemo, useState } from 'react'
import apiClient from '../lib/api'

export default function PlanPage() {
  const [plans, setPlans] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [formData, setFormData] = useState({
    content: '',
    planDate: today,
  })

  useEffect(() => {
    void fetchPlans(today)
  }, [today])

  const fetchPlans = async (date) => {
    setLoading(true)
    setError('')

    try {
      const { data } = await apiClient.get(`/plans?date=${date}`)
      setPlans(data)
    } catch (err) {
      console.error('Planlar yuklenemedi:', err)
      setError('Planlar yuklenemedi. Lutfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlan = async () => {
    if (!formData.content.trim()) return

    setSaving(true)
    setError('')

    try {
      const { data } = await apiClient.post('/plans', formData)
      setPlans((prev) => [...prev, data].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')))
      setFormData({ content: '', planDate: today })
      setShowForm(false)
    } catch (err) {
      console.error('Plan eklenemedi:', err)
      setError('Plan eklenemedi. Lutfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  const toggleComplete = async (plan) => {
    try {
      const { data } = await apiClient.put(`/plans/${plan.id}`, {
        content: plan.content,
        planDate: plan.planDate,
        isCompleted: !plan.isCompleted,
      })
      setPlans((prev) => prev.map((item) => (item.id === plan.id ? data : item)))
    } catch (err) {
      console.error('Plan guncellenemedi:', err)
      setError('Plan guncellenemedi. Lutfen tekrar deneyin.')
    }
  }

  const deletePlan = async (id) => {
    try {
      await apiClient.delete(`/plans/${id}`)
      setPlans((prev) => prev.filter((plan) => plan.id !== id))
    } catch (err) {
      console.error('Plan silinemedi:', err)
      setError('Plan silinemedi. Lutfen tekrar deneyin.')
    }
  }

  const todayPlans = plans.filter((plan) => plan.planDate === today)
  const completedCount = plans.filter((plan) => plan.isCompleted).length

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">Calisma Plani</h1>
        <p className="text-slate-400 font-medium">Gunluk planlarini kaydet, tamamla ve ilerlemeni takip et.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold transition-all"
      >
        {showForm ? 'Formu Kapat' : 'Yeni Plan Ekle'}
      </button>

      {showForm && (
        <div className="bg-[#111620]/80 border border-white/[0.08] rounded-3xl shadow-2xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Tarih</label>
              <input
                type="date"
                value={formData.planDate}
                onChange={(e) => setFormData({ ...formData, planDate: e.target.value })}
                className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-2xl px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Plan Icerigi</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Orn: Matematik - turev ve integral tekrarini bitir..."
                className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-2xl px-4 py-3 h-28 outline-none"
              />
            </div>
            <button
              onClick={handleAddPlan}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-2xl font-bold transition-all"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#111620]/80 border border-white/[0.08] rounded-3xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Bugunun Planlari</h2>
        {loading ? (
          <p className="text-slate-500 text-center py-8">Planlar yukleniyor...</p>
        ) : todayPlans.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Bugun icin plan eklenmedi.</p>
        ) : (
          <div className="space-y-3">
            {todayPlans.map((plan) => (
              <div
                key={plan.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                  plan.isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-500'
                    : 'bg-[#0a0f18] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={plan.isCompleted}
                    onChange={() => toggleComplete(plan)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className={plan.isCompleted ? 'line-through' : 'text-white'}>{plan.content}</span>
                </div>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="text-rose-400 hover:text-rose-300 font-semibold ml-4"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {plans.length > 0 && (
        <div className="bg-[#111620]/80 border border-white/[0.08] rounded-3xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Plan Ozeti</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
              <h3 className="font-semibold text-slate-300">Toplam Plan</h3>
              <p className="text-2xl font-bold text-blue-400">{plans.length}</p>
            </div>
            <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
              <h3 className="font-semibold text-slate-300">Tamamlanan</h3>
              <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
            </div>
            <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
              <h3 className="font-semibold text-slate-300">Devam Eden</h3>
              <p className="text-2xl font-bold text-amber-400">{plans.length - completedCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
