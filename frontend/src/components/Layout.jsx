import BottomNav from './BottomNav'
import Toast from './Toast'
import UserMenu from './UserMenu'

/**
 * Sayfa Düzeni Bileşeni.
 * 
 * Tüm sayfaları saran genel iskelet.
 * Üst başlık, içerik alanı, alt navigasyon ve toast bildirimlerini içerir.
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Toast Bildirimleri */}
      <Toast />

      {/* Üst Başlık */}
      <header className="sticky top-0 z-30 bg-bg-secondary/80 backdrop-blur-lg border-b border-rose-soft/30">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-gradient-to-br from-rose-medium to-blue-medium flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-text-primary leading-tight">AgentApply</h1>
              <p className="text-[10px] text-text-muted leading-tight">AI Kariyer Asistanı</p>
            </div>
          </div>
          
          {/* Kullanıcı Menüsü */}
          <UserMenu />
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {children}
      </main>

      {/* Alt Navigasyon */}
      <BottomNav />
    </div>
  )
}
