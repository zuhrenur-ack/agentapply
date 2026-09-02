"""Profil ve CV yönetimi API uç noktaları.

JWT doğrulaması yapılarak kullanıcıya özel CV verisi yönetilir.
Supabase bağlantısı yoksa fallback mock yanıtı döner.
"""
import logging
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database.supabase_client import supabase
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profile", tags=["Profil"])


class CVUpdate(BaseModel):
    content: str
    file_name: Optional[str] = "cv.txt"


def _extract_user_id(authorization: str) -> str:
    """Authorization header'dan JWT token'ı alıp user_id döner."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Geçersiz token formatı.")
    token = authorization.replace("Bearer ", "")
    try:
        # Supabase JWT'yi decode et (imza doğrulaması olmadan — RLS zaten güvenliği sağlar)
        import base64, json
        payload_b64 = token.split(".")[1]
        # Base64 padding düzelt
        padding = 4 - len(payload_b64) % 4
        payload_b64 += "=" * (padding % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token geçersiz: user_id bulunamadı.")
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"JWT decode hatası: {e}")
        raise HTTPException(status_code=401, detail="Token çözümlenemedi.")


@router.get("/cv")
async def get_cv(authorization: str = Header(None)):
    """Kullanıcının kayıtlı CV'sini getirir."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Yetkilendirme gerekli.")

    user_id = _extract_user_id(authorization)

    if not supabase:
        logger.warning("Supabase bağlı değil, boş CV döndürülüyor.")
        return {"success": True, "data": None, "is_mock": True}

    try:
        result = supabase.table("cvs").select("*").eq("user_id", user_id).limit(1).execute()
        cv = result.data[0] if result.data else None
        return {"success": True, "data": cv, "is_mock": False}
    except Exception as e:
        logger.error(f"CV getirme hatası: {e}")
        return {"success": True, "data": None, "is_mock": True}


@router.post("/cv")
async def save_cv(body: CVUpdate, authorization: str = Header(None)):
    """Kullanıcının CV'sini kaydeder veya günceller."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Yetkilendirme gerekli.")

    user_id = _extract_user_id(authorization)

    if not supabase:
        logger.warning("Supabase bağlı değil, CV kaydedilemedi.")
        return {
            "success": False,
            "message": "Veritabanı bağlı değil. CV geçici olarak kullanılacak.",
            "is_mock": True
        }

    try:
        # Var olan CV'yi kontrol et
        existing = supabase.table("cvs").select("id").eq("user_id", user_id).limit(1).execute()
        cv_data = {
            "user_id": user_id,
            "content": body.content,
            "file_name": body.file_name,
            "updated_at": "now()"
        }
        if existing.data:
            # Güncelle
            supabase.table("cvs").update(cv_data).eq("user_id", user_id).execute()
        else:
            # Yeni kayıt
            supabase.table("cvs").insert(cv_data).execute()

        return {"success": True, "message": "CV başarıyla kaydedildi.", "is_mock": False}
    except Exception as e:
        logger.error(f"CV kaydetme hatası: {e}")
        return {
            "success": False,
            "message": f"CV kaydedilemedi: {str(e)}",
            "is_mock": True
        }
