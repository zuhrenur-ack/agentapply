import { useState, useRef } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Briefcase, MessageSquare, Loader2, TrendingUp, HelpCircle, Lightbulb } from 'lucide-react'
import { aiAPI } from '../services/api'
import { useApp } from '../context/AppContext'

/**
 * AI Asistan Sayfası.
 */
export default function AIAssistant() {
  const { showToast, handleApiResponse } = useApp()
  const [file, setFile] = useState(null)
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [coachLoading, setCoachLoading] = useState(false)
  
  // Result states
  const [result, setResult] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [coachResult, setCoachResult] = useState(null)
  
  // Input states
  const [activeTab, setActiveTab] = useState('analysis')
  const [jobDescription, setJobDescription] = useState('')
  const [position, setPosition] = useState('')
  
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== 'application/pdf') {
        showToast('Sadece PDF formatında CV yükleyebilirsiniz.', 'error')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    try {
      const res = await aiAPI.analyzeCV(file)
      const data = handleApiResponse(res)
      if (data.success) {
        setResult(data.data)
        showToast('CV başarıyla analiz edildi!', 'success')
      } else {
        showToast(data.message || 'Analiz sırasında hata oluştu.', 'error')
      }
    } catch (error) {
      showToast('Bağlantı hatası.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleMatch = async () => {
    if (!file || !jobDescription.trim()) {
      showToast('Lütfen iş ilanını girin.', 'error')
      return
    }
    setMatchLoading(true)
    try {
      const res = await aiAPI.matchJobs(file, jobDescription)
      const data = handleApiResponse(res)
      if (data.success) {
        setMatchResult(data.data)
        showToast('Eşleştirme tamamlandı!', 'success')
      } else {
        showToast(data.message || 'Hata oluştu.', 'error')
      }
    } catch (error) {
      showToast('Bağlantı hatası.', 'error')
    } finally {
      setMatchLoading(false)
    }
  }

  const handleCoach = async () => {
    if (!file || !position.trim()) {
      showToast('Lütfen pozisyonu girin.', 'error')
      return
    }
    setCoachLoading(true)
    try {
      const res = await aiAPI.interviewCoach(file, position)
      const data = handleApiResponse(res)
      if (data.success) {
        setCoachResult(data.data)
        showToast('Sorular hazırlandı!', 'success')
      } else {
        showToast(data.message || 'Hata oluştu.', 'error')
      }
    } catch (error) {
      showToast('Bağlantı hatası.', 'error')
    } finally {
      setCoachLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up pb-6">
      <div className="pt-2">
        <h2 className="text-xl font-bold text-text-primary mb-1">AI Asistanı ✨</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          CV'ni Groq yapay zekasıyla analiz et, ilanlarla eşleştir ve mülakatlara hazırlan.
        </p>
      </div>

      {!result && (
        <div className="glass-card p-6 mt-4">
          <div 
            onClick={handleUploadClick}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              file ? 'border-blue-medium bg-blue-soft/10' : 'border-rose-soft/60 hover:bg-rose-soft/20 hover:border-rose-medium'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="application/pdf" 
              className="hidden" 
            />
            
            {file ? (
              <div className="flex flex-col items-center animate-fade-in">
                <FileText size={40} className="text-blue-deep mb-3" />
                <p className="text-sm font-semibold text-text-primary">{file.name}</p>
                <p className="text-xs text-text-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud size={40} className="text-rose-medium mb-3" />
                <p className="text-sm font-semibold text-text-primary">CV'ni PDF Olarak Yükle</p>
                <p className="text-xs text-text-muted mt-1">Tıklayarak dosya seçebilirsin</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Yapay Zeka Analiz Ediyor...</span>
              </>
            ) : (
              <span>Analizi Başlat ✨</span>
            )}
          </button>
        </div>
      )}

      {result && (
        <div className="animate-fade-in">
          <div className="flex p-1 bg-bg-secondary rounded-xl border border-rose-soft/30 mb-4 shadow-sm gap-1">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 min-w-0 ${activeTab === 'analysis' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted'}`}
            >
              <FileText size={13} className="shrink-0" />
              <span className="truncate">Analiz</span>
            </button>
            <button
              onClick={() => setActiveTab('match')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 min-w-0 ${activeTab === 'match' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted'}`}
            >
              <Briefcase size={13} className="shrink-0" />
              <span className="truncate">Eşleşme</span>
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 min-w-0 ${activeTab === 'coach' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted'}`}
            >
              <MessageSquare size={13} className="shrink-0" />
              <span className="truncate">Koç</span>
            </button>
          </div>

          <div className="glass-card p-5">
            {/* 1. CV Analizi */}
            {activeTab === 'analysis' && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-accent-success" /> Profesyonel Özet
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed p-3 bg-bg-primary rounded-lg border border-rose-soft/30">
                    {result.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className="text-blue-medium" /> Güçlü Yönler
                    </h3>
                    <ul className="space-y-2">
                      {result.strengths?.map((item, idx) => (
                        <li key={idx} className="text-sm text-text-secondary flex items-start gap-2 bg-blue-soft/10 p-2 rounded-md">
                          <span className="text-blue-medium mt-0.5">•</span> <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                      <AlertCircle size={16} className="text-rose-medium" /> Geliştirilmesi Gerekenler
                    </h3>
                    <ul className="space-y-2">
                      {result.weaknesses?.map((item, idx) => (
                        <li key={idx} className="text-sm text-text-secondary flex items-start gap-2 bg-rose-soft/10 p-2 rounded-md">
                          <span className="text-rose-medium mt-0.5">•</span> <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-2">Önerilen Pozisyonlar</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.recommended_roles?.map((role, idx) => (
                      <span key={idx} className="px-3 py-1 bg-bg-secondary border border-rose-soft/40 rounded-full text-xs font-medium text-text-primary shadow-sm">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. İlan Eşleştirme */}
            {activeTab === 'match' && (
              <div className="space-y-4 animate-fade-in">
                {!matchResult ? (
                  <>
                    <p className="text-sm text-text-secondary">CV'nin uyumunu test etmek istediğin iş ilanının metnini aşağıya yapıştır.</p>
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="İş ilanı metnini buraya yapıştır..."
                      className="w-full h-40 p-3 bg-bg-primary border border-rose-soft/40 rounded-xl text-sm focus:ring-2 focus:ring-rose-medium outline-none"
                    ></textarea>
                    <button 
                      onClick={handleMatch}
                      disabled={matchLoading || !jobDescription}
                      className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                    >
                      {matchLoading ? <Loader2 size={18} className="animate-spin" /> : <Briefcase size={18} />}
                      Eşleştir
                    </button>
                  </>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-bg-primary rounded-xl border border-rose-soft/30">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary">Uyum Puanı</h3>
                        <p className="text-sm text-text-secondary mt-1">{matchResult.reasoning}</p>
                      </div>
                      <div className={`text-4xl font-extrabold flex-shrink-0 ml-4 ${matchResult.score >= 70 ? 'text-accent-success' : matchResult.score >= 50 ? 'text-amber-500' : 'text-rose-medium'}`}>
                        %{matchResult.score}
                      </div>
                    </div>
                    {matchResult.missing_skills && matchResult.missing_skills.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                          <AlertCircle size={16} className="text-rose-medium" /> Eksik veya Geliştirilmesi Gereken Beceriler
                        </h3>
                        <ul className="space-y-2">
                          {matchResult.missing_skills.map((skill, idx) => (
                            <li key={idx} className="text-sm text-text-secondary flex items-start gap-2 bg-rose-soft/10 p-2 rounded-md">
                              <span className="text-rose-medium mt-0.5">•</span> <span>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button 
                      onClick={() => setMatchResult(null)}
                      className="w-full py-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors border border-dashed border-rose-soft/60 rounded-xl mt-2"
                    >
                      Yeni İlan Dene
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. Mülakat Koçu */}
            {activeTab === 'coach' && (
              <div className="space-y-4 animate-fade-in">
                {!coachResult ? (
                  <>
                    <p className="text-sm text-text-secondary">Mülakatına gireceğin pozisyonu yaz, sana özel çalışma soruları hazırlayalım.</p>
                    <input 
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Örn: Frontend Developer, Finans Analisti..."
                      className="w-full p-3 bg-bg-primary border border-rose-soft/40 rounded-xl text-sm focus:ring-2 focus:ring-rose-medium outline-none"
                    />
                    <button 
                      onClick={handleCoach}
                      disabled={coachLoading || !position}
                      className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                    >
                      {coachLoading ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                      Soruları Hazırla
                    </button>
                  </>
                ) : (
                  <div className="space-y-6">
                    {coachResult.general_advice && (
                      <div className="p-3 bg-blue-soft/10 border border-blue-soft/30 rounded-lg text-sm text-text-secondary">
                        <span className="font-bold text-blue-deep block mb-1">Genel Tavsiye:</span>
                        {coachResult.general_advice}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {coachResult.questions?.map((q, idx) => (
                        <div key={idx} className="p-4 bg-bg-primary rounded-xl border border-rose-soft/30 space-y-3">
                          <h4 className="font-bold text-text-primary flex items-start gap-2 text-sm">
                            <HelpCircle size={18} className="text-rose-medium flex-shrink-0 mt-0.5" />
                            {q.question}
                          </h4>
                          <div className="pl-6 space-y-2">
                            <p className="text-xs text-text-muted flex items-start gap-1.5">
                              <span className="font-semibold text-text-secondary">Amaç:</span> {q.purpose}
                            </p>
                            <p className="text-xs text-text-muted flex items-start gap-1.5">
                              <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <span><span className="font-semibold text-text-secondary">İpucu:</span> {q.tips}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => setCoachResult(null)}
                      className="w-full py-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors border border-dashed border-rose-soft/60 rounded-xl"
                    >
                      Başka Pozisyon Dene
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              setResult(null);
              setMatchResult(null);
              setCoachResult(null);
              setFile(null);
              setJobDescription('');
              setPosition('');
            }}
            className="w-full mt-4 py-2.5 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors border border-dashed border-rose-soft/60 rounded-xl"
          >
            Farklı Bir CV Yükle
          </button>
        </div>
      )}
    </div>
  )
}
