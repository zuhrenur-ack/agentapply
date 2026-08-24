import pymupdf as fitz  # PyMuPDF (new package name)
import logging
from fastapi import UploadFile
import io

logger = logging.getLogger(__name__)

async def extract_text_from_pdf(file: UploadFile) -> str:
    """Yüklenen PDF dosyasından metin çıkarır."""
    try:
        content = await file.read()
        
        # Dosyayı hafızada (memory) aç
        pdf_document = fitz.open(stream=content, filetype="pdf")
        
        text = ""
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text += page.get_text("text") + "\n"
            
        pdf_document.close()
        
        if not text.strip():
            raise ValueError("PDF'den metin çıkarılamadı (Dosya boş veya taranmış resim olabilir).")
            
        return text
    except Exception as e:
        logger.error(f"PDF okuma hatası: {e}")
        raise e
