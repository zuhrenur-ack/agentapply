"""Dış ilanları keşfetme ve AI eşleştirme (Adım 3 — V2).

CV'yi okuyan AI, kullanıcının alanına uygun gerçekçi ilanlar üretir,
her biri için uyum puanı ve 1 cümlelik eksik/uyumlu analizi verir.
Linkleri LinkedIn veya Kariyer.net arama sayfalarına yönlendirir.
"""
import logging
import urllib.parse
from fastapi import APIRouter, Header, HTTPException
from app.models.schemas import APIResponse
from app.database.supabase_client import supabase
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/discover", tags=["Keşfet"])


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


def _build_url(title: str, source: str) -> str:
    """İlan başlığından LinkedIn veya Kariyer.net arama URL'si oluşturur."""
    encoded = urllib.parse.quote(title)
    if source == "linkedin":
        return f"https://www.linkedin.com/jobs/search/?keywords={encoded}&location=T%C3%BCrkiye"
    else:
        return f"https://www.kariyer.net/is-ilanlari?arama={encoded}"


@router.get("/jobs", response_model=APIResponse)
async def discover_jobs(authorization: str = Header(None)):
    """Kullanıcının CV'sine uygun ilanlar üretir ve skorlar."""
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

    # CV yoksa uyarı döndür
    if not cv_text or len(cv_text.strip()) < 20:
        return {
            "success": True,
            "data": [],
            "message": "CV bulunamadı. Profil sekmesinden CV'ni kaydet.",
            "is_mock": False
        }

    # 2. Groq AI ile CV'ye uygun ilanlar üret
    try:
        from langchain_groq import ChatGroq
        from langchain_core.messages import HumanMessage, SystemMessage
        from pydantic import BaseModel, Field
        import json

        class JobListing(BaseModel):
            title: str = Field(description="İş ilanı başlığı")
            company: str = Field(description="Türkiye'deki gerçek veya gerçekçi bir şirket adı")
            location: str = Field(description="Şehir ve çalışma modeli (Uzaktan/Hibrit/Ofis)")
            tags: list[str] = Field(description="3 anahtar yetkinlik etiketi")
            match_score: int = Field(description="0-100 arası CV uyum puanı")
            match_reasoning: str = Field(description="Neden uyumlu veya eksik: tek kısa cümle")
            source: str = Field(description="linkedin veya kariyer")

        class DiscoverResult(BaseModel):
            jobs: list[JobListing] = Field(description="6 adet iş ilanı")

        llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model="openai/gpt-oss-120b",
        )
        structured_llm = llm.with_structured_output(DiscoverResult)

        prompt = f"""Aşağıdaki CV'yi dikkatlice oku. Bu kişinin meslek alanını, deneyim yılını ve yetkinliklerini analiz et.

Sonra bu kişinin GERÇEKTEN İLGİLENEBİLECEĞİ, kendi alanına uygun 6 farklı iş ilanı oluştur.
Örneğin CV sahibi avukatsa avukatlık/hukuk ilanları, pazarlamacıysa pazarlama ilanları, yazılımcıysa yazılım ilanları olmalı.

Her ilan için:
- title: İlan başlığı (Türkçe)
- company: Türkiye'deki gerçek veya gerçekçi bir şirket adı
- location: Şehir ve çalışma şekli
- tags: 3 kısa anahtar kelime
- match_score: 0-100 arası uyum puanı. CV'deki deneyim yılı, beceriler ve eğitime göre puanla. En az 2 ilan %60 üstü olsun.
- match_reasoning: Tek kısa cümle. Eksik olan veya uyumlu olan 1 somut şeyi belirt. Örneğin: "İstenen 5 yıl deneyim, CV'de 2 yıl var." veya "Aranan Excel ve SAP yetkinlikleri CV'de mevcut."
- source: "linkedin" veya "kariyer" (rastgele dağıt)

CV:
{cv_text[:3000]}"""

        result = structured_llm.invoke(prompt)
        jobs_list = []
        for job in result.jobs:
            job_dict = job.model_dump()
            job_dict["url"] = _build_url(job.title, job.source)
            job_dict["id"] = f"ai-{hash(job.title) % 100000}"
            jobs_list.append(job_dict)

        # Skora göre sırala
        jobs_list.sort(key=lambda x: x["match_score"], reverse=True)

        return {"success": True, "data": jobs_list, "is_mock": False}

    except Exception as e:
        logger.error(f"Discover AI hatası: {e}")
        # Fallback: CV'deki anahtar kelimelerden basit URL oluştur
        import re
        words = re.findall(r'\b[A-ZÇĞİÖŞÜa-zçğıöşü]{4,}\b', cv_text[:500])
        keyword = words[0] if words else "iş"
        fallback_jobs = [
            {
                "id": "fallback-1",
                "title": f"{keyword} alanında pozisyon",
                "company": "Çeşitli Şirketler",
                "location": "Türkiye",
                "tags": [keyword],
                "match_score": 0,
                "match_reasoning": "AI bağlantı hatası. Linklere tıklayarak ilanları görebilirsin.",
                "source": "linkedin",
                "url": _build_url(keyword, "linkedin"),
            }
        ]
        return {"success": True, "data": fallback_jobs, "is_mock": True}
