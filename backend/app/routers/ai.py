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
