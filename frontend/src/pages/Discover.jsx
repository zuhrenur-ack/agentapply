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

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user || cachedDiscover) return
      setLoading(true)
      try {
        const token = await getToken()
        const res = await api.get('/discover/jobs', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 90000,
        })
        if (res.data?.success) {
          setJobs(res.data.data)
          setCachedDiscover(res.data.data)
        }
      } catch (error) {
        showToast('İlanlar yüklenemedi.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [user, getToken, showToast, cachedDiscover, setCachedDiscover])

  return (
    <div className="space-y-4 animate-slide-up pb-6">
      <div className="pt-2">
        <h2 className="text-xl font-bold text-text-primary mb-1 flex items-center gap-2">
          <Globe className="text-blue-medium" size={22} /> Keşfet
        </h2>
        <p className="text-sm text-text-secondary">
          CV'ne uygun ilanlar AI tarafından analiz edilip uyum skoru ile gösterilir.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="text-blue-medium animate-spin" />
          <p className="text-sm text-text-muted">İlanlar CV'inle eşleştiriliyor...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-4 space-y-3">
              {/* Üst satır: Logo + Başlık + Skor */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random&color=fff&size=40&rounded=true&bold=true`}
                    alt={job.company}
                    className="w-10 h-10 rounded-lg shadow-sm shrink-0"
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
                <ExternalLink size={13} /> İlana Git (Kariyer.net / LinkedIn)
              </a>
            </div>
          ))}
          {/* Daha Fazla Yükle Butonu */}
          <button
            onClick={() => {
              setJobs([])
              setCachedDiscover(null)
            }}
            className="w-full py-3 mt-4 rounded-xl font-semibold text-sm text-blue-deep bg-blue-soft/20 hover:bg-blue-soft/40 transition-colors border border-blue-soft/30"
          >
            Daha Fazla İlan Bul
          </button>
        </div>
      )}
    </div>
  )
}
