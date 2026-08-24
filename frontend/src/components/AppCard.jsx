import { MapPin, ExternalLink, MoreHorizontal } from 'lucide-react'

/**
 * Başvuru Kartı Bileşeni.
 * 
 * Her bir staj/iş başvurusunu gösteren kart.
 * Şirket adı, pozisyon, durum rozeti ve uyum puanı içerir.
 */

// Durum etiketleri (Türkçe)
const statusLabels = {
  planned: 'Planlandı',
  applied: 'Başvuruldu',
  interview: 'Mülakat',
  offer: 'Teklif',
  rejected: 'Reddedildi',
  accepted: 'Kabul Edildi',
}

export default function AppCard({ application }) {
  const { company, position, status, notes, match_score, url } = application

  return (
    <div className="glass-card p-4 animate-fade-in">
      {/* Üst Kısım: Başlık ve Rozet */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 pr-4 space-y-1">
          <h3 className="text-base font-semibold text-text-primary leading-snug">
            {position}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={14} className="text-text-muted" />
            <span className="text-sm text-text-secondary">{company}</span>
          </div>
        </div>
        
        {/* Uyum puanı (varsa) */}
        {match_score != null && (
          <div className="flex flex-col items-center justify-center shrink-0 ml-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-soft to-blue-soft flex items-center justify-center shadow-[var(--shadow-card)]">
              <span className="text-sm font-bold text-text-primary">
                {Math.round(match_score)}%
              </span>
            </div>
            <span className="text-[10px] text-text-muted mt-1 font-medium">Uyum</span>
          </div>
        )}
      </div>

      {/* Alt Kısım: Durum rozeti, linkler ve butonlar */}
      <div className="flex items-center justify-between pt-3 border-t border-rose-soft/40">
        <span className={`badge badge-${status} px-3 py-1`}>
          {statusLabels[status] || status}
        </span>
        
        <div className="flex items-center gap-3">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full text-text-muted hover:text-blue-deep hover:bg-blue-soft/50 transition-colors"
              aria-label="İlanı aç"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <button
            className="p-1.5 rounded-full text-text-muted hover:text-text-secondary hover:bg-rose-soft/50 transition-colors"
            aria-label="Daha fazla seçenek"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Notlar (varsa) */}
      {notes && (
        <p className="text-xs text-text-muted mt-3 pt-3 border-t border-rose-soft/20 line-clamp-2 leading-relaxed">
          {notes}
        </p>
      )}
    </div>
  )
}
