"""Niyet Mektubu (Cover Letter) Üretimi API uç noktası.

Groq AI kullanarak CV içeriği ve iş pozisyonuna göre
profesyonel, şirkete özel niyet mektubu üretir.
Bağlantı hatasında mock niyet mektubu döner.
"""
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/cover-letter", tags=["Niyet Mektubu"])

MOCK_COVER_LETTER = """Sayın İnsan Kaynakları Yöneticisi,

[Şirket Adı] bünyesinde açık olan pozisyon için başvurmaktan büyük memnuniyet duyuyorum. Bilgisayar programcılığı alanındaki eğitimim ve edindiğim teknik deneyimlerle bu role önemli katkılar sağlayabileceğime inanıyorum.

Üniversite eğitimim süresince Python, JavaScript ve React gibi modern teknolojilerle gerçek dünya projeleri geliştirdim. Özellikle backend ve frontend entegrasyonu konusundaki çalışmalarım, yazılım geliştirme süreçlerine dair geniş bir perspektif kazanmamı sağladı.

Takım çalışmasına yatkın, öğrenmeye açık ve problem çözme odaklı yaklaşımımla şirketinizin hedeflerine katkıda bulunmak için sabırsızlanıyorum.

Başvurumu değerlendirdiğiniz için teşekkür eder, görüşme fırsatı talep ederim.

Saygılarımla."""


class CoverLetterRequest(BaseModel):
    cv_text: str
    company: str
    position: str
    job_description: Optional[str] = ""


@router.post("/generate")
async def generate_cover_letter(body: CoverLetterRequest):
    """CV ve pozisyon bilgisine göre niyet mektubu üretir."""
    try:
        from langchain_groq import ChatGroq
        from langchain.schema import HumanMessage, SystemMessage
        from app.config import settings

        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY eksik")

        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=800,
        )

        prompt = f"""Aşağıdaki CV bilgilerine ve iş pozisyonuna göre Türkçe, profesyonel ve kişiselleştirilmiş bir niyet mektubu yaz.

Şirket: {body.company}
Pozisyon: {body.position}
İş Tanımı: {body.job_description or 'Belirtilmedi'}

CV Özeti:
{body.cv_text[:2000]}

Kurallar:
- Mektup 3-4 paragraf olsun
- "Sayın İnsan Kaynakları Yöneticisi" ile başla
- Şirketi ve pozisyonu özellikle vurgula
- CV'deki güçlü yönleri öne çıkar
- Samimi ama profesyonel bir ton kullan
- Sadece mektup metnini yaz, başka açıklama ekleme"""

        response = llm.invoke([
            SystemMessage(content="Sen profesyonel bir kariyer danışmanısın. Türkçe niyet mektupları yazıyorsun."),
            HumanMessage(content=prompt)
        ])

        letter = response.content.strip()
        return {
            "success": True,
            "data": {"letter": letter},
            "is_mock": False
        }

    except Exception as e:
        logger.error(f"Niyet mektubu üretme hatası: {e}")
        # Fallback mock
        mock_letter = MOCK_COVER_LETTER.replace("[Şirket Adı]", body.company)
        return {
            "success": True,
            "data": {"letter": mock_letter},
            "message": "AI bağlantısı kurulamadı, örnek mektup gösteriliyor.",
            "is_mock": True
        }
