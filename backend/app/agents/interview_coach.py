import logging
from app.config import settings

logger = logging.getLogger(__name__)

class InterviewCoachAgent:
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
            
    async def generate_questions(self, cv_text: str, position: str) -> dict:
        try:
            if not self.is_ready or not settings.GROQ_API_KEY:
                raise ValueError("Groq API Key eksik veya langchain-groq yüklü değil.")
            
            from pydantic import BaseModel, Field
            
            class InterviewQuestion(BaseModel):
                question: str = Field(description="Sorulan mülakat sorusu")
                purpose: str = Field(description="Bu sorunun neyi ölçtüğü")
                tips: str = Field(description="Soruyu cevaplarken dikkat edilmesi gerekenler")

            class InterviewResult(BaseModel):
                questions: list[InterviewQuestion] = Field(description="3 adet mülakat sorusu", min_length=3, max_length=3)
                general_advice: str = Field(description="Mülakat için genel bir tavsiye")

            structured_llm = self.llm.with_structured_output(InterviewResult)
            
            prompt = f"""Aday "{position}" pozisyonu için mülakata girecek. 
Aşağıdaki CV'yi incele ve adayı zorlayacak ama yeteneklerini ortaya çıkaracak 3 adet mülakat sorusu hazırla.
Türkçe yanıt ver.

CV:
{cv_text[:2000]}
"""
            
            result = structured_llm.invoke(prompt)
            return result.model_dump()
        except Exception as e:
            logger.error(f"Interview Coach hatası: {e}")
            raise e
