"""AgentApply API — Ana Giriş Noktası.

AI Destekli Staj ve Kariyer Asistanı backend servisi.
Clean Architecture prensipleriyle yapılandırılmıştır.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import applications, ai
from app.routers import profile
from app.routers import cover_letter

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPI uygulaması
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Destekli Staj ve Kariyer Asistanı API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Ayarları — Frontend'in backend'e erişebilmesi için
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları bağla
app.include_router(applications.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(cover_letter.router, prefix="/api")


@app.get("/health", tags=["Sistem"])
async def health_check():
    """Sistem sağlık kontrolü."""
    from app.database.supabase_client import supabase
    
    db_status = "connected" if supabase is not None else "disconnected"
    
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "database": db_status,
        "app_name": settings.APP_NAME
    }


@app.get("/", tags=["Sistem"])
async def root():
    """API kök uç noktası."""
    return {
        "message": "AgentApply API'ye hoş geldiniz! 🚀",
        "docs": "/docs",
        "health": "/health"
    }


logger.info(f"{settings.APP_NAME} v{settings.APP_VERSION} başlatıldı.")
