import logging
from app.config import settings

logger = logging.getLogger(__name__)

class JobMatcherAgent:
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
            
    async def match(self, cv_text: str, job_description: str) -> dict:
        try:
            if not self.is_ready or not settings.GROQ_API_KEY:
                raise ValueError("Groq API Key eksik veya langchain-groq yüklü değil.")
            
            from pydantic import BaseModel, Field
            
            class MatchResult(BaseModel):
                score: int = Field(description="0-100 arası uyum puanı")
                reasoning: str = Field(description="Bu puanın neden verildiğine dair 2-3 cümlelik açıklama")
                missing_skills: list[str] = Field(description="İlanda istenen ama CV'de eksik olan beceriler")

            structured_llm = self.llm.with_structured_output(MatchResult)
            
            prompt = f"""Bir adayın CV'sini aşağıdaki iş ilanıyla karşılaştır.
Adayın bu işe ne kadar uygun olduğunu 100 üzerinden puanla.
Türkçe yanıt ver.

CV:
{cv_text[:2000]}

İş İlanı:
{job_description[:1000]}
"""
            
            result = structured_llm.invoke(prompt)
            return result.model_dump()
        except Exception as e:
            logger.error(f"Job Matcher hatası: {e}")
            raise e
