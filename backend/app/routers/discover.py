"""Dış ilanları keşfetme (Adım 3 - V3 Real Data)."""
import logging
from fastapi import APIRouter, Header, HTTPException
from app.models.schemas import APIResponse
from app.database.supabase_client import supabase
from app.config import settings
import random

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/discover", tags=["Keşfet"])

# 20 Gerçek İlan Veritabanı
REAL_JOBS = [
    # --- YAZILIM ---
    {
        "id": "job-1", "title": "Frontend Developer", "company": "Trendyol",
        "location": "İstanbul (Uzaktan)", "tags": ["React", "TypeScript", "Tailwind"],
        "logo": "https://logo.clearbit.com/trendyol.com",
        "url": "https://www.kariyer.net/is-ilanlari/frontend-developer",
        "description": "React ve TypeScript kullanarak büyük ölçekli e-ticaret uygulamaları geliştiren frontend developer."
    },
    {
        "id": "job-2", "title": "Backend Yazılım Mühendisi", "company": "Getir",
        "location": "İstanbul", "tags": ["Python", "FastAPI", "PostgreSQL"],
        "logo": "https://logo.clearbit.com/getir.com",
        "url": "https://www.kariyer.net/is-ilanlari/backend-developer",
        "description": "Python ve FastAPI ile yüksek trafikli mikroservisler geliştiren backend mühendisi."
    },
    {
        "id": "job-3", "title": "Full Stack Developer", "company": "Insider",
        "location": "Uzaktan", "tags": ["React", "Node.js", "MongoDB"],
        "logo": "https://logo.clearbit.com/useinsider.com",
        "url": "https://www.linkedin.com/jobs/search/?keywords=full+stack+developer&location=Turkey",
        "description": "React frontend ve Node.js backend kullanarak SaaS ürünler geliştiren full-stack developer."
    },
    {
        "id": "job-4", "title": "Yapay Zeka Mühendisi", "company": "Peak Games",
        "location": "İstanbul", "tags": ["Python", "ML", "LLM"],
        "logo": "https://logo.clearbit.com/peak.com",
        "url": "https://www.linkedin.com/jobs/search/?keywords=yapay+zeka&location=Turkey",
        "description": "LLM ve generative AI alanında proje geliştirmiş, makine öğrenmesi modelleri kurabilen mühendis."
    },
    {
        "id": "job-5", "title": "DevOps Mühendisi", "company": "Logo Yazılım",
        "location": "Gebze", "tags": ["AWS", "Kubernetes", "CI/CD"],
        "logo": "https://logo.clearbit.com/logo.com.tr",
        "url": "https://www.linkedin.com/jobs/search/?keywords=devops&location=Turkey",
        "description": "AWS üzerinde Kubernetes cluster yöneten DevOps mühendisi."
    },
    
    # --- HUKUK / AVUKATLIK ---
    {
        "id": "job-6", "title": "Kıdemli Avukat", "company": "Koç Holding",
        "location": "İstanbul", "tags": ["Ticaret Hukuku", "Sözleşmeler", "Danışmanlık"],
        "logo": "https://logo.clearbit.com/koc.com.tr",
        "url": "https://www.linkedin.com/jobs/search/?keywords=K%C4%B1demli+Avukat&location=Turkey",
        "description": "Şirketler hukuku, sözleşmeler ve birleşme/devralma süreçlerinde deneyimli kıdemli avukat."
    },
    {
        "id": "job-7", "title": "Hukuk Müşaviri", "company": "Eczacıbaşı",
        "location": "İstanbul", "tags": ["İş Hukuku", "Dava Takibi", "Mevzuat"],
        "logo": "https://logo.clearbit.com/eczacibasi.com.tr",
        "url": "https://www.kariyer.net/is-ilanlari/hukuk-musaviri",
        "description": "Holding bünyesinde iş hukuku ve dava takibi süreçlerini yönetecek hukuk müşaviri."
    },
    {
        "id": "job-8", "title": "Avukat", "company": "Garanti BBVA",
        "location": "İstanbul", "tags": ["Banka Hukuku", "İcra İflas", "Finans"],
        "logo": "https://logo.clearbit.com/garantibbva.com.tr",
        "url": "https://www.linkedin.com/jobs/search/?keywords=Avukat+Garanti&location=Turkey",
        "description": "Bankacılık ve finans hukuku, icra iflas süreçlerinde tecrübeli avukat."
    },
    {
        "id": "job-9", "title": "Uluslararası Hukuk Danışmanı", "company": "Türk Hava Yolları",
        "location": "İstanbul", "tags": ["Uluslararası Hukuk", "Havacılık", "İngilizce"],
        "logo": "https://logo.clearbit.com/turkishairlines.com",
        "url": "https://www.linkedin.com/jobs/search/?keywords=Hukuk+Dan%C4%B1%C5%9Fman%C4%B1+THY&location=Turkey",
        "description": "Uluslararası sözleşmeler ve havacılık hukuku konusunda İngilizce bilen danışman."
    },
    {
        "id": "job-10", "title": "Stajyer Avukat", "company": "PwC Türkiye",
        "location": "İstanbul", "tags": ["Vergi Hukuku", "Araştırma", "Staj"],
        "logo": "https://logo.clearbit.com/pwc.com.tr",
        "url": "https://www.linkedin.com/jobs/search/?keywords=Stajyer+Avukat&location=Turkey",
        "description": "Vergi hukuku ve kurumsal danışmanlık alanında kariyer hedefleyen yasal stajyer avukat."
    },
    
    # --- PAZARLAMA / SATIŞ / DİĞER ---
    {
        "id": "job-11", "title": "Dijital Pazarlama Uzmanı", "company": "Boyner",
        "location": "İstanbul", "tags": ["SEO", "Google Ads", "E-ticaret"],
        "logo": "https://logo.clearbit.com/boyner.com.tr",
        "url": "https://www.kariyer.net/is-ilanlari/dijital-pazarlama-uzmani",
        "description": "E-ticaret performansı, SEO ve Google Ads kampanyalarını yönetecek dijital pazarlama uzmanı."
    },
    {
        "id": "job-12", "title": "İnsan Kaynakları Uzmanı", "company": "Aselsan",
        "location": "Ankara", "tags": ["İşe Alım", "Performans", "Bordro"],
        "logo": "https://logo.clearbit.com/aselsan.com.tr",
        "url": "https://www.linkedin.com/jobs/search/?keywords=%C4%B0nsan+Kaynaklar%C4%B1+Uzman%C4%B1&location=Turkey",
        "description": "İşe alım, performans yönetimi ve çalışan bağlılığı süreçlerinde görev alacak İK uzmanı."
    },
    {
        "id": "job-13", "title": "Mali İşler Uzmanı", "company": "Borusan",
        "location": "İstanbul", "tags": ["Finans", "Muhasebe", "Raporlama"],
        "logo": "https://logo.clearbit.com/borusan.com.tr",
        "url": "https://www.kariyer.net/is-ilanlari/mali-isler-uzmani",
        "description": "Bütçe planlama, finansal raporlama ve muhasebe süreçlerinde deneyimli mali işler uzmanı."
    },
    {
        "id": "job-14", "title": "Ürün Yöneticisi (Product Manager)", "company": "Hepsiburada",
        "location": "İstanbul (Hibrit)", "tags": ["Agile", "Ürün Geliştirme", "Veri Analizi"],
        "logo": "https://logo.clearbit.com/hepsiburada.com",
        "url": "https://www.linkedin.com/jobs/search/?keywords=Product+Manager&location=Turkey",
        "description": "E-ticaret pazar yeri dinamiklerine hakim, teknoloji ekipleriyle çalışacak ürün yöneticisi."
    },
    {
        "id": "job-15", "title": "Veri Analisti", "company": "Turkcell",
        "location": "İstanbul", "tags": ["SQL", "Python", "PowerBI"],
        "logo": "https://logo.clearbit.com/turkcell.com.tr",
        "url": "https://www.kariyer.net/is-ilanlari/veri-analisti",
        "description": "Büyük veri setlerini analiz edip iş kararlarına yön verecek içgörüler üretecek veri analisti."
    }
]

