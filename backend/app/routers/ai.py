"""Yapay zeka ajan API uç noktaları.

CV Analizi, İlan Eşleştirme ve Mülakat Koçu ajanları.
"""
from fastapi import APIRouter, UploadFile, File, Form
from app.models.schemas import APIResponse
from app.utils.fallback import get_fallback_response

from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["Yapay Zeka Ajanları"])
ai_service_instance = AIService()


@router.post("/analyze-cv", response_model=APIResponse)
async def analyze_cv(file: UploadFile = File(...)):
    """CV dosyasını analiz eder ve yapılandırılmış veri çıkarır."""
    result = await ai_service_instance.analyze_cv(file)
    return APIResponse(**result)


@router.post("/match-jobs", response_model=APIResponse)
async def match_jobs(file: UploadFile = File(...), job_description: str = Form(...)):
    """CV yeteneklerine göre uygun ilanları eşleştirir."""
    result = await ai_service_instance.match_jobs(file, job_description)
    return APIResponse(**result)


@router.post("/interview-coach", response_model=APIResponse)
async def interview_coach(file: UploadFile = File(...), position: str = Form(...)):
    """Mülakat soruları üretir."""
    result = await ai_service_instance.interview_coach(file, position)
    return APIResponse(**result)


@router.get("/skill-gap", response_model=APIResponse)
async def skill_gap_analysis(authorization: str = Header(None)):
    """Kullanıcının CV yeteneklerini piyasa gereksinimleriyle kıyaslar."""
    if not authorization:
        return _mock_skill_gap("Kişisel analiz için Profil sekmesinden CV'ni eklemeli ve giriş yapmalısın.")

    # 1. Token'dan user id al
    token = authorization.replace("Bearer ", "")
    user_id = None
    try:
        import base64, json
        payload_b64 = token.split(".")[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        user_id = payload.get("sub")
    except Exception:
        return _mock_skill_gap("Oturum geçerli değil.")

    # 2. CV Çek
    cv_text = ""
    from app.database.supabase_client import supabase
    if supabase:
        try:
            result = supabase.table("cvs").select("content").eq("user_id", user_id).limit(1).execute()
            if result.data:
                cv_text = result.data[0].get("content", "")
        except Exception:
            pass

    if not cv_text or len(cv_text.strip()) < 20:
        return _mock_skill_gap("Analiz için önce Profil sekmesinden CV'ni kaydetmelisin.")

    # 3. Groq AI ile Analiz
    try:
        from langchain_groq import ChatGroq
        from langchain_core.output_parsers import JsonOutputParser
        from app.config import settings
        
        llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model="openai/gpt-oss-120b",
            temperature=0.2
        )
        
        prompt = f"""Sen bir kariyer danışmanısın. Kullanıcının CV'sini okuyup yeteneklerini (Senin Seviyen)
ve Türkiye'deki ortalama iş ilanlarının beklentilerini (Piyasa Beklentisi) kıyaslayan bir Radar Grafiği verisi oluştur.

Ayrıca adaya 3 adet "Önerilen Aksiyon" ver.

MUTLAKA aşağıdaki JSON formatında, geçerli bir JSON objesi döndür:
{{
  "radar_data": [
    {{"subject": "Teknoloji/Beceri Adı 1", "A": 80, "B": 90, "fullMark": 100}},
    {{"subject": "Teknoloji/Beceri Adı 2", "A": 95, "B": 70, "fullMark": 100}},
    {{"subject": "Teknoloji/Beceri Adı 3", "A": 20, "B": 60, "fullMark": 100}},
    {{"subject": "Teknoloji/Beceri Adı 4", "A": 50, "B": 50, "fullMark": 100}},
    {{"subject": "Teknoloji/Beceri Adı 5", "A": 70, "B": 85, "fullMark": 100}}
  ],
  "recommendations": [
    "Öneri 1 (Örn: X yeteneğin piyasa standartlarının altında, Udemy'den bir kurs almalısın)",
    "Öneri 2 (Örn: Y konunda çok güçlüsün, mülakatlarda bunu öne çıkar)",
    "Öneri 3..."
  ]
}}

KURALLAR:
1. CV sahibinin alanına uygun en önemli 5 yeteneği/aracı/konuyu (subject) belirle (Örn avukatsa İdare Hukuku, Sözleşmeler, UYAP; yazılımcıysa React, Python, Git).
2. 'A' değeri: Adayın bu konudaki seviyesi (0-100). CV'den tahmin et.
3. 'B' değeri: Piyasada bu rol için istenen ortalama beklenti (0-100).
4. CV alanından BAĞIMSIZ, rastgele şeyler yazma!
5. SADECE JSON döndür.

CV:
{cv_text[:2000]}
"""
        result_text = llm.invoke(prompt)
        parser = JsonOutputParser()
        data = parser.invoke(result_text)
        
        return {"success": True, "data": data, "is_mock": False}
        
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Skill Gap AI error: {e}")
        return _mock_skill_gap("AI analizi geçici olarak yapılamadı. Daha sonra tekrar dene.")

def _mock_skill_gap(msg: str):
    mock_data = {
        "radar_data": [
            {"subject": "Yetenek 1", "A": 40, "B": 80, "fullMark": 100},
            {"subject": "Yetenek 2", "A": 85, "B": 70, "fullMark": 100},
            {"subject": "Yetenek 3", "A": 20, "B": 60, "fullMark": 100},
        ],
        "recommendations": [msg]
    }
    return {"success": True, "data": mock_data, "is_mock": True}
