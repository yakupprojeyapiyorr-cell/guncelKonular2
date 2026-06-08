import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../lib/api'
import { getApiErrorMessage } from '../lib/errors'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Sifreler eslesmiyor')
      setLoading(false)
      return
    }

    try {
      const { data } = await apiClient.post('/auth/register', {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: formData.password,
        role: 'STUDENT',
      })
      // Don't login yet - redirect to email verification
      navigate('/verify-email', {
        state: {
          email: formData.email,
          verificationCode: data.verificationCode,
          token: data.token,
        }
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Kayit basarisiz. Lutfen tekrar deneyin.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl p-8 sm:p-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3">
              Focus<span className="text-emerald-500">Flow</span>
            </h1>
            <p className="text-slate-400 font-medium">Hemen Uye Ol, Akisa Katil</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Ad</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                  placeholder="Adiniz"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Soyad</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                  placeholder="Soyadiniz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 ml-1">E-posta Adresi</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                placeholder="isim@ornek.com"
              />
            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Sifre</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  placeholder="********"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Sifre Tekrar</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  placeholder="********"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydol ve Basla'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
            <p className="text-slate-400 text-sm">
              Zaten hesabin var mi?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Giris Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
