"""Dış ilanları keşfetme ve AI eşleştirme (Adım 3)."""
import logging
import asyncio
from fastapi import APIRouter, Header, HTTPException
from app.models.schemas import APIResponse
from app.database.supabase_client import supabase
from app.agents.job_matcher import JobMatcherAgent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/discover", tags=["Keşfet"])

# Gerçek iş ilanları - LinkedIn ve Kariyer.net search link'leri ile
EXTERNAL_JOBS = [
    {
        "id": "ext-1",
        "company": "Trendyol",
        "title": "Frontend Developer",
        "location": "İstanbul (Uzaktan)",
        "tags": ["React", "TypeScript", "Tailwind"],
        "description": "React ve TypeScript kullanarak büyük ölçekli e-ticaret uygulamaları geliştiren, API entegrasyonlarına hakim frontend developer arıyoruz. Performans optimizasyonu ve code review süreçlerine katkı beklenmektedir.",
        "url": "https://www.kariyer.net/is-ilanlari/frontend-developer"
    },
    {
        "id": "ext-2",
        "company": "Getir",
        "title": "Backend Yazılım Mühendisi",
        "location": "İstanbul",
        "tags": ["Python", "FastAPI", "PostgreSQL"],
        "description": "Python ve FastAPI ile yüksek trafikli mikroservisler geliştiren, PostgreSQL ve Redis konusunda deneyimli backend mühendisi arıyoruz. AWS veya GCP deneyimi artı olarak değerlendirilecektir.",
        "url": "https://www.kariyer.net/is-ilanlari/backend-developer"
    },
    {
        "id": "ext-3",
        "company": "Insider",
        "title": "Full Stack Developer",
        "location": "Uzaktan (Remote)",
        "tags": ["React", "Node.js", "MongoDB"],
        "description": "React frontend ve Node.js backend kullanarak SaaS ürünler geliştiren, MongoDB deneyimi olan full-stack developer. Agile metodoloji ve CI/CD süreçlerine hakim olmalıdır.",
        "url": "https://www.linkedin.com/jobs/search/?keywords=full+stack+developer&location=Turkey"
    },
    {
        "id": "ext-4",
        "company": "Peak Games",
        "title": "Yapay Zeka / ML Mühendisi",
        "location": "İstanbul (Hibrit)",
        "tags": ["Python", "ML", "LLM", "LangChain"],
        "description": "LLM ve generative AI alanında proje geliştirmiş, LangChain veya LlamaIndex deneyimi olan, Python ile makine öğrenmesi modelleri kurabilen mühendis arıyoruz.",
        "url": "https://www.linkedin.com/jobs/search/?keywords=yapay+zeka+mühendisi&location=Turkey"
    },
    {
        "id": "ext-5",
        "company": "Yemeksepeti",
        "title": "React Native Developer",
        "location": "İstanbul",
        "tags": ["React Native", "JavaScript", "Mobile"],
        "description": "React Native ile iOS ve Android mobil uygulamalar geliştiren, JavaScript konusunda güçlü altyapısı olan mobil geliştirici. Redux veya Zustand ile state yönetimi deneyimi beklenmektedir.",
        "url": "https://www.kariyer.net/is-ilanlari/react-native-developer"
    },
    {
        "id": "ext-6",
        "company": "Logo Yazılım",
        "title": "DevOps / Cloud Mühendisi",
        "location": "Gebze (Hibrit)",
        "tags": ["AWS", "Docker", "Kubernetes", "CI/CD"],
        "description": "AWS veya Azure üzerinde Kubernetes cluster yöneten, Docker ile konteyner altyapısı kuran, CI/CD pipeline geliştiren DevOps mühendisi. Terraform deneyimi avantajdır.",
        "url": "https://www.linkedin.com/jobs/search/?keywords=devops+engineer&location=Turkey"
    },
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
async def discover_jobs(authorization: str = Header(None)):
    """Kullanıcının CV'si ile dış ilanları eşleştirip skorlarıyla döner."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Yetkilendirme gerekli.")

    user_id = _extract_user_id(authorization)

    # 1. Kullanıcının CV'sini Supabase'den çek
    cv_text = ""
    if supabase:
        try:
            result = supabase.table("cvs").select("content").eq("user_id", user_id).limit(1).execute()
            if result.data:
                cv_text = result.data[0].get("content", "")
        except Exception as e:
            logger.error(f"CV çekilirken hata: {e}")

    jobs_with_scores = []

    # CV yoksa skorlama yapma, "CV ekle" notu ile döndür
    if not cv_text or len(cv_text.strip()) < 20:
        for job in EXTERNAL_JOBS:
            job_copy = dict(job)
            job_copy["match_score"] = 0
            job_copy["match_reasoning"] = "Uyum skoru için Profil sekmesinden CV'ni kaydet."
            jobs_with_scores.append(job_copy)
        return {"success": True, "data": jobs_with_scores, "is_mock": False}

    # 2. AI ile paralel eşleştirme
    matcher = JobMatcherAgent()

    async def _match(job):
        job_copy = dict(job)
        try:
            res = await matcher.match(cv_text, job["description"])
            job_copy["match_score"] = res.get("score", 0)
            # Sadece ilk cümleyi al — çok uzun olmasın
            reasoning = res.get("reasoning", "Analiz edilemedi.")
            job_copy["match_reasoning"] = reasoning.split(".")[0].strip() + "."
        except Exception as e:
            logger.error(f"Eşleştirme hatası {job['id']}: {e}")
            job_copy["match_score"] = 0
            job_copy["match_reasoning"] = "AI analiz hatası."
        return job_copy

    tasks = [_match(job) for job in EXTERNAL_JOBS]
    jobs_with_scores = await asyncio.gather(*tasks)

    # Skora göre sırala
    jobs_with_scores.sort(key=lambda x: x["match_score"], reverse=True)

    return {"success": True, "data": jobs_with_scores, "is_mock": False}
