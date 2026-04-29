import React, { useState } from 'react'

export default function PlanPage() {
  const [plans, setPlans] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    content: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleAddPlan = () => {
    if (formData.content.trim()) {
      setPlans([
        ...plans,
        {
          id: Date.now(),
          content: formData.content,
          date: formData.date,
          completed: false,
        },
      ])
      setFormData({ content: '', date: new Date().toISOString().split('T')[0] })
      setShowForm(false)
    }
  }

  const toggleComplete = (id) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p)))
  }

  const deletePlan = (id) => {
    setPlans(plans.filter((p) => p.id !== id))
  }

  const todayPlans = plans.filter((p) => p.date === new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Çalışma Planı</h1>
        <p className="text-gray-600">Günlük çalışma planınızı oluşturun ve takip edin</p>
      </div>

      {/* Add Plan Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
      >
        {showForm ? '✕ İptal' : '+ Yeni Plan Ekle'}
      </button>

      {/* Add Plan Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tarih</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Plan İçeriği</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Örn: Matematik - Türev ve İntegral konularını çalış..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              />
            </div>
            <button
              onClick={handleAddPlan}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Today's Plans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bugünün Planları</h2>
        {todayPlans.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Bugün için plan eklenmedi</p>
        ) : (
          <div className="space-y-3">
            {todayPlans.map((plan) => (
              <div
                key={plan.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition ${
                  plan.completed
                    ? 'bg-gray-50 border-gray-200 line-through text-gray-400'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={plan.completed}
                    onChange={() => toggleComplete(plan.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className={plan.completed ? 'line-through' : ''}>{plan.content}</span>
                </div>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="text-red-600 hover:text-red-900 font-semibold ml-4"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Plans Summary */}
      {plans.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tüm Planlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-700">Toplam Plan</h3>
              <p className="text-2xl font-bold text-blue-600">{plans.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-gray-700">Tamamlanan</h3>
              <p className="text-2xl font-bold text-green-600">{plans.filter((p) => p.completed).length}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h3 className="font-semibold text-gray-700">Devam Eden</h3>
              <p className="text-2xl font-bold text-orange-600">{plans.filter((p) => !p.completed).length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
