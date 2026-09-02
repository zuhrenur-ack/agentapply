import { useState } from 'react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #e8a0b0, #a0c4d8)' }}
        >
          <User size={13} />
          Giriş Yap
        </button>
        {showModal && <AuthModal onClose={() => setShowModal(false)} />}
      </>
    )
  }

  const initials = user.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #e8a0b0, #a0c4d8)' }}>
          {initials}
        </div>
        <ChevronDown size={12} className="text-text-muted" />
      </button>

      {showDropdown && (
        <>
          {/* Arka plan kapatıcı */}
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-10 z-20 w-48 bg-bg-secondary rounded-xl shadow-lg border border-rose-soft/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-rose-soft/20">
              <p className="text-xs text-text-muted">Giriş yapıldı</p>
              <p className="text-sm font-medium text-text-primary truncate">{user.email}</p>
            </div>
            <button
              onClick={() => { signOut(); setShowDropdown(false) }}
              className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Çıkış Yap
            </button>
          </div>
        </>
      )}
    </div>
  )
}
