"""Supabase veritabanı istemcisi.

Supabase paketi yüklü değilse veya bağlantı bilgileri eksikse
güvenli bir şekilde None döner — fallback mekanizması devreye girer.
"""
from app.config import settings
import logging

logger = logging.getLogger(__name__)

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    logger.warning("Supabase paketi yüklü değil. Veritabanı devre dışı, mock veri kullanılacak.")


def get_supabase_client():
    """Supabase istemcisini oluşturur ve döndürür.
    
    Bağlantı başarısız olursa None döner ve loglara yazar.
    """
    if not SUPABASE_AVAILABLE:
        return None
    try:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.warning("Supabase URL veya Key ayarlanmamış. Veritabanı devre dışı.")
            return None
        if settings.SUPABASE_URL == "your_supabase_url_here":
            logger.warning("Supabase henüz yapılandırılmamış. Mock veri kullanılacak.")
            return None
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase bağlantısı başarılı.")
        return client
    except Exception as e:
        logger.error(f"Supabase bağlantı hatası: {e}")
        return None

# Uygulama genelinde kullanılacak Supabase istemcisi
supabase = get_supabase_client()
