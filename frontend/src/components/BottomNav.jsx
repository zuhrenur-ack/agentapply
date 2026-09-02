import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Sparkles, User } from 'lucide-react'

/**
 * Alt Navigasyon Barı.
 * 
 * Mobil cihazlarda tek elle kullanımı kolaylaştıran
 * alt menü çubuğu. 3 ana sekme:
 * - Dashboard (Kanban Panosu)
 * - Başvurular
 * - AI Asistan
 */
const navItems = [
  {
    path: '/',
    label: 'Pano',
    icon: LayoutDashboard,
  },
  {
    path: '/applications',
    label: 'Başvurular',
    icon: FolderKanban,
  },
  {
    path: '/ai',
    label: 'AI Asistan',
    icon: Sparkles,
  },
  {
    path: '/profile',
    label: 'Profil',
    icon: User,
  },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/90 backdrop-blur-lg border-t border-rose-soft/50">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-[var(--radius-md)] transition-all duration-300 min-w-[72px] ${
                isActive
                  ? 'text-text-primary bg-rose-soft/60'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
              />
              <span className={`text-[11px] font-medium transition-all duration-300 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              
              {/* Aktif sayfa göstergesi */}
              {isActive && (
                <div className="absolute bottom-1 w-5 h-[3px] rounded-full bg-gradient-to-r from-rose-medium to-blue-medium" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* iPhone alt güvenli alan boşluğu */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
