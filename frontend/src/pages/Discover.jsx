import { useState, useEffect } from 'react'
import { Globe, Briefcase, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

export default function Discover() {
  const { getToken, user } = useAuth()
  const { showToast } = useApp()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDiscoverJobs = async () => {
      if (!user) return
      setLoading(true)
      try {
        const token = await getToken()
        const res = await api.get('/discover/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.success) {
          setJobs(res.data.data)
        }
      } catch (error) {
        console.error('Discover error:', error)
        showToast('İlanlar çekilirken bir hata oluştu.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchDiscoverJobs()
  }, [user, getToken, showToast])

  return (
    <div className="space-y-6 animate-slide-up pb-6">
      <div className="pt-2">
        <h2 className="text-xl font-bold text-text-primary mb-1 flex items-center gap-2">
          <Globe className="text-blue-medium" size={24} /> Keşfet
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Senin CV'ne en uygun dış ilanlar yapay zeka tarafından taranır ve uyum skoruyla gösterilir.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="text-blue-medium animate-spin" />
          <p className="text-sm text-text-muted">CV'in ilanlarla eşleştiriliyor...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-5 space-y-4 relative overflow-hidden group">
              {/* Score Badge */}
              <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full shadow-sm bg-bg-secondary border border-rose-soft/30">
                <span className={`text-lg font-bold ${job.match_score >= 80 ? 'text-accent-success' : job.match_score >= 50 ? 'text-amber-500' : 'text-rose-medium'}`}>
                  %{job.match_score}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-text-primary pr-14">{job.title}</h3>
                <p className="text-sm text-text-secondary flex items-center gap-2 mt-1">
                  <Briefcase size={14} className="text-rose-medium" /> {job.company}
                </p>
              </div>

              <div className="p-3 bg-bg-primary rounded-xl border border-rose-soft/30">
                <h4 className="text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-blue-medium" /> Öne Çıkan Neden
                </h4>
                <p className="text-sm text-text-primary">
                  {job.match_reasoning}
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => window.open(job.url, '_blank')}
                  className="flex-1 py-2 text-sm font-semibold text-blue-medium hover:bg-blue-soft/20 bg-blue-soft/10 rounded-xl transition-colors border border-blue-soft/30"
                >
                  İlana Git
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
