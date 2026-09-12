"""AgentApply API — Ana Giriş Noktası.

AI Destekli Staj ve Kariyer Asistanı backend servisi.
Clean Architecture prensipleriyle yapılandırılmıştır.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
# ==============================================================================
# ROUTER İÇE AKTARMALARI (ROUTER IMPORTS)
# ==============================================================================
# HATA NOTU & ÇÖZÜMÜ (502 Bad Gateway):
# İlk yayınlamada 'discover' router dosyası henüz oluşturulmadan buraya import yazıldığı için
# Python başlangıçta ImportError verdi ve Railway sunucusu tamamen çöktü (502 Bad Gateway).
# Çözüm olarak boş bir discover router dosyası oluşturulup import tamamlanmıştır.
from app.routers import applications, ai, profile, cover_letter, discover

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPI Uygulama Örneği (Swagger UI /docs adresinde otomatik dokümantasyon oluşturur)
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Destekli Staj ve Kariyer Asistanı API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ==============================================================================
# CORS (Cross-Origin Resource Sharing) GÜVENLİK VE ERİŞİM AYARLARI
# ==============================================================================
# Vercel üzerindeki frontend (React) uygulamasının, Railway üzerindeki backend API'sine
# erişebilmesi için tüm istek kaynaklarına (origins), metodlarına ve başlıklarına izin verilmiştir.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# YÖNLENDİRİCİLERİN (ROUTERS) UYGULAMAYA BAĞLANMASI
# Tüm modüller '/api' ön eki ile dış dünyaya açılır (Örn: /api/applications, /api/discover)
app.include_router(applications.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(cover_letter.router, prefix="/api")
app.include_router(discover.router, prefix="/api")


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
