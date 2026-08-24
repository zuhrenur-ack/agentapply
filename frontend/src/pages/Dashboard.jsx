import { Briefcase, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import AppCard from '../components/AppCard'

/**
 * Dashboard Sayfası — Kanban Panosu Özeti.
 * 
 * Başvuru durumlarının API verileriyle özet istatistikleri ve
 * son başvuruların kartlarını gösterir.
 */
export default function Dashboard() {
  const { applications, loading } = useApp()

  // Dinamik istatistik hesaplamaları
  const totalApps = applications.length || 0
  const appliedApps = applications.filter(a => a.status === 'applied').length || 0
  const waitingApps = applications.filter(a => a.status === 'planned').length || 0
  const interviewApps = applications.filter(a => a.status === 'interview').length || 0

  const statCards = [
    { label: 'Toplam', value: totalApps, icon: Briefcase, color: 'from-rose-soft to-rose-medium' },
    { label: 'Başvuruldu', value: appliedApps, icon: TrendingUp, color: 'from-blue-soft to-blue-medium' },
    { label: 'Bekleyen', value: waitingApps, icon: Clock, color: 'from-accent-warning/20 to-accent-warning/40' },
    { label: 'Mülakat', value: interviewApps, icon: CheckCircle, color: 'from-accent-success/20 to-accent-success/40' },
  ]

  // En son 3 başvuruyu al
  const recentApplications = applications.slice(0, 3)

  return (
    <div className="space-y-6 animate-slide-up pb-6">
      {/* Karşılama Mesajı */}
      <div className="pt-2 mb-2">
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Merhaba! 👋
        </h2>
        <p className="text-sm text-text-secondary mt-1 space-y-1 leading-relaxed">
          Kariyer yolculuğunda sana yardımcı olmak için buradayım.
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`glass-card p-4 flex flex-col justify-between items-start min-h-[110px] bg-gradient-to-br ${stat.color}`}
            >
              <div className="w-full flex items-center justify-between mb-3">
                <Icon size={20} className="text-text-secondary" />
              </div>
              <div className="space-y-1 w-full">
                {loading ? (
                   <div className="w-7 h-7 border-2 border-text-muted/30 border-t-text-secondary rounded-full animate-spin" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                    <p className="text-xs font-medium text-text-secondary">{stat.label}</p>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Son Başvurular */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">Son Başvurular</h3>
          <button className="text-xs font-medium text-text-muted hover:text-text-secondary transition-colors">
            Tümünü Gör →
          </button>
        </div>
        
        <div className="space-y-4">
          {loading ? (
             <div className="flex justify-center p-6">
               <div className="w-8 h-8 border-4 border-rose-soft border-t-rose-deep rounded-full animate-spin" />
             </div>
          ) : recentApplications.length > 0 ? (
            recentApplications.map((app) => (
              <AppCard key={app.id || Math.random()} application={app} />
            ))
          ) : (
            <div className="glass-card p-5 text-center border border-dashed border-rose-deep/30">
              <p className="text-sm font-semibold text-text-secondary mb-1">Henüz başvuru bulunmuyor.</p>
              <p className="text-xs text-text-muted">Alttaki sekmeden yeni ekleyebilirsin.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Asistan Çağrı Kartı */}
      <div className="glass-card p-6 mt-4 bg-gradient-to-br from-rose-soft/50 to-blue-soft/50 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-medium to-blue-medium flex items-center justify-center mb-4 shadow-[var(--shadow-soft)]">
          <span className="text-2xl">✨</span>
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-2">
          AI Asistanını Dene
        </h3>
        <p className="text-sm text-text-secondary mb-5 leading-relaxed max-w-[250px]">
          CV'ni yükle, en uygun ilanları bul ve mülakata hazırlan.
        </p>
        <button className="btn-primary w-full max-w-[200px] py-3 text-sm">
          Başla →
        </button>
      </div>
    </div>
  )
}
