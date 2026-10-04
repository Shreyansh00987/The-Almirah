from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DrawerType(str, Enum):
    INSURANCE = "Insurance"
    PROPERTY = "Property"
    VEHICLE = "Vehicle"
    WARRANTIES = "Warranties"
    IDENTITY = "Identity"

class DeadlineUrgency(str, Enum):
    CALM = "calm"       # > 90 days or no expiry
    AMBER = "amber"     # 30 - 90 days
    RED = "red"         # < 30 days or overdue

class BoundingBox(BaseModel):
    # Normalized coordinates in range 0 - 1000 (relative to original image dimensions)
    ymin: int = Field(..., ge=0, le=1000, description="Top edge coordinate (0-1000)")
    xmin: int = Field(..., ge=0, le=1000, description="Left edge coordinate (0-1000)")
    ymax: int = Field(..., ge=0, le=1000, description="Bottom edge coordinate (0-1000)")
    xmax: int = Field(..., ge=0, le=1000, description="Right edge coordinate (0-1000)")
    page: int = Field(1, ge=1, description="Page number (1-indexed)")

class ExtractedField(BaseModel):
    value: Optional[str] = Field(None, description="Extracted string value or date")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")
    bounding_box: Optional[BoundingBox] = Field(None, description="Source region on the document")
    raw_text: Optional[str] = Field(None, description="Raw OCR token or text span")
    is_user_edited: bool = Field(False, description="Whether user manually corrected this field")

class DocumentExtractionResult(BaseModel):
    document_type: ExtractedField
    provider: ExtractedField
    identifier: ExtractedField
    issue_date: ExtractedField
    expiry_date: ExtractedField
    amount: ExtractedField
    drawer: ExtractedField

class DocumentVerificationPayload(BaseModel):
    id: str
    document_type: str
    provider: str
    identifier: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    amount: Optional[str] = None
    drawer: DrawerType
    notes: Optional[str] = None

class DocumentRecord(BaseModel):
    id: str
    filename: str
    file_path: str
    checksum: str
    is_synthetic: bool = True
    is_confirmed: bool = False
    created_at: str
    confirmed_at: Optional[str] = None
    extraction: DocumentExtractionResult
    # Confirmed fields
    confirmed_document_type: Optional[str] = None
    confirmed_provider: Optional[str] = None
    confirmed_identifier: Optional[str] = None
    confirmed_issue_date: Optional[str] = None
    confirmed_expiry_date: Optional[str] = None
    confirmed_amount: Optional[str] = None
    confirmed_drawer: Optional[DrawerType] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None
    days_until_deadline: Optional[int] = None
    urgency: DeadlineUrgency = DeadlineUrgency.CALM

class DrawerSummary(BaseModel):
    drawer: DrawerType
    total_documents: int
    nearest_deadline_days: Optional[int]
    nearest_deadline_date: Optional[str]
    urgency: DeadlineUrgency
    documents: List[DocumentRecord] = []

class AskCitation(BaseModel):
    document_id: str
    document_title: str
    field_name: str
    cited_text: str
    drawer: DrawerType
    bounding_box: Optional[BoundingBox]
    page: int = 1

class AskResponse(BaseModel):
    question: str
    answer: str
    found_in_corpus: bool
    citations: List[AskCitation] = []
    inference_time_ms: float
    model_used: str

class HealthStatus(BaseModel):
    status: str
    offline_verified: bool
    ollama_connected: bool
    text_model: str
    vision_model: str
    embedding_model: str
    ocr_fallback_active: bool
    total_documents: int
    confirmed_deadlines: int
