"""Dış ilanları keşfetme ve AI eşleştirme (Adım 3)."""
import logging
import asyncio
from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from app.models.schemas import APIResponse
from app.database.supabase_client import supabase
from app.agents.job_matcher import JobMatcherAgent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/discover", tags=["Keşfet"])

MOCK_EXTERNAL_JOBS = [
    {
        "id": "ext-1",
        "company": "TechFusion A.Ş.",
        "title": "Frontend Developer",
        "location": "Uzaktan (Remote)",
        "description": "React, Tailwind CSS ve modern JavaScript konusunda deneyimli, API entegrasyonlarına hakim frontend geliştirici arıyoruz.",
        "url": "#"
    },
    {
        "id": "ext-2",
        "company": "DataMinds",
        "title": "Backend Yazılım Uzmanı",
        "location": "İstanbul, Türkiye",
        "description": "Python ve FastAPI kullanarak ölçeklenebilir mikroservisler geliştirecek, PostgreSQL ve Supabase deneyimi olan backend uzmanı.",
        "url": "#"
    },
    {
        "id": "ext-3",
        "company": "Global Finans",
        "title": "Full Stack Developer (GenAI)",
        "location": "Ankara (Hibrit)",
        "description": "Yapay zeka (LLM, LangChain) entegrasyonları yapabilen, React ve Python yetkinliği yüksek, problem çözme odaklı geliştirici.",
        "url": "#"
    }
]

# Ortak Auth Fonksiyonunu buraya da taşıyalım (veya profile'dan alabilirdik ama bağımsız kalsın)
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
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token çözümlenemedi.")


@router.get("/jobs", response_model=APIResponse)
async def discover_jobs(authorization: str = Header(None)):
    """Kullanıcının CV'si ile dış ilanları eşleştirip skorlarıyla döner."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Yetkilendirme gerekli.")
    
    user_id = _extract_user_id(authorization)
    
    # 1. Kullanıcının CV'sini al
    cv_text = ""
    if supabase:
        try:
            result = supabase.table("cvs").select("content").eq("user_id", user_id).limit(1).execute()
            if result.data:
                cv_text = result.data[0].get("content", "")
        except Exception as e:
            logger.error(f"CV çekilirken hata: {e}")

    jobs_with_scores = []
    
    # Eğer CV yoksa eşleştirme yapmadan sıfır skorla döndür
    if not cv_text or len(cv_text.strip()) < 20:
        for job in MOCK_EXTERNAL_JOBS:
            job_copy = dict(job)
            job_copy["match_score"] = 0
            job_copy["match_reasoning"] = "Eşleşme için CV'ni profiline kaydetmelisin."
            jobs_with_scores.append(job_copy)
        return {"success": True, "data": jobs_with_scores, "is_mock": False}

    # 2. AI Eşleştirmesi (Paralel)
    matcher = JobMatcherAgent()
    
    async def _match_single_job(job):
        job_copy = dict(job)
        try:
            # Sadece eşleşme metodunu çağırıyoruz
            match_res = await matcher.match(cv_text, job["description"])
            job_copy["match_score"] = match_res.get("score", 0)
            job_copy["match_reasoning"] = match_res.get("reasoning", "Analiz edilemedi.")
        except Exception as e:
            logger.error(f"Eşleştirme hatası {job['id']}: {e}")
            job_copy["match_score"] = 0
            job_copy["match_reasoning"] = "AI bağlantı hatası."
        return job_copy

    tasks = [_match_single_job(job) for job in MOCK_EXTERNAL_JOBS]
    jobs_with_scores = await asyncio.gather(*tasks)

    # Skora göre büyükten küçüğe sırala
    jobs_with_scores.sort(key=lambda x: x["match_score"], reverse=True)

    return {"success": True, "data": jobs_with_scores, "is_mock": False}
