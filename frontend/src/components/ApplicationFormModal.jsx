import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { applicationAPI } from '../services/api'
import { useApp } from '../context/AppContext'

const statusOptions = [
  { value: 'planned', label: 'Planlandı' },
  { value: 'applied', label: 'Başvuruldu' },
  { value: 'interview', label: 'Mülakat' },
  { value: 'offer', label: 'Teklif' },
  { value: 'rejected', label: 'Reddedildi' },
  { value: 'accepted', label: 'Kabul Edildi' },
]

export default function ApplicationFormModal({ isOpen, onClose }) {
  const { fetchApplications, showToast, handleApiResponse, setApplications } = useApp()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'planned',
    notes: '',
    url: ''
  })

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.company || !formData.position) return

    setLoading(true)
    try {
      const res = await applicationAPI.create(formData)
      // Toast çakışmasını önlemek için genel uyarıyı gizliyoruz (true)
      const result = handleApiResponse(res, true)
      
      if (result.success || result.is_timeout) {
        showToast(result.is_mock ? 'Bağlantı kurulamadı, geçici olarak kaydedildi (Çevrimdışı)' : 'Başvuru eklendi!', result.is_mock ? 'warning' : 'success')
        
        // Eğer çevrimdışı (mock) moddaysak API'den yeniden çekmek yerine 
        // eklenen veriyi direkt state'e ekleyelim ki listeden kaybolmasın.
        if (result.is_mock) {
          const newApp = { ...formData, id: Date.now().toString() } // Form datası
          setApplications(prev => [newApp, ...prev])
        } else {
          fetchApplications() // Gerçek DB ise listeyi yeniden çek
        }
        
        onClose() // Modalı kapat
        // Formu temizle
        setFormData({ company: '', position: '', status: 'planned', notes: '', url: '' })
      } else {
        showToast(result.message || 'Bir hata oluştu', 'error')
      }
    } catch (error) {
      showToast('Bağlantı hatası.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-text-primary/20 backdrop-blur-sm animate-fade-in">
      {/* Arka plan tıklama alanı */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal İçeriği */}
      <div className="relative w-full max-w-sm glass-card bg-bg-secondary p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-soft/50">
          <h2 className="text-lg font-bold text-text-primary">Yeni Başvuru Ekle</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-text-muted hover:bg-rose-soft/50 hover:text-text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Şirket Adı *</label>
            <input
              type="text"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-bg-primary border border-rose-soft/50 text-sm focus:outline-none focus:border-blue-medium transition-colors"
              placeholder="Örn: TechCorp"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Pozisyon *</label>
            <input
              type="text"
              name="position"
              required
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-bg-primary border border-rose-soft/50 text-sm focus:outline-none focus:border-blue-medium transition-colors"
              placeholder="Örn: Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Durum</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-bg-primary border border-rose-soft/50 text-sm focus:outline-none focus:border-blue-medium transition-colors"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">İlan Linki (Opsiyonel)</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-bg-primary border border-rose-soft/50 text-sm focus:outline-none focus:border-blue-medium transition-colors"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Notlar (Opsiyonel)</label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-bg-primary border border-rose-soft/50 text-sm focus:outline-none focus:border-blue-medium transition-colors resize-none"
              placeholder="Eklemek istediğiniz notlar..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Kaydet'}
          </button>
        </form>
      </div>
    </div>
  )
}
