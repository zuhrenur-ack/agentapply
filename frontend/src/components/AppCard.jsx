import { MapPin, ExternalLink, MoreHorizontal } from 'lucide-react'

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
    <div className="glass-card p-4 animate-fade-in overflow-hidden">
      {/* Üst Kısım */}
      <div className="flex items-start justify-between gap-2 mb-3">
        {/* min-w-0 ile flex-1 içindeki metin truncate çalışır */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <h3 className="text-sm font-semibold text-text-primary leading-snug truncate">
            {position}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="text-text-muted shrink-0" />
            <span className="text-xs text-text-secondary truncate">{company}</span>
          </div>
        </div>

        {/* Uyum puanı */}
        {match_score != null && (
          <div className="flex flex-col items-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-soft to-blue-soft flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-text-primary">
                {Math.round(match_score)}%
              </span>
            </div>
            <span className="text-[9px] text-text-muted mt-0.5">Uyum</span>
          </div>
        )}
      </div>

      {/* Alt Kısım */}
      <div className="flex items-center justify-between pt-2 border-t border-rose-soft/40 gap-2">
        <span className={`badge badge-${status} px-2 py-0.5 text-[11px] shrink-0`}>
          {statusLabels[status] || status}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full text-text-muted hover:text-blue-deep hover:bg-blue-soft/50 transition-colors"
              aria-label="İlanı aç"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            className="p-1.5 rounded-full text-text-muted hover:text-text-secondary hover:bg-rose-soft/50 transition-colors"
            aria-label="Daha fazla seçenek"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Notlar */}
      {notes && (
        <p className="text-xs text-text-muted mt-2 pt-2 border-t border-rose-soft/20 line-clamp-2 leading-relaxed">
          {notes}
        </p>
      )}
    </div>
  )
}
