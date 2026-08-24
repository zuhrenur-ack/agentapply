import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { useApp } from '../context/AppContext'
import AppCard from '../components/AppCard'
import ApplicationFormModal from '../components/ApplicationFormModal'

/**
 * Başvurular Sayfası.
 * 
 * Kullanıcının tüm başvurularını listeler.
 * API'den gelen gerçek verileri Context üzerinden okur.
 */
export default function Applications() {
  const { applications, loading } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Basit filtreleme mantığı
  const filteredApps = applications.filter(app => 
    app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4 animate-slide-up pb-6">
      {/* Sayfa Başlığı */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-bold text-text-primary">Başvurularım</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-1.5 text-xs py-2 px-4 shadow-[var(--shadow-soft)]"
        >
          <Plus size={14} />
          Yeni Ekle
        </button>
      </div>

      {/* Arama ve Filtre */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Şirket veya pozisyon ara..."
            className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius-md)] bg-bg-secondary border border-rose-soft/60 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-medium transition-colors shadow-[var(--shadow-card)]"
          />
        </div>
        <button className="p-2.5 rounded-[var(--radius-md)] bg-bg-secondary border border-rose-soft/60 text-text-muted hover:text-text-secondary transition-colors shadow-[var(--shadow-card)]">
          <Filter size={18} />
        </button>
      </div>

      {/* Başvuru Sayısı ve Yüklenme Durumu */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted">
          {loading ? 'Yükleniyor...' : `${filteredApps.length} başvuru bulundu`}
        </p>
      </div>

      {/* Başvuru Kartları */}
      <div className="space-y-4 mt-2">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-rose-soft border-t-rose-deep rounded-full animate-spin" />
          </div>
        ) : filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <AppCard key={app.id || Math.random()} application={app} />
          ))
        ) : (
          <div className="glass-card p-6 text-center mt-4 border border-dashed border-rose-deep/30">
            <p className="text-sm font-semibold text-text-secondary mb-2">Henüz başvuru bulunmuyor.</p>
            <p className="text-xs text-text-muted">Yukarıdaki "Yeni Ekle" butonunu kullanarak ilk başvurunu ekleyebilirsin.</p>
          </div>
        )}
      </div>

      {/* Yeni Ekle Modalı */}
      <ApplicationFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
