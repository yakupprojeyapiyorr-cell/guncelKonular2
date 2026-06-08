import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage } from '../lib/errors'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, setUser, token, logout } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    dailyStudyHours: 6,
  })

  useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate('/dashboard', { replace: true })
    }
  }, [user?.onboardingCompleted, navigate])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      await apiClient.post('/profile/onboarding', formData)
      setUser({ ...user, onboardingCompleted: true }, token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Onboarding basarisiz oldu. Lutfen tekrar deneyin.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-10 shadow-2xl relative z-10">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between items-start mb-10">
          <div className="flex-1 mr-4">
            <h1 className="text-3xl font-black text-white">Hos Geldin!</h1>
            <p className="text-slate-400 mt-2 font-medium">Hedeflerini belirleyerek seruvene baslayalim.</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-slate-400 hover:text-white transition-all text-xs font-bold bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/5"
          >
            Cikis Yap
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fadeUp">
            <h2 className="text-xl font-bold text-white mb-4">Gunde kac saat calisabilirsin?</h2>
            <div className="grid grid-cols-3 gap-4">
              {[2, 4, 6, 8, 10, 12].map((h) => (
                <button
                  key={h}
                  onClick={() => setFormData({ ...formData, dailyStudyHours: h })}
                  className={`p-6 rounded-2xl border-2 transition-all ${formData.dailyStudyHours === h ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10'}`}
                >
                  <span className="text-2xl font-black">{h}h</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between gap-4">
          <button onClick={() => handleSubmit()} disabled={loading} className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
            {loading ? 'Isleniyor...' : 'Baslayalim!'}
          </button>
        </div>
      </div>
    </div>
  )
}
