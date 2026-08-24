"""Başvuru yönetimi API uç noktaları.

CRUD işlemleri: Oluştur, Oku, Güncelle, Sil.
Level 3'te tam implementasyon yapılacak.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import ApplicationCreate, ApplicationUpdate, APIResponse
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Başvurular"])
service = ApplicationService()


@router.get("/", response_model=APIResponse)
async def get_applications():
    """Tüm başvuruları listeler."""
    result = await service.get_all()
    return result


@router.get("/{application_id}", response_model=APIResponse)
async def get_application(application_id: str):
    """Belirtilen ID'ye sahip başvuruyu getirir."""
    result = await service.get_by_id(application_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result


@router.post("/", response_model=APIResponse)
async def create_application(application: ApplicationCreate):
    """Yeni başvuru oluşturur."""
    result = await service.create(application)
    return result


@router.put("/{application_id}", response_model=APIResponse)
async def update_application(application_id: str, application: ApplicationUpdate):
    """Mevcut başvuruyu günceller."""
    result = await service.update(application_id, application)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result


@router.delete("/{application_id}", response_model=APIResponse)
async def delete_application(application_id: str):
    """Başvuruyu siler."""
    result = await service.delete(application_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result
