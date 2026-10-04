import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional
import httpx
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.schema import (
    DocumentRecord, DocumentVerificationPayload, DrawerSummary,
    AskResponse, HealthStatus, DrawerType, DeadlineUrgency
)
from backend.database import (
    init_db, save_document, get_document, list_documents,
    get_drawers_summary, save_embedding, calculate_days_until_deadline
)
from backend.pipeline.preprocessor import preprocess_document_image
from backend.pipeline.extractor import extract_document_fields
from backend.pipeline.rag import answer_question, get_embedding

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Offline-first document sanctuary with local AI reasoning and 3D Almirah cabinet."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Mount static asset routes
PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"
SYNTHETIC_DIR = PUBLIC_DIR / "synthetic"
SYNTHETIC_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/synthetic", StaticFiles(directory=str(SYNTHETIC_DIR)), name="synthetic")
app.mount("/documents", StaticFiles(directory=str(settings.STORAGE_DIR)), name="documents")

@app.get("/api/health", response_model=HealthStatus)
async def get_health():
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            res = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            ollama_ok = res.status_code == 200
    except Exception:
        ollama_ok = False

    all_docs = list_documents()
    confirmed = [d for d in all_docs if d.is_confirmed]

    return HealthStatus(
        status="healthy",
        offline_verified=True,
        ollama_connected=ollama_ok,
        text_model=settings.TEXT_MODEL_NAME,
        vision_model=settings.VISION_MODEL_NAME,
        embedding_model=settings.EMBEDDING_MODEL_NAME,
        ocr_fallback_active=settings.ENABLE_OCR_FALLBACK,
        total_documents=len(all_docs),
        confirmed_deadlines=len(confirmed)
    )

@app.get("/api/drawers", response_model=List[DrawerSummary])
async def get_drawers():
    return get_drawers_summary()

@app.get("/api/documents", response_model=List[DocumentRecord])
async def get_all_documents(confirmed_only: bool = Query(False)):
    return list_documents(confirmed_only=confirmed_only)

@app.get("/api/documents/{doc_id}", response_model=DocumentRecord)
async def get_doc_by_id(doc_id: str):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.post("/api/documents/upload", response_model=DocumentRecord)
async def upload_document(file: UploadFile = File(...)):
    doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
    doc_folder = settings.STORAGE_DIR / doc_id
    doc_folder.mkdir(parents=True, exist_ok=True)
    
    # Save raw upload
    raw_path = doc_folder / f"raw_{file.filename}"
    with open(raw_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Preprocess (deskew, contrast enhancement, crop)
    processed_filename = f"norm_{Path(file.filename).stem}.png"
    processed_path = doc_folder / processed_filename
    checksum, width, height = preprocess_document_image(raw_path, processed_path)
    
    # Run structured extraction
    extraction = await extract_document_fields(processed_path)
    
    # Determine predicted urgency
    days, urgency = calculate_days_until_deadline(extraction.expiry_date.value)
    
    predicted_drawer = None
    if extraction.drawer.value:
        try:
            predicted_drawer = DrawerType(extraction.drawer.value)
        except Exception:
            predicted_drawer = DrawerType.INSURANCE

    doc_record = DocumentRecord(
        id=doc_id,
        filename=file.filename,
        file_path=str(processed_path),
        checksum=f"sha256:{checksum}",
        is_synthetic=False,
        is_confirmed=False, # Must be confirmed on verify screen!
        created_at=datetime.utcnow().isoformat() + "Z",
        extraction=extraction,
        confirmed_document_type=extraction.document_type.value,
        confirmed_provider=extraction.provider.value,
        confirmed_identifier=extraction.identifier.value,
        confirmed_issue_date=extraction.issue_date.value,
        confirmed_expiry_date=extraction.expiry_date.value,
        confirmed_amount=extraction.amount.value,
        confirmed_drawer=predicted_drawer,
        days_until_deadline=days,
        urgency=urgency,
        notes=None
    )
    
    save_document(doc_record)
    return doc_record

@app.post("/api/documents/verify", response_model=DocumentRecord)
async def verify_and_confirm_document(payload: DocumentVerificationPayload):
    doc = get_document(payload.id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    days, urgency = calculate_days_until_deadline(payload.expiry_date)
    
    doc.is_confirmed = True
    doc.confirmed_at = datetime.utcnow().isoformat() + "Z"
    doc.confirmed_document_type = payload.document_type
    doc.confirmed_provider = payload.provider
    doc.confirmed_identifier = payload.identifier
    doc.confirmed_issue_date = payload.issue_date
    doc.confirmed_expiry_date = payload.expiry_date
    doc.confirmed_amount = payload.amount
    doc.confirmed_drawer = payload.drawer
    doc.days_until_deadline = days
    doc.urgency = urgency
    doc.notes = payload.notes
    
    save_document(doc)
    
    # Compute and index embeddings for RAG retrieval
    fields_to_embed = [
        ("Document Type", payload.document_type, doc.extraction.document_type.bounding_box),
        ("Provider", payload.provider, doc.extraction.provider.bounding_box),
        ("Identifier", payload.identifier, doc.extraction.identifier.bounding_box),
        ("Expiry Date", payload.expiry_date, doc.extraction.expiry_date.bounding_box),
        ("Amount", payload.amount, doc.extraction.amount.bounding_box),
    ]
    
    for field_name, val, bbox in fields_to_embed:
        if val:
            chunk = f"{payload.document_type} - {field_name}: {val}"
            emb = await get_embedding(chunk)
            if emb:
                save_embedding(doc.id, field_name, chunk, emb, bbox)
                
    return doc

@app.post("/api/ask", response_model=AskResponse)
async def ask_rag(payload: dict):
    question = payload.get("question", "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return await answer_question(question)
