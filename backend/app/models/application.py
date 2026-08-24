from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    """Başvuru durumu enum değerleri."""
    PLANNED = "planned"        # Planlandı
    APPLIED = "applied"        # Başvuruldu
    INTERVIEW = "interview"    # Mülakat aşaması
    OFFER = "offer"            # Teklif alındı
    REJECTED = "rejected"      # Reddedildi
    ACCEPTED = "accepted"      # Kabul edildi


class Application(BaseModel):
    """Staj/iş başvurusu veri modeli."""
    id: Optional[str] = None
    company: str = Field(..., min_length=1, max_length=200, description="Şirket adı")
    position: str = Field(..., min_length=1, max_length=200, description="Pozisyon")
    status: ApplicationStatus = Field(default=ApplicationStatus.PLANNED, description="Başvuru durumu")
    notes: Optional[str] = Field(None, max_length=1000, description="Notlar")
    url: Optional[str] = Field(None, description="İlan bağlantısı")
    match_score: Optional[float] = Field(None, ge=0, le=100, description="Uyum puanı (%)")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CVData(BaseModel):
    """CV'den çıkarılan yapılandırılmış veri modeli."""
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str] = []
    experience: list[dict] = []
    education: list[dict] = []
    languages: list[str] = []
    summary: Optional[str] = None
