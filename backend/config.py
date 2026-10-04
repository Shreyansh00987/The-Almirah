import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "The Almirah"
    VERSION: str = "1.0.0"
    
    # Storage
    STORAGE_DIR: Path = BASE_DIR / "data" / "documents"
    DATABASE_PATH: Path = BASE_DIR / "data" / "almirah.db"
    
    # Ollama Local Inference Settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    TEXT_MODEL_NAME: str = os.getenv("TEXT_MODEL_NAME", "qwen2.5:7b")
    VISION_MODEL_NAME: str = os.getenv("VISION_MODEL_NAME", "qwen2.5-vl:7b")
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "bge-m3")
    
    # Fallback and Mode
    ENABLE_OCR_FALLBACK: bool = os.getenv("ENABLE_OCR_FALLBACK", "true").lower() == "true"
    DEMO_MODE: bool = os.getenv("NEXT_PUBLIC_DEMO_MODE", "false").lower() == "true"
    
    # Network restriction: Live mode strictly enforces 127.0.0.1 / localhost, or allowed origins in production
    ALLOWED_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:8000,http://127.0.0.1:8000"
        ).split(",") if origin.strip()
    ]

settings = Settings()

# Ensure directories exist
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
settings.DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
