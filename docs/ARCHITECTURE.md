# The Almirah — Technical Architecture Specification

## 1. System Philosophy & Threat Model

The Almirah is built on a non-negotiable architectural invariant: **Zero bytes of personal paper documents or extracted metadata may leave the user's host machine**. 

Older adults and family record keepers frequently hold irreplaceable, sensitive paperwork:
- Vehicle registration certificates (VIN, chassis, owner addresses)
- Healthcare policies and policy schedules (dependent names, ages, policy limits)
- Municipal tax bills (property survey numbers, ward identifiers)
- Identity verification records (national identity and license records)

### Threat Vector Mitigation
| Potential Leak Vector | Architectural Mitigation | Verification Mechanism |
|---|---|---|
| Cloud AI APIs (OpenAI, Anthropic, Google) | Local-only inference via Ollama (`127.0.0.1:11434`) | Verified by localhost bind policy |
| Remote Web Fonts (Google Fonts, Adobe Typekit) | 100% self-hosted static WOFF2 files in `public/fonts/` | `document.fonts` inspection + CSP `font-src 'self'` |
| Telemetry & Tracking Scripts | Zero analytics libraries installed; no Google Tag Manager | Clean dependency tree; 0 tracking packages |
| Browser Outbound Fetch/XHR | Content Security Policy restricting connect-src to localhost | Runtime fetch monkey-patch (`src/lib/offlineCheck.ts`) |
| Unvetted Cloud Database | Embedded SQLite database on local filesystem (`./data/almirah.db`) | Local file permissions only |

---

## 2. Pipeline Execution Walkthrough

```
[Raw Paper Photo / Scan]
           │
           ▼
[Preprocessing Engine: backend/pipeline/preprocessor.py]
   • EXIF orientation normalization
   • Grayscale projection profile variance calculation
   • Sub-degree deskew rotation (-10° to +10°)
   • Contrast stretch (1.08x) for aged parchment
   • SHA-256 Checksum generation
           │
           ▼
[Dual-Engine Layout Grounding: backend/pipeline/extractor.py]
   • Path A (Live GPU): Ollama Qwen2.5-VL-7B vision reasoning with JSON schema
   • Path B (Fast CPU Fallback): Tesseract 5 / Rule-based regex token extraction
   • Output normalization: ISO 8601 date parsing (YYYY-MM-DD)
   • Coordinate normalization: 0-1000 integer space
           │
           ▼
[Verification Gate: src/app/verify/page.tsx]
   • Side-by-side inspection: Document Canvas vs Fact Editor
   • Active hover link: hovering field highlights origin bounding box
   • Confidence thresholding: <85% flagged as "Verify OCR"
   • Human-in-the-loop requirement: 1-tap confirmation barrier
           │
           ▼
[State Persistence: backend/database.py]
   • SQLite records inserted into `documents` table
   • Expiry date evaluated against current date -> Urgency tag assigned
   • BGE-M3 text chunks embedded and indexed for semantic search
           │
           ▼
[The 3D Almirah: src/components/almirah/AlmirahScene.tsx]
   • React Three Fiber canvas with walnut wood textures
   • Drawer lighting seam calculates nearest deadline:
       - < 30 days / overdue: Signal Red (#C8453B)
       - 30 to 90 days: Amber (#E0A13A)
       - > 90 days / permanent: Calm Slate (#5A677D)
   • Opening drawer pulls camera focus and displays physical folders
```

---

## 3. RAG Retrieval & Zero-Hallucination Guardrail

When a natural-language query is submitted to `/api/ask`:
1. **Tokenization & Stopword Stripping**: Query tokens are partitioned into intent keywords (`when`, `what`, `how much`, `number`) and substantive subject keywords (`car`, `insurance`, `purifier`, `tax`).
2. **Subject Match Verification**: A document is candidate for citation **only if** at least one substantive subject keyword matches the document title, drawer, authority, or notes. This strictly prevents questions like *"What is my passport number?"* from false-matching unrelated policy numbers.
3. **Intent-Boosted Scoring**: Matches in fields corresponding to the intent (e.g. asking "when" boosts "Expiry Date") elevate the primary candidate.
4. **Guardrail Enforcer**: If the maximum candidate score does not meet the grounded threshold, the system immediately returns:
   > *"The uploaded documents in your Almirah do not contain information regarding your query. No guesses are made."*
5. **Exact Region Linkage**: Every returned citation contains `{ document_id, document_title, field_name, cited_text, bounding_box, page }`. Clicking the citation opens the document viewer and scrolls to the exact highlighted bounding box.
