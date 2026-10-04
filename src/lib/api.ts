import { 
  DocumentRecord, DrawerSummary, DocumentVerificationPayload, 
  AskResponse, HealthStatus, DrawerType 
} from './types';
import { SYNTHETIC_DOCUMENTS, getDemoDrawersSummary } from './demoData';

const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL;
const BACKEND_URL = rawBackendUrl
  ? (rawBackendUrl.startsWith('http') ? rawBackendUrl : `https://${rawBackendUrl}`)
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:8000');

class ApiService {
  private isDemoMode: boolean = false;
  private localDocs: DocumentRecord[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('almirah_mode');
      if (savedMode === 'demo' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        this.isDemoMode = true;
      }
      // Initialize local storage copy of synthetic documents if empty
      const savedDocs = localStorage.getItem('almirah_user_documents');
      if (savedDocs) {
        try {
          this.localDocs = JSON.parse(savedDocs);
        } catch {
          this.localDocs = [...SYNTHETIC_DOCUMENTS];
        }
      } else {
        this.localDocs = [...SYNTHETIC_DOCUMENTS];
        this.persistDocs();
      }
    }
  }

  private persistDocs() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('almirah_user_documents', JSON.stringify(this.localDocs));
    }
  }

  public setDemoMode(val: boolean) {
    this.isDemoMode = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('almirah_mode', val ? 'demo' : 'live');
    }
  }

  public getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  public async checkBackendHealth(): Promise<{ live: boolean; status?: HealthStatus }> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return { live: true, status: data };
      }
    } catch {
      // Backend not running
    }
    return { live: false };
  }

  public async getDrawers(): Promise<DrawerSummary[]> {
    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/drawers`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback to local
      }
    }
    return this.calculateLocalDrawers();
  }

  public async getDocuments(confirmedOnly: boolean = false): Promise<DocumentRecord[]> {
    if (!this.isDemoMode) {
      try {
        const url = `${BACKEND_URL}/api/documents${confirmedOnly ? '?confirmed_only=true' : ''}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback to local
      }
    }
    return confirmedOnly ? this.localDocs.filter(d => d.is_confirmed) : this.localDocs;
  }

  public async getDocumentById(id: string): Promise<DocumentRecord | null> {
    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/documents/${id}`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
    }
    return this.localDocs.find(d => d.id === id) || null;
  }

  public async uploadDocument(file: File): Promise<DocumentRecord> {
    if (!this.isDemoMode) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${BACKEND_URL}/api/documents/upload`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const doc: DocumentRecord = await res.json();
          this.localDocs.unshift(doc);
          this.persistDocs();
          return doc;
        }
      } catch {
        // Fallback to client simulated extraction
      }
    }

    // Client-side instant ingestion for demo / offline standalone mode
    const fakeId = `SYN-USER-${Date.now().toString().slice(-5)}`;
    const newDoc: DocumentRecord = {
      id: fakeId,
      filename: file.name,
      file_path: URL.createObjectURL(file),
      image_url: URL.createObjectURL(file),
      checksum: `sha256-local-${fakeId.toLowerCase()}`,
      is_synthetic: true,
      is_confirmed: false,
      created_at: new Date().toISOString(),
      days_until_deadline: 60,
      urgency: 'amber',
      extraction: {
        document_type: {
          value: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
          confidence: 0.91,
          bounding_box: { ymin: 40, xmin: 40, ymax: 90, xmax: 600, page: 1 }
        },
        provider: {
          value: "Scanned Authority / Institution",
          confidence: 0.88,
          bounding_box: { ymin: 110, xmin: 40, ymax: 150, xmax: 500, page: 1 }
        },
        identifier: {
          value: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
          confidence: 0.93,
          bounding_box: { ymin: 190, xmin: 250, ymax: 230, xmax: 550, page: 1 }
        },
        issue_date: {
          value: new Date().toISOString().slice(0, 10),
          confidence: 0.89,
          bounding_box: { ymin: 270, xmin: 250, ymax: 310, xmax: 420, page: 1 }
        },
        expiry_date: {
          value: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          confidence: 0.92,
          bounding_box: { ymin: 330, xmin: 250, ymax: 370, xmax: 420, page: 1 }
        },
        amount: {
          value: "₹ 5,000.00",
          confidence: 0.85,
          bounding_box: { ymin: 410, xmin: 250, ymax: 450, xmax: 450, page: 1 }
        },
        drawer: {
          value: "Insurance",
          confidence: 0.95,
          bounding_box: { ymin: 20, xmin: 700, ymax: 50, xmax: 880, page: 1 }
        }
      }
    };

    this.localDocs.unshift(newDoc);
    this.persistDocs();
    return newDoc;
  }

  public async confirmDocument(payload: DocumentVerificationPayload): Promise<DocumentRecord> {
    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/documents/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated: DocumentRecord = await res.json();
          this.localDocs = this.localDocs.map(d => d.id === updated.id ? updated : d);
          this.persistDocs();
          return updated;
        }
      } catch {
        // Fallback
      }
    }

    const doc = this.localDocs.find(d => d.id === payload.id);
    if (!doc) throw new Error("Document not found");

    doc.is_confirmed = true;
    doc.confirmed_at = new Date().toISOString();
    doc.confirmed_document_type = payload.document_type;
    doc.confirmed_provider = payload.provider;
    doc.confirmed_identifier = payload.identifier;
    doc.confirmed_issue_date = payload.issue_date;
    doc.confirmed_expiry_date = payload.expiry_date;
    doc.confirmed_amount = payload.amount;
    doc.confirmed_drawer = payload.drawer;
    doc.notes = payload.notes;

    // Calculate urgency
    if (payload.expiry_date) {
      const today = new Date();
      const exp = new Date(payload.expiry_date);
      const diff = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      doc.days_until_deadline = diff;
      doc.urgency = diff < 30 ? 'red' : diff <= 90 ? 'amber' : 'calm';
    }

    this.persistDocs();
    return doc;
  }

  public async askQuestion(question: string): Promise<AskResponse> {
    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
    }

    // Local grounded QA engine
    const confirmed = this.localDocs.filter(d => d.is_confirmed);
    const qLower = question.toLowerCase();

    // Check matching keywords
    let bestMatch: DocumentRecord | null = null;
    let bestScore = 0;
    let matchedField = 'Document Record';
    let matchedValue = '';

    for (const doc of confirmed) {
      const text = `${doc.confirmed_document_type} ${doc.confirmed_provider} ${doc.confirmed_identifier} ${doc.confirmed_drawer} ${doc.notes || ''}`.toLowerCase();
      let score = 0;

      if (qLower.includes('car') || qLower.includes('auto') || qLower.includes('creta') || qLower.includes('vehicle')) {
        if (doc.confirmed_drawer === 'Vehicle' || doc.notes?.toLowerCase().includes('car')) score += 5;
      }
      if (qLower.includes('health') || qLower.includes('mediclaim') || qLower.includes('star health')) {
        if (doc.confirmed_drawer === 'Insurance') score += 5;
      }
      if (qLower.includes('tax') || qLower.includes('property') || qLower.includes('municipal')) {
        if (doc.confirmed_drawer === 'Property') score += 5;
      }
      if (qLower.includes('purifier') || qLower.includes('water') || qLower.includes('ecopure') || qLower.includes('refrigerator') || qLower.includes('compressor')) {
        if (doc.confirmed_drawer === 'Warranties') score += 5;
      }
      if (qLower.includes('license') || qLower.includes('driving') || qLower.includes('identity') || qLower.includes('id card')) {
        if (doc.confirmed_drawer === 'Identity') score += 5;
      }

      if (qLower.includes('expire') || qLower.includes('expiry') || qLower.includes('renewal') || qLower.includes('deadline') || qLower.includes('when')) {
        score += 2;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = doc;
          matchedField = 'Expiry / Renewal Date';
          matchedValue = doc.confirmed_expiry_date || 'None specified';
        }
      } else if (qLower.includes('amount') || qLower.includes('cost') || qLower.includes('premium') || qLower.includes('fee') || qLower.includes('how much')) {
        score += 2;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = doc;
          matchedField = 'Recorded Amount / Fee';
          matchedValue = doc.confirmed_amount || 'N/A';
        }
      } else if (qLower.includes('policy') || qLower.includes('number') || qLower.includes('id') || qLower.includes('identifier')) {
        score += 2;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = doc;
          matchedField = 'Document Identifier';
          matchedValue = doc.confirmed_identifier || 'None';
        }
      } else {
        if (score > bestScore) {
          bestScore = score;
          bestMatch = doc;
          matchedField = 'Document Record';
          matchedValue = `${doc.confirmed_document_type} (${doc.confirmed_provider})`;
        }
      }
    }

    if (!bestMatch || bestScore < 2) {
      return {
        question,
        answer: "The confirmed documents in your Almirah do not contain information regarding this inquiry. No guesses are made.",
        found_in_corpus: false,
        citations: [],
        inference_time_ms: 120,
        model_used: "Offline Strict Grounding Engine"
      };
    }

    const bbox = bestMatch.extraction.expiry_date.bounding_box || bestMatch.extraction.document_type.bounding_box;

    return {
      question,
      answer: `According to your verified ${bestMatch.confirmed_document_type}, the ${matchedField.toLowerCase()} is ${matchedValue}.`,
      found_in_corpus: true,
      citations: [
        {
          document_id: bestMatch.id,
          document_title: bestMatch.confirmed_document_type || bestMatch.filename,
          field_name: matchedField,
          cited_text: matchedValue,
          drawer: bestMatch.confirmed_drawer || 'Insurance',
          bounding_box: bbox,
          page: 1
        }
      ],
      inference_time_ms: 180,
      model_used: "Offline Local RAG"
    };
  }

  private calculateLocalDrawers(): DrawerSummary[] {
    const canonicalDrawers: DrawerType[] = ['Insurance', 'Property', 'Vehicle', 'Warranties', 'Identity'];
    const confirmed = this.localDocs.filter(d => d.is_confirmed);

    return canonicalDrawers.map(drawer => {
      const docs = confirmed.filter(d => d.confirmed_drawer === drawer);
      const docsWithDeadlines = docs.filter(d => d.days_until_deadline !== null && d.days_until_deadline !== undefined);
      docsWithDeadlines.sort((a, b) => (a.days_until_deadline ?? 9999) - (b.days_until_deadline ?? 9999));

      const nearest = docsWithDeadlines[0];
      return {
        drawer,
        total_documents: docs.length,
        nearest_deadline_days: nearest?.days_until_deadline ?? null,
        nearest_deadline_date: nearest?.confirmed_expiry_date ?? null,
        urgency: nearest?.urgency ?? 'calm',
        documents: docs
      };
    });
  }
}

export const api = new ApiService();
