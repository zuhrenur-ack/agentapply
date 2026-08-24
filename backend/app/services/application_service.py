"""Başvuru iş mantığı servisi.

Veritabanı CRUD işlemlerini yönetir.
Supabase erişilemezse fallback mekanizmasını kullanır.
"""
import logging
from typing import Optional
from app.models.schemas import ApplicationCreate, ApplicationUpdate
from app.utils.fallback import get_fallback_response

logger = logging.getLogger(__name__)


class ApplicationService:
    """Başvuru işlemlerini yöneten servis sınıfı."""
    
    async def get_all(self) -> dict:
        """Tüm başvuruları getirir."""
        try:
            from app.database.supabase_client import supabase
            if supabase is None:
                raise ConnectionError("Supabase bağlantısı yok.")
            
            response = supabase.table("applications").select("*").execute()
            return {
                "success": True,
                "data": response.data,
                "message": "Başvurular başarıyla getirildi.",
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Başvuruları getirme hatası: {e}")
            return get_fallback_response("applications")
    
    async def get_by_id(self, application_id: str) -> dict:
        """Belirtilen ID'ye sahip başvuruyu getirir."""
        try:
            from app.database.supabase_client import supabase
            if supabase is None:
                raise ConnectionError("Supabase bağlantısı yok.")
            
            response = supabase.table("applications").select("*").eq("id", application_id).execute()
            if not response.data:
                return {"success": False, "data": None, "message": "Başvuru bulunamadı.", "is_mock": False}
            return {
                "success": True,
                "data": response.data[0],
                "message": "Başvuru getirildi.",
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Başvuru getirme hatası: {e}")
            return get_fallback_response("applications")
    
    async def create(self, application: ApplicationCreate) -> dict:
        """Yeni başvuru oluşturur."""
        try:
            from app.database.supabase_client import supabase
            if supabase is None:
                raise ConnectionError("Supabase bağlantısı yok.")
            
            data = application.model_dump()
            response = supabase.table("applications").insert(data).execute()
            return {
                "success": True,
                "data": response.data[0] if response.data else data,
                "message": "Başvuru başarıyla oluşturuldu.",
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Başvuru oluşturma hatası: {e}")
            return {
                "success": True,
                "data": application.model_dump(),
                "message": "Veritabanına ulaşılamadı. Başvuru kaydedilemedi.",
                "is_mock": True
            }
    
    async def update(self, application_id: str, application: ApplicationUpdate) -> dict:
        """Mevcut başvuruyu günceller."""
        try:
            from app.database.supabase_client import supabase
            if supabase is None:
                raise ConnectionError("Supabase bağlantısı yok.")
            
            data = application.model_dump(exclude_unset=True)
            response = supabase.table("applications").update(data).eq("id", application_id).execute()
            if not response.data:
                return {"success": False, "data": None, "message": "Güncellenecek başvuru bulunamadı.", "is_mock": False}
            return {
                "success": True,
                "data": response.data[0],
                "message": "Başvuru güncellendi.",
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Başvuru güncelleme hatası: {e}")
            return {
                "success": True,
                "data": {"id": application_id, **application.model_dump(exclude_unset=True)},
                "message": "Veritabanına ulaşılamadı. Güncelleme kaydedilemedi.",
                "is_mock": True
            }
    
    async def delete(self, application_id: str) -> dict:
        """Başvuruyu siler."""
        try:
            from app.database.supabase_client import supabase
            if supabase is None:
                raise ConnectionError("Supabase bağlantısı yok.")
            
            response = supabase.table("applications").delete().eq("id", application_id).execute()
            return {
                "success": True,
                "data": {"id": application_id},
                "message": "Başvuru silindi.",
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Başvuru silme hatası: {e}")
            return {
                "success": False,
                "data": None,
                "message": "Veritabanına ulaşılamadı. Silme işlemi gerçekleştirilemedi.",
                "is_mock": True
            }
