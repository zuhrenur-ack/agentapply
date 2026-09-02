import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, Download, Sparkles, CheckCheck, AlertCircle, FileText, Upload } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CoverLetterModal({ application, onClose }) {
  const { getToken, user } = useAuth()
  const [cvText, setCvText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMock, setIsMock] = useState(false)
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'result'
  const [fetchingCV, setFetchingCV] = useState(false)

  // Modala girildiğinde otomatik olarak kayıtlı CV'yi çek
  useEffect(() => {
    const fetchSavedCV = async () => {
      if (!user) return
      setFetchingCV(true)
      try {
        const token = await getToken()
        const res = await api.get('/profile/cv', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.data?.content) {
          setCvText(res.data.data.content)
        }
      } catch (e) {
        console.warn('Kayıtlı CV bulunamadı veya çekilemedi:', e)
      }
      setFetchingCV(false)
    }
    fetchSavedCV()
  }, [user, getToken])

  const handleGenerate = async () => {
    if (!cvText.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/cover-letter/generate', {
        cv_text: cvText,
        company: application.company,
        position: application.position,
        job_description: jobDesc,
      })
      const data = res.data
      if (data?.data?.letter) {
        setLetter(data.data.letter)
        setIsMock(data.is_mock || false)
        setStep('result')
      }
    } catch (e) {
      console.error('Cover letter error:', e)
    }
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `on-yazi-${application.company.replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-lg bg-bg-secondary rounded-t-3xl sm:rounded-2xl shadow-2xl border border-rose-soft/30 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0 border-b border-rose-soft/20">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Sparkles size={16} className="text-rose-medium shrink-0" />
              Ön Yazı Üret
            </h2>
            <p className="text-xs text-text-muted truncate mt-0.5">
              {application.company} — {application.position}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-soft/30 transition-colors shrink-0 ml-2">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {step === 'form' ? (
            <>
              {isMock && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  <AlertCircle size={13} />
                  AI bağlantısı yok — örnek mektup gösterilecek.
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                    CV Metnin <span className="text-red-400">*</span>
                    {fetchingCV && <span className="text-blue-medium animate-pulse text-[10px]">(Profilinden yükleniyor...)</span>}
                  </label>
                  {cvText && (
                    <button 
                      onClick={() => setCvText('')}
                      className="text-[10px] text-text-muted hover:text-rose-medium transition-colors"
                    >
                      Temizle / Yeni Yaz
                    </button>
                  )}
                </div>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="CV'indeki beceriler, deneyimler ve eğitim bilgilerini buraya yapıştır..."
                  rows={5}
                  disabled={fetchingCV}
                  className="w-full px-3 py-2.5 rounded-xl border border-rose-soft/40 bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-medium/60 resize-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                  İş İlanı (isteğe bağlı)
                </label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="İlanın gereksinimlerini yapıştırırsan daha özelleştirilmiş bir mektup üretilir..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-rose-soft/40 bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-medium/60 resize-none transition-colors"
                />
              </div>
            </>
          ) : (
            <>
              {isMock && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  <AlertCircle size={13} />
                  Bu örnek bir mektuptur. AI bağlantısı kurulunca gerçek içerik oluşturulur.
                </div>
              )}
              <div className="bg-bg-primary rounded-xl border border-rose-soft/30 p-4">
                <pre className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed font-sans">
                  {letter}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer butonlar */}
        <div className="px-5 pb-5 pt-3 shrink-0 border-t border-rose-soft/20 flex gap-2">
          {step === 'form' ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-rose-soft/40 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading || !cvText.trim()}
                className="flex-2 flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: loading || !cvText.trim() ? '#d4a5b0' : 'linear-gradient(135deg, #e8a0b0, #a0c4d8)' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Sparkles size={14} /> Üret</>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-2.5 rounded-xl border border-rose-soft/40 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
              >
                Yeniden Üret
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 rounded-xl border border-blue-soft bg-blue-soft/30 text-xs font-semibold text-text-primary flex items-center justify-center gap-1.5 transition-all"
              >
                {copied ? <CheckCheck size={13} className="text-green-600" /> : <Copy size={13} />}
                {copied ? 'Kopyalandı!' : 'Kopyala'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #e8a0b0, #a0c4d8)' }}
              >
                <Download size={13} /> İndir
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
