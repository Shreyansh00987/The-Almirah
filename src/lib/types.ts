export type DrawerType = 'Insurance' | 'Property' | 'Vehicle' | 'Warranties' | 'Identity';

export type DeadlineUrgency = 'calm' | 'amber' | 'red';

export interface BoundingBox {
  ymin: number; // 0 to 1000
  xmin: number; // 0 to 1000
  ymax: number; // 0 to 1000
  xmax: number; // 0 to 1000
  page?: number;
}

export interface ExtractedField {
  value: string | null;
  confidence: number; // 0.0 to 1.0
  bounding_box?: BoundingBox | null;
  raw_text?: string | null;
  is_user_edited?: boolean;
}

export interface DocumentExtractionResult {
  document_type: ExtractedField;
  provider: ExtractedField;
  identifier: ExtractedField;
  issue_date: ExtractedField;
  expiry_date: ExtractedField;
  amount: ExtractedField;
  drawer: ExtractedField;
}

export interface DocumentRecord {
  id: string;
  filename: string;
  file_path: string;
  image_url: string;
  checksum: string;
  is_synthetic: boolean;
  is_confirmed: boolean;
  created_at: string;
  confirmed_at?: string | null;
  extraction: DocumentExtractionResult;
  confirmed_document_type?: string | null;
  confirmed_provider?: string | null;
  confirmed_identifier?: string | null;
  confirmed_issue_date?: string | null;
  confirmed_expiry_date?: string | null;
  confirmed_amount?: string | null;
  confirmed_drawer?: DrawerType | null;
  days_until_deadline?: number | null;
  urgency: DeadlineUrgency;
  notes?: string | null;
}

export interface DrawerSummary {
  drawer: DrawerType;
  total_documents: number;
  nearest_deadline_days: number | null;
  nearest_deadline_date: string | null;
  urgency: DeadlineUrgency;
  documents: DocumentRecord[];
}

export interface AskCitation {
  document_id: string;
  document_title: string;
  field_name: string;
  cited_text: string;
  drawer: DrawerType;
  bounding_box?: BoundingBox | null;
  page: number;
}

export interface AskResponse {
  question: string;
  answer: string;
  found_in_corpus: boolean;
  citations: AskCitation[];
  inference_time_ms: number;
  model_used: string;
}

export interface DocumentVerificationPayload {
  id: string;
  document_type: string;
  provider: string;
  identifier: string;
  issue_date?: string | null;
  expiry_date?: string | null;
  amount?: string | null;
  drawer: DrawerType;
  notes?: string | null;
}

export interface HealthStatus {
  status: string;
  offline_verified: boolean;
  ollama_connected: boolean;
  text_model: string;
  vision_model: string;
  embedding_model: string;
  ocr_fallback_active: boolean;
  total_documents: number;
  confirmed_deadlines: number;
}

export interface OfflineStatus {
  isOffline: boolean;
  checkedAt: string;
  checks: {
    noExternalCalls: boolean;
    cspActive: boolean;
    selfHostedFonts: boolean;
    localBackendOnly: boolean;
  };
}
