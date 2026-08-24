"""Yedek (fallback) veri mekanizması.

Harici API'ler (Gemini, Supabase vb.) çöktüğünde veya erişilemez olduğunda
sistem ASLA 500 hatası dönmeyecek. Bunun yerine önceden hazırlanmış
mantıklı mock veriler kullanılacak.

is_mock: True bayrağı ile frontend'e bu durumun bildirimi sağlanacak.
"""
import logging
from typing import Any

logger = logging.getLogger(__name__)


# ==========================================
# MOCK VERİLER — API çöktüğünde kullanılır
# ==========================================

MOCK_CV_ANALYSIS = {
    "summary": "Güçlü teknik altyapıya sahip, modern web teknolojileri (React, FastAPI) ve yapay zeka (LangChain) konularında yetkin, gelişime açık bir aday.",
    "strengths": [
        "Modern frontend (React, Tailwind) ve backend (FastAPI, Python) teknolojilerinde pratik tecrübe.",
        "Yapay zeka (AI) entegrasyonlarına ilgi ve LangChain/Gemini gibi güncel araçlara aşinalık.",
        "Temiz mimari (Clean Architecture) prensiplerini kavrama ve uygulama yeteneği."
    ],
    "weaknesses": [
        "Büyük ölçekli kurumsal projelerde üretim (production) deneyimi eksikliği.",
        "Bulut sistemleri (AWS/GCP) ve CI/CD süreçleri hakkında daha fazla pratik ihtiyacı."
    ],
    "recommended_roles": [
        "Junior Full-Stack Developer",
        "Frontend Developer Stajyeri",
        "Python / AI Backend Geliştirici"
    ]
}

MOCK_APPLICATIONS = [
    {
        "id": "mock-1",
        "company": "TechCorp",
        "position": "Frontend Stajyeri",
        "status": "planned",
        "notes": "React bilgisi arıyorlar",
        "url": "https://example.com/job/1",
        "match_score": 85.0,
    },
    {
        "id": "mock-2",
        "company": "DataSoft",
        "position": "Python Backend Stajyeri",
        "status": "applied",
        "notes": "FastAPI deneyimi tercih sebebi",
        "url": "https://example.com/job/2",
        "match_score": 92.0,
    },
    {
        "id": "mock-3",
        "company": "AI Labs",
        "position": "Yapay Zeka Stajyeri",
        "status": "interview",
        "notes": "LangChain projesi anlattım",
        "url": "https://example.com/job/3",
        "match_score": 78.0,
    }
]

MOCK_JOB_MATCHES = [
    {
        "title": "Junior Full-Stack Developer",
        "company": "Innovate Tech",
        "match_score": 88.5,
        "location": "İstanbul (Uzaktan)",
        "skills_matched": ["Python", "React", "FastAPI"],
        "url": "https://example.com/job/4"
    },
    {
        "title": "Frontend Developer Intern",
        "company": "WebFlow Studios",
        "match_score": 82.0,
        "location": "Ankara",
        "skills_matched": ["JavaScript", "React"],
        "url": "https://example.com/job/5"
    }
]

MOCK_INTERVIEW_QUESTIONS = [
    "React'te state yönetimini nasıl yaparsınız? Context API ile Redux arasındaki farkları açıklayın.",
    "RESTful API tasarım prensiplerini açıklayabilir misiniz?",
    "Git ile çalışırken branch stratejiniz nedir?",
    "Python'da asenkron programlama (async/await) deneyiminiz var mı?",
    "Bir projede karşılaştığınız en büyük teknik zorluk neydi ve nasıl çözdünüz?"
]

MOCK_COVER_LETTER = """Sayın İnsan Kaynakları Yöneticisi,

Bilgisayar Programcılığı bölümü öğrencisi olarak, şirketinizde açık olan stajyer pozisyonuna başvurmak istiyorum.

Üniversite eğitimim boyunca Python, JavaScript ve React teknolojileriyle çeşitli projeler geliştirdim. Özellikle web geliştirme ve yapay zeka alanlarına olan ilgim, bu pozisyonu benim için ideal bir fırsat haline getiriyor.

Ekip çalışmasına yatkın, öğrenmeye açık ve problem çözme konusunda tutkulu bir adayım.

Saygılarımla."""


def get_fallback_response(data_type: str) -> dict:
    """Belirtilen veri türü için mock (yedek) yanıt döndürür.
    
    Args:
        data_type: Mock veri türü ('cv', 'applications', 'job_matches', 
                   'interview_questions', 'cover_letter')
    
    Returns:
        dict: is_mock=True bayrağı ile birlikte yedek veri.
    """
    logger.warning(f"FALLBACK AKTİF: '{data_type}' için mock veri kullanılıyor.")
    
    fallback_map = {
        "cv_analysis": MOCK_CV_ANALYSIS,
        "applications": MOCK_APPLICATIONS,
        "job_matches": MOCK_JOB_MATCHES,
        "interview_questions": MOCK_INTERVIEW_QUESTIONS,
        "cover_letter": MOCK_COVER_LETTER,
    }
    
    data = fallback_map.get(data_type, {})
    
    return {
        "success": True,
        "data": data,
        "message": "API'ye ulaşılamadı. Sistem yedek verilerle çevrimdışı modda çalışıyor.",
        "is_mock": True
    }
