// ==============================================================================
// KEŞFET SAYFASI — AI İLAN SKORLAMA VE GERÇEK İLAN LİSTESİ (ADIM 3)
// ==============================================================================
// GÖRSEL TASARIM & SCROLL HATA ÇÖZÜMÜ:
// İlk tasarımda sayfa altındaki 6. ilan ve 'Daha Fazla İlan Bul' butonu ekranın altında kalıp görünmüyordu.
// Çünkü sabit alt gezinti barı (BottomNav) hiyerarşide bu alanı kapatıyordu.
// Çözüm: Ana kapsayıcıya 'pb-24 overflow-y-auto h-[calc(100vh-4rem)]' eklenerek kaydırma alanı düzeltildi.
// ==============================================================================
import { useState, useEffect } from 'react'
import { Globe, Briefcase, ExternalLink, Loader2, MapPin, Tag } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

function ScoreBadge({ score }) {
  const color =
    score >= 70 ? 'text-accent-success bg-green-50 border-green-200' :
    score >= 40 ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-rose-medium bg-rose-soft/20 border-rose-soft/50'
  return (
    <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${color}`}>
      %{score}
    </span>
  )
}

export default function Discover() {
  const { getToken, user } = useAuth()
  const { showToast, cachedDiscover, setCachedDiscover } = useApp()
  const [jobs, setJobs] = useState(cachedDiscover || [])
  const [loading, setLoading] = useState(!cachedDiscover)

  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return
      
      // İlk yükleme veya önbellek kontrolü
      if (cachedDiscover && page === 1) {
        setJobs(cachedDiscover)
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        const token = await getToken()
        const res = await api.get(`/discover/jobs?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 90000,
        })
        if (res.data?.success) {
          const newJobs = res.data.data
          if (page === 1) {
            setJobs(newJobs)
            setCachedDiscover(newJobs)
          } else {
            setJobs(prev => [...prev, ...newJobs])
          }
        }
      } catch (error) {
        showToast('İlanlar yüklenemedi.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [user, getToken, showToast, page])

  return (
    <div className="space-y-4 animate-slide-up pb-24 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-hide">
      <div className="pt-2 px-1">
        <h2 className="text-xl font-bold text-text-primary mb-1 flex items-center gap-2">
          <Globe className="text-blue-medium" size={22} /> Keşfet
        </h2>
        <p className="text-sm text-text-secondary">
          CV'ne uygun ilanlar AI tarafından analiz edilip uyum skoru ile gösterilir.
        </p>
      </div>

      {loading && page === 1 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="text-blue-medium animate-spin" />
          <p className="text-sm text-text-muted">İlanlar CV'inle eşleştiriliyor...</p>
        </div>
      ) : (
        <div className="space-y-3 px-1">
          {jobs.map((job) => (
            <div key={`${job.id}-${Math.random()}`} className="glass-card p-4 space-y-3">
              {/* Üst satır: Logo + Başlık + Skor */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <img 
                    src={job.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random&color=fff&size=40`}
                    alt={job.company}
                    className="w-10 h-10 rounded-lg shadow-sm shrink-0 object-contain bg-white"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-text-primary leading-tight">{job.title}</h3>
                    <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                      <span className="truncate">{job.company}</span>
                    </p>
                  </div>
                </div>
                <ScoreBadge score={job.match_score} />
              </div>

              {/* Konum + Etiketler */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="flex items-center gap-1 text-[11px] text-text-muted">
                  <MapPin size={11} /> {job.location}
                </span>
                {job.tags?.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-soft/20 text-blue-deep border border-blue-soft/30 font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Öne Çıkan Neden */}
              {job.match_reasoning && (
                <p className="text-xs text-text-secondary bg-bg-primary rounded-lg px-3 py-2 border border-rose-soft/20 leading-relaxed line-clamp-2">
                  <span className="font-semibold text-text-primary">AI: </span>{job.match_reasoning}
                </p>
              )}

              {/* İlan Linki */}
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-blue-deep bg-blue-soft/15 hover:bg-blue-soft/30 rounded-xl transition-colors border border-blue-soft/30"
              >
                <ExternalLink size={13} /> İlana Git
              </a>
            </div>
          ))}
          
          {/* Daha Fazla Yükle Butonu */}
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
            className="w-full py-4 mt-2 mb-8 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-sm"
            style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #2dd4bf)' }}
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
            ) : (
              'Daha Fazla İlan Bul'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
