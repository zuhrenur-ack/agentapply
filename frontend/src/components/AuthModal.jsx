import { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) {
        setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.')
      } else {
        onClose()
      }
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message?.includes('already') ? 'Bu e-posta zaten kayıtlı.' : 'Kayıt sırasında bir hata oluştu.')
      } else {
        setMessage('Kayıt başarılı! E-postanı kontrol edip hesabını doğrula.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm bg-bg-secondary rounded-2xl shadow-2xl border border-rose-soft/30 overflow-hidden">
        {/* Başlık */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {mode === 'signin' ? '👋 Hoş Geldin' : '✨ Hesap Oluştur'}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {mode === 'signin' ? "AgentApply'e giriş yap" : 'Kariyer yolculuğuna başla'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-soft/30 transition-colors">
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          {/* E-posta */}
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              placeholder="E-posta adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-rose-soft/40 bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-medium/60 transition-colors"
            />
          </div>

          {/* Şifre */}
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Şifre (min. 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-9 pr-10 py-3 rounded-xl border border-rose-soft/40 bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-medium/60 transition-colors"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Hata / Mesaj */}
          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>
          )}
          {message && (
            <div className="px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-xs text-green-600">{message}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
            style={{ background: loading ? '#d4a5b0' : 'linear-gradient(135deg, #e8a0b0, #a0c4d8)' }}
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
            ) : mode === 'signin' ? (
              <><LogIn size={16} /> Giriş Yap</>
            ) : (
              <><UserPlus size={16} /> Kayıt Ol</>
            )}
          </button>

          {/* Mod değiştir */}
          <p className="text-center text-xs text-text-muted">
            {mode === 'signin' ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null) }}
              className="text-rose-medium font-medium hover:underline"
            >
              {mode === 'signin' ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
