import axios from 'axios'

/**
 * API İstemci Yapılandırması.
 * Timeout artırıldı (Railway cold-start için).
 * Network hatasında retry-friendly yanıt döner.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// Genel istekler için 30 sn
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// İstek interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API] İstek hatası:', error)
    return Promise.reject(error)
  }
)

// Yanıt interceptor
api.interceptors.response.use(
  (response) => {
    if (response.data?.is_mock) {
      console.warn('[API] ⚠️ Mock veri alındı:', response.config.url)
    }
    return response
  },
  (error) => {
    console.error('[API] Yanıt hatası:', error.message, error.code)

    // Timeout veya ağ hatası → kullanıcıya anlamlı mesaj, uygulama çökmez
    if (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout')
    ) {
      return Promise.resolve({
        data: {
          success: false,
          data: null,
          message:
            'Sunucu şu an uyanıyor olabilir. 30 saniye bekleyip tekrar deneyin.',
          is_mock: true,
          is_timeout: true,
        },
      })
    }

    return Promise.reject(error)
  }
)

// ==========================================
// API Fonksiyonları
// ==========================================

export const applicationAPI = {
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
}

export const aiAPI = {
  analyzeCV: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/ai/analyze-cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000, // 90 sn — Railway cold start için yeterli
    })
  },
  matchJobs: (file, jobDescription) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', jobDescription)
    return api.post('/ai/match-jobs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    })
  },
  interviewCoach: (file, position) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('position', position)
    return api.post('/ai/interview-coach', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    })
  },
}

export const healthCheck = () => api.get('/health', { timeout: 10000 })

export default api
