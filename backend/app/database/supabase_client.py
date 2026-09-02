"""Supabase veritabanı istemcisi.

Service role key ile güvenli bağlantı. Paket yoksa veya key
eksikse None döner, fallback mekanizması devreye girer.
"""
from app.config import settings
import logging

logger = logging.getLogger(__name__)

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    logger.warning("Supabase paketi yüklü değil. Mock veri kullanılacak.")


def get_supabase_client():
    """Supabase service-role istemcisini oluşturur (backend işlemleri için)."""
    if not SUPABASE_AVAILABLE:
        return None
    try:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            logger.warning("Supabase kimlik bilgileri eksik. Veritabanı devre dışı.")
            return None
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase bağlantısı başarılı.")
        return client
    except Exception as e:
        logger.error(f"Supabase bağlantı hatası: {e}")
        return None


# Uygulama genelinde kullanılacak istemci
supabase = get_supabase_client()