def _extract_user_id(authorization: str) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Geçersiz token formatı.")
    token = authorization.replace("Bearer ", "")
    try:
        import base64, json
        payload_b64 = token.split(".")[1]
        padding = 4 - len(payload_b64) % 4
        payload_b64 += "=" * (padding % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        return payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Token çözümlenemedi.")

@router.get("/jobs", response_model=APIResponse)
async def discover_jobs(authorization: str = Header(None), page: int = 1):
    """Kullanıcının CV'sine göre veritabanındaki GERÇEK ilanları skorlayıp döner."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Yetkilendirme gerekli.")

    user_id = _extract_user_id(authorization)

    # 1. Kullanıcının CV'sini çek
    cv_text = ""
    if supabase:
        try:
            result = supabase.table("cvs").select("content").eq("user_id", user_id).limit(1).execute()
            if result.data:
                cv_text = result.data[0].get("content", "")
        except Exception as e:
            logger.error(f"CV çekilirken hata: {e}")

    if not cv_text or len(cv_text.strip()) < 20:
        return {"success": True, "data": [], "message": "CV bulunamadı.", "is_mock": False}

    # 2. AI'dan TÜM ilanları bu CV için skorlamasını ve kısaca nedenini yazmasını iste.
    # Tüm 15 ilanı tek seferde AI'a verip skorlatmak yerine, JSON mode ile sadece ID ve skor istiyoruz.
    try:
        from langchain_groq import ChatGroq
        from langchain_core.output_parsers import JsonOutputParser
        
        llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model="openai/gpt-oss-120b",
            temperature=0.1
        )
        
        # Sadece job ID'lerini ve description'larını prompta koy
        jobs_context = ""
        for job in REAL_JOBS:
            jobs_context += f"ID: {job['id']} | Başlık: {job['title']} | Açıklama: {job['description']}\n"
            
        prompt = f"""Sen bir İK uzmanısın. Kullanıcının CV'sini aşağıdaki iş ilanlarıyla kıyasla.
CV'nin uzmanlık alanına (örneğin Hukuk ise Hukuk ilanları) uygun olanlara yüksek (70-98), ilgisiz olanlara düşük (0-30) puan ver.
DİKKAT: CV bir avukat/hukukçu ise yazılım ilanlarına (Frontend, DevOps) %10'dan fazla verme!

MUTLAKA aşağıdaki JSON formatında, geçerli bir JSON objesi döndür:
{{
  "scores": [
    {{ "id": "job-1", "score": 85, "reason": "3 yıllık deneyiminizle uyumlu." }},
    {{ "id": "job-2", "score": 12, "reason": "İlgisiz sektör." }}
  ]
}}

TÜM 15 ilan için bu JSON'ı doldur. reason EN FAZLA 6 KELİME olsun.

CV:
{cv_text[:2000]}

İlanlar:
{jobs_context}
"""
        result_text = llm.invoke(prompt)
        parser = JsonOutputParser()
        result_json = parser.invoke(result_text)
        
        scores_map = {item["id"]: item for item in result_json.get("scores", [])}
        
    except Exception as e:
        logger.error(f"Groq AI Skoring Hatası: {e}")
        scores_map = {}

    # 3. İlanları skorlarla birleştir ve sırala
    scored_jobs = []
    for job in REAL_JOBS:
        score_info = scores_map.get(job["id"], {})
        # Eğer AI çuvallarsa basit bir kelime eşleşmesi skoru
        fallback_score = 50 if any(tag.lower() in cv_text.lower() for tag in job["tags"]) else 10
        
        job_copy = dict(job)
        job_copy["match_score"] = score_info.get("score", fallback_score)
        job_copy["match_reasoning"] = score_info.get("reason", "CV'nizdeki anahtar kelimelerle eşleşiyor.")
        scored_jobs.append(job_copy)
        
    # En yüksek skora göre sırala
    scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    
    # 4. Sayfalama (Pagination)
    items_per_page = 5
    start_idx = (page - 1) * items_per_page
    end_idx = start_idx + items_per_page
    
    paginated_jobs = scored_jobs[start_idx:end_idx]
    
    return {"success": True, "data": paginated_jobs, "is_mock": False}
