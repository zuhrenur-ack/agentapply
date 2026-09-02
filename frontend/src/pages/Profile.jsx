import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, CheckCircle, Save, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Profile() {
  const { user, getToken } = useAuth()
  const [cvText, setCvText] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error'
  const [message, setMessage] = useState('')
  const fileInputRef = useRef()

  // Kayıtlı CV'yi getir
  useEffect(() => {
    if (!user) return
    const fetchCV = async () => {
      setLoading(true)
      try {
        const token = await getToken()
        const res = await api.get('/profile/cv', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.data?.content) {
          setCvText(res.data.data.content)
          setFileName(res.data.data.file_name || 'Kayıtlı CV')
        }
      } catch (e) {
        console.warn('CV getirilemedi:', e)
      }
      setLoading(false)
    }
    fetchCV()
  }, [user])

  // PDF yükleme
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    // PDF içeriğini text olarak oku (backend'e gönder)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/ai/analyze-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      if (res.data?.data?.summary) {
        setCvText(JSON.stringify(res.data.data, null, 2))
        setMessage('PDF analiz edildi. Kaydet butonuna basarak CV\'ni sakla.')
        setStatus('success')
      }
    } catch (e) {
      setMessage('PDF okunamadı. Lütfen metni elle gir.')
      setStatus('error')
    }
  }

  // CV kaydet
  const handleSave = async () => {
    if (!cvText.trim()) return
    setSaving(true)
    setStatus(null)
    try {
      const token = await getToken()
      const res = await api.post('/profile/cv',
        { content: cvText, file_name: fileName || 'cv.txt' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success) {
        setStatus('success')
        setMessage('CV başarıyla kaydedildi! ✅')
      } else {
        setStatus('error')
        setMessage(res.data?.message || 'CV kaydedilemedi.')
      }
    } catch (e) {
      setStatus('error')
      setMessage('Bağlantı hatası. Lütfen tekrar dene.')
    }
    setSaving(false)
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-soft/30 flex items-center justify-center">
          <FileText size={32} className="text-rose-medium" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-text-primary">Profil & CV</h2>
          <p className="text-sm text-text-muted mt-1">CV'ni kaydetmek için giriş yapmalısın.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Profilim</h1>
        <p className="text-sm text-text-muted">{user.email}</p>
      </div>

      {/* CV Yükleme Kartı */}
      <div className="card-base p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-rose-medium" />
          <h2 className="font-semibold text-text-primary">CV Yönetimi</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span className="animate-spin w-4 h-4 border-2 border-rose-medium/40 border-t-rose-medium rounded-full" />
            CV yükleniyor...
          </div>
        ) : (
          <>
            {/* PDF Yükleme */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-rose-soft/50 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-rose-medium/50 transition-colors"
            >
              <Upload size={24} className="text-rose-medium/60" />
              <p className="text-sm text-text-muted text-center">
                {fileName ? (
                  <span className="text-rose-medium font-medium">{fileName}</span>
                ) : (
                  <>PDF yüklemek için tıkla<br /><span className="text-xs">veya aşağıya CV metnini yapıştır</span></>
                )}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Metin Alanı */}
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="CV içeriğini buraya yapıştırabilirsin (yetenekler, deneyimler, eğitim...)&#10;&#10;Örn:&#10;Yetenekler: Python, React, SQL&#10;Deneyim: 6 ay staj - ABC A.Ş."
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-rose-soft/40 bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-medium/60 resize-none transition-colors"
            />

            {/* Durum mesajı */}
            {status && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {message}
              </div>
            )}

            {/* Kaydet Butonu */}
            <button
              onClick={handleSave}
              disabled={saving || !cvText.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: saving || !cvText.trim() ? '#d4a5b0' : 'linear-gradient(135deg, #e8a0b0, #a0c4d8)' }}
            >
              {saving ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
              ) : (
                <><Save size={16} /> CV'yi Kaydet</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
