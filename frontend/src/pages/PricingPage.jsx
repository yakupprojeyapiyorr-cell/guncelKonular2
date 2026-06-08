import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function PricingPage() {
  const navigate = useNavigate()
  const { user, setUser, token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      // Mock payment simulation API call. In real life, redirect to Stripe
      await apiClient.post('/auth/upgrade-premium') // This endpoint might not exist yet, we'll create it
      
      // Update local storage user object
      setUser({ ...user, subscriptionType: 'PREMIUM' }, token)

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/' // reload to get new user object with PREMIUM
      }, 2000)
    } catch (error) {
      console.error('Yükseltme başarısız:', error)
      alert("Yükseltme işlemi başarısız oldu. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-12 animate-fadeUp">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-white mb-4">FocusFlow <span className="text-emerald-400">Premium</span></h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Dikkat dağıtıcıları tamamen engelleyin, sınırsız görev oluşturun ve AI destekli derin odaklanma analizlerine erişin.</p>
      </div>

      {success ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-8 rounded-3xl text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Tebrikler! 🎉</h2>
          <p className="text-lg">Premium paketiniz başarıyla aktif edildi. Ana sayfaya yönlendiriliyorsunuz...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FREE TIER */}
          <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 flex flex-col shadow-2xl">
            <h3 className="text-xl font-bold text-slate-300 mb-2">Başlangıç (Free)</h3>
            <div className="text-4xl font-black text-white mb-6">₺0 <span className="text-sm font-medium text-slate-500">/ ay</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Günde maksimum 5 görev ekleme" />
              <FeatureItem text="Standart 25/5 dakika Pomodoro" />
              <FeatureItem text="Sadece son 24 saatin odaklanma verisi" />
              <FeatureItem text="Sınırlı istatistikler" />
            </ul>

            <button 
              disabled={user?.subscriptionType !== 'PREMIUM'}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-2xl font-semibold transition disabled:opacity-50"
            >
              Mevcut Planınız
            </button>
          </div>

          {/* PREMIUM TIER */}
          <div className="bg-gradient-to-b from-[#1A237E]/40 to-[#111620] backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-8 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              En Popüler
            </div>
            <h3 className="text-xl font-bold text-indigo-300 mb-2">Premium (Sınırsız)</h3>
            <div className="text-4xl font-black text-white mb-6">₺75 <span className="text-sm font-medium text-indigo-300/50">/ ay</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Sınırsız görev ve proje klasörü" active={true} />
              <FeatureItem text="Sesli Asistan ve Özel Süreli Pomodoro" active={true} />
              <FeatureItem text="Derin Odak (Deep Focus) Modu" active={true} />
              <FeatureItem text="AI Destekli Haftalık/Aylık Raporlar" active={true} />
              <FeatureItem text="Reklamsız deneyim ve Premium temalar" active={true} />
            </ul>

            <button 
              onClick={handleUpgrade}
              disabled={loading || user?.subscriptionType === 'PREMIUM'}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 px-6 py-3 rounded-2xl font-semibold transition"
            >
              {loading ? 'İşleniyor...' : (user?.subscriptionType === 'PREMIUM' ? 'Zaten Premium Üyesiniz' : 'Premium\'a Yükselt')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureItem({ text, active = false }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 ${active ? 'text-indigo-400' : 'text-slate-500'}`}>
        ✓
      </span>
      <span className={active ? 'text-slate-200' : 'text-slate-400'}>{text}</span>
    </li>
  )
}
