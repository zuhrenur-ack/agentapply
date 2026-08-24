from pydantic import BaseModel, Field
from typing import Optional, Any
from app.models.application import Application, ApplicationStatus


class ApplicationCreate(BaseModel):
    """Yeni başvuru oluşturma isteği."""
    company: str = Field(..., min_length=1, max_length=200)
    position: str = Field(..., min_length=1, max_length=200)
    status: ApplicationStatus = ApplicationStatus.PLANNED
    notes: Optional[str] = None
    url: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Başvuru güncelleme isteği."""
    company: Optional[str] = Field(None, min_length=1, max_length=200)
    position: Optional[str] = Field(None, min_length=1, max_length=200)
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    url: Optional[str] = None


class APIResponse(BaseModel):
    """Standart API yanıt formatı.
    
    is_mock: True ise yanıt yedek (mock) verilerden oluşturulmuştur.
    """
    success: bool = True
    data: Optional[Any] = None
    message: str = "İşlem başarılı."
    is_mock: bool = False


class HealthResponse(BaseModel):
    """Sağlık kontrolü yanıtı."""
    status: str = "ok"
    version: str = "1.0.0"
    database: str = "disconnected"
