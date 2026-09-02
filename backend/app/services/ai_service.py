import logging
from fastapi import UploadFile
from app.agents.cv_analyst import CVAnalystAgent
from app.agents.job_matcher import JobMatcherAgent
from app.agents.interview_coach import InterviewCoachAgent
from app.utils.pdf_parser import extract_text_from_pdf
from app.utils.fallback import get_fallback_response

logger = logging.getLogger(__name__)

class AIService:
    """AI Asistan işlemlerini yöneten servis sınıfı."""
    
    def __init__(self):
        self.cv_analyst = CVAnalystAgent()
        self.job_matcher = JobMatcherAgent()
        self.interview_coach_agent = InterviewCoachAgent()
        
    async def analyze_cv(self, file: UploadFile) -> dict:
        """PDF CV'yi analiz eder."""
        try:
            # PDF içeriğini metne çevir
            cv_text = await extract_text_from_pdf(file)
            
            # Gemini ile analiz et
            analysis_result = await self.cv_analyst.analyze(cv_text)
            
            # Analiz sonucuna ham metni de ekle (frontend'in görebilmesi için)
            if isinstance(analysis_result, dict):
                analysis_result["raw_text"] = cv_text

            return {
                "success": True,
                "data": analysis_result,
                "message": "CV başarıyla analiz edildi.",
                "is_mock": False
            }
        except Exception as e:
            import traceback
            logger.error(f"CV Analizi sırasında hata: {e}")
            logger.error(f"Tam hata: {traceback.format_exc()}")
            return get_fallback_response("cv_analysis")
            
    async def match_jobs(self, file: UploadFile, job_description: str) -> dict:
        """CV ile iş ilanını eşleştirir."""
        try:
            cv_text = await extract_text_from_pdf(file)
            analysis_result = await self.job_matcher.match(cv_text, job_description)
            return {
                "success": True,
                "data": analysis_result,
                "message": "İş ilanı başarıyla eşleştirildi.",
                "is_mock": False
            }
        except Exception as e:
            import traceback
            logger.error(f"İş Eşleştirme sırasında hata: {e}")
            logger.error(f"Tam hata: {traceback.format_exc()}")
            return get_fallback_response("job_matches")
            
    async def interview_coach(self, file: UploadFile, position: str) -> dict:
        """Belirtilen pozisyon için mülakat soruları üretir."""
        try:
            cv_text = await extract_text_from_pdf(file)
            analysis_result = await self.interview_coach_agent.generate_questions(cv_text, position)
            return {
                "success": True,
                "data": analysis_result,
                "message": "Mülakat soruları başarıyla üretildi.",
                "is_mock": False
            }
        except Exception as e:
            import traceback
            logger.error(f"Mülakat Koçu sırasında hata: {e}")
            logger.error(f"Tam hata: {traceback.format_exc()}")
            return get_fallback_response("interview_questions")
