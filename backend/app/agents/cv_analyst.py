import logging
from app.config import settings

logger = logging.getLogger(__name__)

class CVAnalystAgent:
    def __init__(self):
        try:
            from langchain_groq import ChatGroq
            self.llm = ChatGroq(
                model="openai/gpt-oss-120b",
                groq_api_key=settings.GROQ_API_KEY
            )
            self.is_ready = bool(settings.GROQ_API_KEY)
        except ImportError:
            self.is_ready = False
            logger.warning("langchain-groq yüklü değil.")
            
    async def analyze(self, cv_text: str) -> dict:
        try:
            if not self.is_ready or not settings.GROQ_API_KEY:
                raise ValueError("Groq API Key eksik veya langchain-groq yüklü değil.")
            
            from pydantic import BaseModel, Field
            
            class CVAnalysisResult(BaseModel):
                summary: str = Field(description="CV'nin kısa ve profesyonel bir özeti (2-3 cümle)")
                strengths: list[str] = Field(description="Adayın güçlü yönleri (3-5 madde)")
                weaknesses: list[str] = Field(description="Geliştirilebilecek yönler (2-3 madde)")
                recommended_roles: list[str] = Field(description="Uygun görülen rol/pozisyon önerileri (2-4 madde)")

            text_to_analyze = cv_text[:4000]
            structured_llm = self.llm.with_structured_output(CVAnalysisResult)
            
            prompt = f"""Aşağıda verilen CV metnini dikkatlice incele. 
Adayın gerçek deneyimlerine, becerilerine ve eğitim geçmişine dayanarak analiz yap.
Yanıtını Türkçe ver. Yazılım, mühendislik veya başka bir alana ön yargılı bakma — CV ne söylüyorsa onu analiz et.

CV Metni:
{text_to_analyze}
"""
            
            result = structured_llm.invoke(prompt)
            return result.model_dump()
        except Exception as e:
            logger.error(f"CV Analyst hatası: {e}")
            raise e
