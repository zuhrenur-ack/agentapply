from pypdf import PdfReader
import logging
from fastapi import UploadFile
import io

logger = logging.getLogger(__name__)

async def extract_text_from_pdf(file: UploadFile) -> str:
    """Yüklenen PDF dosyasından metin çıkarır."""
    try:
        content = await file.read()
        
        # pypdf ile oku (saf Python, derleme gerektirmez)
        reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
            
        if not text.strip():
            raise ValueError("PDF'den metin çıkarılamadı (Dosya boş veya taranmış resim olabilir).")
            
        return text
    except Exception as e:
        logger.error(f"PDF okuma hatası: {e}")
        raise e
