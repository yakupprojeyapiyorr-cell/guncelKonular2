import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../lib/api';
import { getApiErrorMessage } from '../lib/errors';
import { useAuthStore } from '../store/authStore';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  // Data passed from registration via navigation state
  const email = location.state?.email || '';
  const verificationCode = location.state?.verificationCode || '';
  const token = location.state?.token || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  
  const inputRefs = useRef([]);

  // Show the mock email notification after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(true);
      setTimeout(() => setToastVisible(true), 50);
      // Auto-hide after 12 seconds
      setTimeout(() => {
        setToastVisible(false);
        setTimeout(() => setShowToast(false), 500);
      }, 12000);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').split('').slice(0, 6);
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) newCode[index + i] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Lütfen 6 haneli kodu eksiksiz girin.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await apiClient.post('/auth/verify-email', {
        email: email,
        code: fullCode,
      });
      setSuccess(true);
      setUser(data, data.token);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      // Mock mode: if the typed code matches the mock code, simulate success
      if (verificationCode && fullCode === verificationCode) {
        setSuccess(true);
        // Assuming we need to just navigate if it's mock
        setTimeout(() => navigate('/dashboard'), 1500);
        return;
      }
      setError(getApiErrorMessage(err, 'Doğrulama başarısız. Lütfen kodu kontrol edin.'));
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : '***@***.com';

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Mock Email Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-sm transition-all duration-500 ${
            toastVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
        >
          <div className="bg-[#1a1f2e] border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/10 p-4 flex gap-3 items-start">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-xl">📧</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-400">Gelen Kutusu</span>
                <span className="text-[10px] text-slate-500">şimdi</span>
              </div>
              <p className="text-sm font-semibold text-white mb-0.5">FocusFlow E-posta Doğrulama</p>
              <p className="text-xs text-slate-400">
                Doğrulama kodunuz: <span className="font-mono font-bold text-emerald-400 text-sm tracking-widest">{verificationCode}</span>
              </p>
            </div>
            <button
              onClick={() => { setToastVisible(false); setTimeout(() => setShowToast(false), 500) }}
              className="text-slate-500 hover:text-white transition shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-4xl">✉️</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">E-postanı Doğrula</h1>
            <p className="text-slate-400 text-sm">
              <span className="font-semibold text-white">{maskedEmail}</span> adresine 6 haneli bir doğrulama kodu gönderdik.
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-emerald-400 mb-2">E-posta Doğrulandı!</h2>
              <p className="text-slate-400 text-sm">Yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <>
              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Code Input */}
              <form onSubmit={handleSubmit}>
                <div className="flex justify-center gap-3 mb-8">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                        digit
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-white/10 bg-white/5 text-white'
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30`}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? 'Doğrulanıyor...' : 'Doğrula ve Devam Et'}
                </button>
              </form>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-slate-500 text-xs">
                  💡 İpucu: Ekranın sağ üst köşesindeki bildirime bakın!
                </p>
                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                  <p className="text-slate-400 text-sm">
                    Geri dönmek istersen <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold">Giriş yap</a>.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
