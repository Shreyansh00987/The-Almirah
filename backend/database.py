import sqlite3
import json
import math
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from backend.config import settings
from backend.schema import (
    DocumentRecord, DocumentExtractionResult, DrawerType,
    DeadlineUrgency, DrawerSummary, BoundingBox, ExtractedField
)

def get_connection():
    conn = sqlite3.connect(str(settings.DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        checksum TEXT NOT NULL,
        is_synthetic INTEGER DEFAULT 1,
        is_confirmed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        confirmed_at TEXT,
        confirmed_document_type TEXT,
        confirmed_provider TEXT,
        confirmed_identifier TEXT,
        confirmed_issue_date TEXT,
        confirmed_expiry_date TEXT,
        confirmed_amount TEXT,
        confirmed_drawer TEXT,
        days_until_deadline INTEGER,
        urgency TEXT DEFAULT 'calm',
        notes TEXT,
        raw_extraction_json TEXT NOT NULL
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id TEXT NOT NULL,
        field_name TEXT NOT NULL,
        text_chunk TEXT NOT NULL,
        embedding_json TEXT NOT NULL,
        bounding_box_json TEXT,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()

def calculate_days_until_deadline(expiry_date_str: Optional[str]) -> tuple[Optional[int], DeadlineUrgency]:
    if not expiry_date_str:
        return None, DeadlineUrgency.CALM
    try:
        # Normalize date parsing YYYY-MM-DD
        expiry_date = datetime.strptime(expiry_date_str[:10], "%Y-%m-%d").date()
        today = date.today()
        days = (expiry_date - today).days
        if days < 30:
            return days, DeadlineUrgency.RED
        elif days <= 90:
            return days, DeadlineUrgency.AMBER
        else:
            return days, DeadlineUrgency.CALM
    except Exception:
        return None, DeadlineUrgency.CALM

def row_to_document_record(row: sqlite3.Row) -> DocumentRecord:
    extraction_dict = json.loads(row["raw_extraction_json"])
    extraction = DocumentExtractionResult(**extraction_dict)
    
    days = row["days_until_deadline"]
    urgency = DeadlineUrgency(row["urgency"]) if row["urgency"] else DeadlineUrgency.CALM
    
    drawer_val = DrawerType(row["confirmed_drawer"]) if row["confirmed_drawer"] else None
    
    return DocumentRecord(
        id=row["id"],
        filename=row["filename"],
        file_path=row["file_path"],
        checksum=row["checksum"],
        is_synthetic=bool(row["is_synthetic"]),
        is_confirmed=bool(row["is_confirmed"]),
        created_at=row["created_at"],
        confirmed_at=row["confirmed_at"],
        extraction=extraction,
        confirmed_document_type=row["confirmed_document_type"],
        confirmed_provider=row["confirmed_provider"],
        confirmed_identifier=row["confirmed_identifier"],
        confirmed_issue_date=row["confirmed_issue_date"],
        confirmed_expiry_date=row["confirmed_expiry_date"],
        confirmed_amount=row["confirmed_amount"],
        confirmed_drawer=drawer_val,
        days_until_deadline=days,
        urgency=urgency,
        notes=row["notes"],
        image_url=f"/synthetic/{row['filename']}" if bool(row["is_synthetic"]) else f"/documents/{row['id']}/{Path(row['file_path']).name}"
    )

def save_document(doc: DocumentRecord) -> None:
    conn = get_connection()
    cursor = conn.cursor()
    
    days, urgency = calculate_days_until_deadline(doc.confirmed_expiry_date)
    
    cursor.execute("""
    INSERT OR REPLACE INTO documents (
        id, filename, file_path, checksum, is_synthetic, is_confirmed,
        created_at, confirmed_at, confirmed_document_type, confirmed_provider,
        confirmed_identifier, confirmed_issue_date, confirmed_expiry_date,
        confirmed_amount, confirmed_drawer, days_until_deadline, urgency, notes, raw_extraction_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        doc.id, doc.filename, doc.file_path, doc.checksum,
        1 if doc.is_synthetic else 0,
        1 if doc.is_confirmed else 0,
        doc.created_at, doc.confirmed_at,
        doc.confirmed_document_type, doc.confirmed_provider,
        doc.confirmed_identifier, doc.confirmed_issue_date,
        doc.confirmed_expiry_date, doc.confirmed_amount,
        doc.confirmed_drawer.value if doc.confirmed_drawer else None,
        days, urgency.value, doc.notes,
        doc.extraction.model_dump_json()
    ))
    conn.commit()
    conn.close()

def get_document(doc_id: str) -> Optional[DocumentRecord]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row_to_document_record(row)
    return None

def list_documents(confirmed_only: bool = False) -> List[DocumentRecord]:
    conn = get_connection()
    cursor = conn.cursor()
    if confirmed_only:
        cursor.execute("SELECT * FROM documents WHERE is_confirmed = 1 ORDER BY days_until_deadline ASC NULLS LAST")
    else:
        cursor.execute("SELECT * FROM documents ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_document_record(r) for r in rows]

def get_drawers_summary() -> List[DrawerSummary]:
    conn = get_connection()
    cursor = conn.cursor()
    
    summaries = []
    canonical_drawers = [
        DrawerType.INSURANCE,
        DrawerType.PROPERTY,
        DrawerType.VEHICLE,
        DrawerType.WARRANTIES,
        DrawerType.IDENTITY
    ]
    
    for drawer in canonical_drawers:
        cursor.execute("""
            SELECT * FROM documents 
            WHERE is_confirmed = 1 AND confirmed_drawer = ?
            ORDER BY days_until_deadline ASC NULLS LAST
        """, (drawer.value,))
        rows = cursor.fetchall()
        docs = [row_to_document_record(r) for r in rows]
        
        nearest_days = None
        nearest_date = None
        urgency = DeadlineUrgency.CALM
        
        # Determine closest upcoming deadline
        deadlines = [d for d in docs if d.days_until_deadline is not None]
        if deadlines:
            # Sort with lowest days first (including negatives if overdue)
            deadlines.sort(key=lambda x: x.days_until_deadline if x.days_until_deadline is not None else 99999)
            nearest_doc = deadlines[0]
            nearest_days = nearest_doc.days_until_deadline
            nearest_date = nearest_doc.confirmed_expiry_date
            urgency = nearest_doc.urgency
        
        summaries.append(DrawerSummary(
            drawer=drawer,
            total_documents=len(docs),
            nearest_deadline_days=nearest_days,
            nearest_deadline_date=nearest_date,
            urgency=urgency,
            documents=docs
        ))
        
    conn.close()
    return summaries

def save_embedding(document_id: str, field_name: str, text_chunk: str, embedding: List[float], bbox: Optional[BoundingBox] = None):
    conn = get_connection()
    cursor = conn.cursor()
    bbox_json = bbox.model_dump_json() if bbox else None
    cursor.execute("""
        INSERT INTO document_embeddings (document_id, field_name, text_chunk, embedding_json, bounding_box_json)
        VALUES (?, ?, ?, ?, ?)
    """, (document_id, field_name, text_chunk, json.dumps(embedding), bbox_json))
    conn.commit()
    conn.close()

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def search_similar_embeddings(query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT e.*, d.confirmed_document_type, d.confirmed_drawer, d.filename
        FROM document_embeddings e
        JOIN documents d ON e.document_id = d.id
        WHERE d.is_confirmed = 1
    """)
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        emb = json.loads(r["embedding_json"])
        sim = cosine_similarity(query_vector, emb)
        bbox = json.loads(r["bounding_box_json"]) if r["bounding_box_json"] else None
        results.append({
            "document_id": r["document_id"],
            "field_name": r["field_name"],
            "text_chunk": r["text_chunk"],
            "bounding_box": bbox,
            "document_title": r["confirmed_document_type"] or r["filename"],
            "drawer": r["confirmed_drawer"] or "Insurance",
            "similarity": sim
        })
        
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]
