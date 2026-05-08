import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, setUser, token } = useAuthStore()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    examType: 'BOTH',
    targetTytNet: 80,
    targetAytNet: 60,
    dailyStudyHours: 6,
  })

  const handleSubmit = async () => {
    try {
      await apiClient.post('/profile/onboarding', formData)
      // Update user in authStore so ProtectedRoute won't redirect back
      setUser({ ...user, onboardingCompleted: true }, token)
      navigate('/dashboard')
    } catch {
      console.error('Onboarding failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-10 shadow-2xl relative z-10">
        <div className="mb-10">
          <div className="flex justify-between mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 mx-1 rounded-full transition-all ${step >= i ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>
          <h1 className="text-3xl font-black text-white">Hos Geldin!</h1>
          <p className="text-slate-400 mt-2 font-medium">Hedeflerini belirleyerek seruvene baslayalim.</p>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fadeUp">
            <h2 className="text-xl font-bold text-white mb-4">Hangi sinavlara hazirlaniyorsun?</h2>
            <div className="grid grid-cols-1 gap-4">
              {['TYT', 'AYT', 'BOTH'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, examType: type })}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.examType === type ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10'}`}
                >
                  <div className="font-black text-lg">{type === 'BOTH' ? 'TYT & AYT' : type}</div>
                  <p className="text-xs mt-1 opacity-60">{type === 'BOTH' ? 'Tum mufredati kapsayan tam hazirlik programi.' : 'Sadece sectigin sinav turune odaklan.'}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fadeUp">
            <h2 className="text-xl font-bold text-white mb-4">Net hedeflerin neler?</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Hedef TYT Neti ({formData.targetTytNet})</label>
                <input type="range" min="0" max="120" step="1" value={formData.targetTytNet} onChange={(e) => setFormData({ ...formData, targetTytNet: parseInt(e.target.value, 10) })} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Hedef AYT Neti ({formData.targetAytNet})</label>
                <input type="range" min="0" max="80" step="1" value={formData.targetAytNet} onChange={(e) => setFormData({ ...formData, targetAytNet: parseInt(e.target.value, 10) })} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
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
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">
              Geri
            </button>
          )}
          <button onClick={() => (step === 3 ? handleSubmit() : setStep(step + 1))} className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
            {step === 3 ? 'Baslayalim!' : 'Devam Et'}
          </button>
        </div>
      </div>
    </div>
  )
}
