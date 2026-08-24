import { useApp } from '../context/AppContext'
import { X, AlertTriangle, CheckCircle, Info, WifiOff } from 'lucide-react'

/**
 * Toast Bildirim Bileşeni.
 * 
 * API çöktüğünde is_mock: true bayrağı ile kullanıcıya
 * zarif bir bildirim gösterir.
 */
export default function Toast() {
  const { toast, hideToast } = useApp()

  if (!toast) return null

  const typeStyles = {
    info: {
      bg: 'bg-blue-soft',
      border: 'border-blue-deep',
      icon: <Info size={18} />,
    },
    success: {
      bg: 'bg-accent-success/20',
      border: 'border-accent-success',
      icon: <CheckCircle size={18} />,
    },
    warning: {
      bg: 'bg-accent-warning/20',
      border: 'border-accent-warning',
      icon: <AlertTriangle size={18} />,
    },
    error: {
      bg: 'bg-accent-danger/20',
      border: 'border-accent-danger',
      icon: <AlertTriangle size={18} />,
    },
  }

  const style = typeStyles[toast.type] || typeStyles.info

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in w-[90%] max-w-md">
      <div
        className={`${style.bg} border-l-4 ${style.border} rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-medium)] flex items-start gap-3`}
      >
        {/* Mock veri uyarısı — özel ikon */}
        {toast.isMock ? (
          <WifiOff size={18} className="text-text-secondary mt-0.5 shrink-0" />
        ) : (
          <span className="text-text-secondary mt-0.5 shrink-0">{style.icon}</span>
        )}
        
        <p className="text-sm text-text-primary flex-1 leading-relaxed">
          {toast.message}
        </p>
        
        <button
          onClick={hideToast}
          className="text-text-muted hover:text-text-secondary transition-colors shrink-0"
          aria-label="Bildirimi kapat"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
