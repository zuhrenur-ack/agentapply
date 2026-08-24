import axios from 'axios'

/**
 * API İstemci Yapılandırması.
 * 
 * Backend ile iletişim kurar.
 * Tüm isteklere base URL ve timeout ekler.
 * Yanıtlarda is_mock kontrolü yapar.
 */

const API_BASE_URL = ''

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// İstek interceptor'u — loglama
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

// Yanıt interceptor'u — is_mock kontrolü
api.interceptors.response.use(
  (response) => {
    // Mock veri kontrolü
    if (response.data?.is_mock) {
      console.warn('[API] ⚠️ Mock veri alındı:', response.config.url)
    }
    return response
  },
  (error) => {
    console.error('[API] Yanıt hatası:', error.message)
    
    // Ağ hatalarında bile kullanıcıya anlamlı bir yanıt dön
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      return Promise.resolve({
        data: {
          success: false,
          data: null,
          message: 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.',
          is_mock: true,
        },
      })
    }
    
    return Promise.reject(error)
  }
)

// ==========================================
// API Fonksiyonları
// ==========================================

/**
 * Başvuru CRUD işlemleri
 */
export const applicationAPI = {
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
}

/**
 * AI Ajan işlemleri
 */
export const aiAPI = {
  analyzeCV: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/ai/analyze-cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000, 
    })
  },
  matchJobs: (file, jobDescription) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', jobDescription)
    return api.post('/ai/match-jobs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    })
  },
  interviewCoach: (file, position) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('position', position)
    return api.post('/ai/interview-coach', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    })
  },
}

/**
 * Sağlık kontrolü
 */
export const healthCheck = () => api.get('/health')

export default api
