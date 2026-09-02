import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Sparkles, User, Globe } from 'lucide-react'

const navItems = [
  { path: '/',            label: 'Pano',     icon: LayoutDashboard },
  { path: '/applications',label: 'Başvurular',icon: FolderKanban },
  { path: '/discover',    label: 'Keşfet',   icon: Globe },
  { path: '/ai',          label: 'AI',       icon: Sparkles },
  { path: '/profile',     label: 'Profil',   icon: User },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-lg border-t border-rose-soft/50">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 flex-1 relative ${
                isActive
                  ? 'text-text-primary bg-rose-soft/60'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium leading-none truncate max-w-full px-1">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-4 h-[2px] rounded-full bg-gradient-to-r from-rose-medium to-blue-medium" />
              )}
            </button>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
