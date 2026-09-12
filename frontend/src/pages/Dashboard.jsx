// ==============================================================================
// PANO (DASHBOARD) KANBAN ÖZETİ VE SKILL GAP RADAR GRAFİĞİ (ADIM 4)
// ==============================================================================
// HATA NOTU VE DEĞİŞKEN ADI ÇAKIŞMA DÜZELTMESİ:
// Hem başvuru listesi yüklenirken hem de Skill Gap grafiği yüklenirken aynı 'loading' adı kullanılmıştı.
// Bu durum başvuru listesi yüklenirken Radar Grafiği'nin de dönme animasyonu göstermesine yol açtı!
// Çözüm: Başvuru yüklemesi 'appLoading', Grafik yüklemesi 'skillGapLoading' olarak ayrıştırıldı.
// ==============================================================================
import { useState, useEffect } from 'react'
import { Briefcase, TrendingUp, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip } from 'recharts'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import AppCard from '../components/AppCard'

export default function Dashboard() {
  const { applications, loading: appLoading } = useApp()
  const { user, getToken } = useAuth()
  
  const [skillGapData, setSkillGapData] = useState(null)
  const [skillGapLoading, setSkillGapLoading] = useState(false)

  useEffect(() => {
    const fetchSkillGap = async () => {
      if (!user) return
      setSkillGapLoading(true)
      try {
        const token = await getToken()
        const res = await api.get('/ai/skill-gap', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.success) {
          setSkillGapData(res.data.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setSkillGapLoading(false)
      }
    }
    fetchSkillGap()
  }, [user, getToken])
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
                {appLoading ? (
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
          {appLoading ? (
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

      {/* Görsel Yetenek Açığı (Skill Gap) Analizi */}
      <div className="pt-2">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Senin Yeteneklerin vs. İlan Gereksinimleri
        </h3>
        
        {skillGapLoading ? (
          <div className="glass-card p-8 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-rose-soft border-t-rose-deep rounded-full animate-spin" />
            <p className="text-xs text-text-muted text-center">Yeteneklerin piyasa verileriyle kıyaslanıyor...</p>
          </div>
        ) : skillGapData ? (
          <div className="space-y-4">
            <div className="glass-card p-4 flex justify-center items-center h-64 overflow-hidden relative">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" width={300} height={250} data={skillGapData.radar_data}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Senin Seviyen" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                <Radar name="Piyasa Beklentisi" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', bottom: 0 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
              {skillGapData.is_mock && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] px-2 py-1 rounded-md border border-amber-200">
                  <AlertCircle size={10} /> {skillGapData.recommendations[0]}
                </div>
              )}
            </div>

            {/* AI Tavsiye Rozetleri */}
            <div className="space-y-2">
              {!skillGapData.is_mock && skillGapData.recommendations.map((rec, idx) => (
                <div key={idx} className="glass-card p-3 flex items-start gap-3 border-l-4 border-l-blue-medium">
                  <Zap size={16} className="text-blue-medium shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <span className="font-semibold text-text-primary">Groq AI Tavsiyesi: </span>
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
