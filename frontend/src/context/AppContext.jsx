import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { applicationAPI } from '../services/api'

const AppContext = createContext(null)

/**
 * Uygulama genelindeki state'i yöneten Context Provider.
 * Başvurular, toast bildirimleri ve yükleme durumlarını yönetir.
 * Level 3: Gerçek API entegrasyonu sağlandı.
 */
export function AppProvider({ children }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Toast bildirim gösterici
  const showToast = useCallback((message, type = 'info', isMock = false) => {
    setToast({ message, type, isMock })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // Toast'u kapat
  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  // API yanıtını kontrol et — mock ise uyarı göster
  const handleApiResponse = useCallback((response, suppressMockWarning = false) => {
    const isMock = response?.data?.is_mock || response?.is_mock
    if (isMock && !suppressMockWarning) {
      showToast(
        "Veritabanına bağlanılamadı, sistem çevrimdışı (yedek) modda çalışıyor.",
        'warning',
        true
      )
    }
    return response?.data || response
  }, [showToast])

  // Backend'den başvuruları çek
  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await applicationAPI.getAll()
      const result = handleApiResponse(res)
      if (result.success && result.data) {
        // En yeni başvurular en üstte görünsün diye tersine çeviriyoruz
        setApplications(Array.isArray(result.data) ? result.data.reverse() : [])
      }
    } catch (error) {
      console.error("Başvurular yüklenirken hata:", error)
      showToast("Başvurular yüklenirken bir hata oluştu.", "error")
    } finally {
      setLoading(false)
    }
  }, [handleApiResponse, showToast])

  // Sayfa yüklendiğinde otomatik çek
  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const value = {
    applications,
    setApplications,
    loading,
    setLoading,
    toast,
    showToast,
    hideToast,
    handleApiResponse,
    fetchApplications,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * AppContext hook'u.
 */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp hook\'u AppProvider içinde kullanılmalıdır.')
  }
  return context
}
