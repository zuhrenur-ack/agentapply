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
async def skill_gap_analysis():
    """Kullanıcının yetenekleri ile piyasa gereksinimlerini kıyaslar."""
    # Şimdilik mock veri dönüyoruz, ileride kullanıcının kayıtlı CV'si ile DB'deki ilanlar analiz edilebilir.
    mock_data = {
        "radar_data": [
            {"subject": "React", "A": 90, "B": 85, "fullMark": 100},
            {"subject": "Python", "A": 85, "B": 70, "fullMark": 100},
            {"subject": "TypeScript", "A": 30, "B": 90, "fullMark": 100},
            {"subject": "SQL", "A": 75, "B": 80, "fullMark": 100},
            {"subject": "AWS", "A": 20, "B": 65, "fullMark": 100},
        ],
        "recommendations": [
            "React bilgin çok güçlü ancak başvurduğun ilanların %70'i TypeScript istiyor. TypeScript öğrenmeye öncelik vermelisin.",
            "Python yeteneklerin piyasa ortalamasının üzerinde, bunu mülakatlarda kesinlikle öne çıkarmalısın.",
            "AWS ve Bulut teknolojilerinde eksiğin var, temel bir sertifika alman şansını artıracaktır."
        ]
    }
    return {"success": True, "data": mock_data, "is_mock": True}
