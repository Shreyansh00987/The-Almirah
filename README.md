# The Almirah — Local Offline Document Keeper

> A 100% local, offline document keeper and 3D cabinet that extracts structured fields and deadlines from photographed paper documents using open-source models, filing them into a 3D walnut Almirah whose drawers glow by deadline proximity.

---

## 🌟 Weekend Hackathon: Built for a Friend (Dad)

> *"Ship something that solves a real problem for a friend or someone you love. Pick one real person and build something for them."*

### Who it was built for
**Rajesh Sharma (Dad)**, an older adult who for over 35 years has kept every land registry, mediclaim schedule, vehicle insurance policy, and appliance warranty card locked in a heavy double-door Godrej almirah (wardrobe) in his study.

### The Real Problem
Every year, a deadline would slip past—a car insurance renewal lapsed by 10 days, or a warranty booklet went missing right when the water purifier broke down. Digging through tied bundles of yellowing paper with reading glasses was becoming an anxious chore. 

Yet, when introduced to digital cloud apps (Google Drive, DigiLocker, cloud document managers), **Dad categorically refused**:
> *"Why should an overseas company or an AI cloud server hold my property survey deed, my chassis number, and my family health history just so I can remember when to pay the tax? No stranger on the internet needs to see my papers."*

### The Handover & What Dad Said
When handed the laptop running The Almirah with his documents pre-filed into his familiar wooden drawers, he asked: *"When does my car insurance expire?"* 
The app immediately responded with the exact date and pulled up the original certificate with the policy period highlighted in gold.

Dad's reaction:
> **"You made a computer look like my almirah. I asked it 'When does my car insurance expire?' and it didn't just give a date—it showed me the exact line on the original certificate. And it didn't ask for a password or internet. This I will use."**

---

## 💡 Why Open Innovation Matters for The Almirah

This project could not exist on closed, proprietary cloud APIs:

1. **Strict Zero-Cloud Privacy (Data Sovereignty)**:
   Sensitive family papers (Aadhaar, tax receipts, vehicle RC, medical history) must never leave the user's physical machine. By running **Qwen2.5-VL** (vision OCR) and **Qwen2.5 / Qwen3** (JSON schema extraction) locally through **Ollama**, zero bytes leave the laptop.
2. **True Air-Gapped / Offline Operation**:
   The entire application runs on a laptop in the middle of nowhere with no internet connection. Fonts, models, vector embeddings, and storage are 100% self-hosted.
3. **Zero Recurring API Costs**:
   Closed LLM APIs charge per token and per image. For a family archiving dozens of multi-page documents over decades, open-weight models cost exactly \$0.00 to run forever on existing laptop hardware.
4. **Model Swappability & Sovereignty**:
   Using open standards (Ollama, SQLite, ONNX), the user is never locked into a single proprietary vendor. Model names are configurable in a single `.env` file (`TEXT_MODEL_NAME`, `VISION_MODEL_NAME`, `EMBEDDING_MODEL_NAME`), allowing the pipeline to seamlessly upgrade as open-weight models evolve.
5. **Grounded Proof Over Hallucinatory Black Boxes**:
   Closed chatbot APIs frequently hallucinate dates and policy clauses. The Almirah enforces strict JSON schema constraints and a zero-guess guardrail: if a fact is not in the documents, it strictly refuses to answer.

---

## 1. What It Does

**The Almirah** is an offline digital sanctuary for critical family paper documents (insurance policies, vehicle registrations, property tax receipts, warranty cards, identity papers). 

- **Physical Metaphor with Information Density**: Documents are organized into five physical drawers: **Insurance**, **Property**, **Vehicle**, **Warranties**, and **Identity**.
- **Deadline-Encoded Drawer Glow**: Drawers physically glow to convey urgency:
  - **Signal Red (`#C8453B`)**: Urgent action required (&lt;30 days remaining or overdue).
  - **Amber (`#E0A13A`)**: Approaching deadline (30 to 90 days remaining).
  - **Calm Slate (`#5A677D`)**: Safe (&gt;90 days remaining or permanent validity).
- **Interactive Verification**: Side-by-side inspection where hovering any extracted field highlights its exact pixel bounding box on the original document. No deadline is committed until one-tap human confirmation.
- **Grounded Semantic Q&A**: Ask natural-language queries (text or optional voice) and receive grounded answers that cite the exact document title and highlight the source bounding box region. Enforces a strict zero-hallucination guardrail: if information is absent, the model explicitly refuses to guess.
- **100% Local Offline Privacy**: Zero external network calls. Bundled self-hosted fonts (Source Serif 4 & Inter), enforced local Content Security Policy, and an active runtime network guard.

---

## 2. Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Client Frontend (Next.js 14 App Router + Three.js)"]
        UI_Scan[Scan / Upload Document] --> UI_Verify[Verification Screen: Dual Pane]
        UI_Verify -->|1-Tap Human Confirmation| 3D_Cabinet[3D Almirah Cabinet: R3F + Drei]
        UI_Verify -->|1-Tap Human Confirmation| List_View[Accessible High-Contrast List]
        3D_Cabinet <-->|Synced State| List_View
        UI_Ask[Ask Semantic QA] -->|Cites Document & Bounding Box| UI_Verify
        Net_Guard[Active Runtime Network Guard] -->|Blocks Outbound Calls| Client
    end

    subgraph Modes ["Dual Operational Modes"]
        Live_Mode["Live Mode (Local Ollama: Qwen2.5 / Qwen3 / Qwen2.5-VL / BGE-M3)"]
        Demo_Mode["Demo Mode (Precomputed 9 Synthetic Samples for Web / Vercel)"]
    end

    subgraph Backend_Pipeline ["Backend Server (FastAPI + Python 3.14)"]
        Deskew[Image Preprocessing: Deskew & Contrast Normalization] --> VLM_OCR[Layout Analysis: VLM / Tesseract 5]
        VLM_OCR --> Extractor[Structured Extractor with Strict JSON Schema]
        Extractor --> Scoring[Confidence Scoring & Normalized Bounding Boxes]
        Scoring --> UI_Verify
    end

    subgraph Storage ["Local Offline Storage"]
        DB[(SQLite: Metadata & Embedding Vectors)]
        Disk[Local Disk: Checksummed Original PNGs]
    end

    Live_Mode --> Backend_Pipeline
    Demo_Mode -->|Instant Grounded Replay| UI_Verify
    Scoring --> DB
    Scoring --> Disk
```

---

## 3. Two Run Modes

### A. Live Mode (Local Hardware Inference)
- Connects directly to local Ollama (`http://localhost:11434`) and local FastAPI backend (`http://localhost:8000`).
- Models: **Qwen2.5-7B-Instruct** (or **Qwen3**) for text schema enforcement, **Qwen2.5-VL-7B** for document vision grounding, and **BGE-M3** for dense retrieval.
- Fast CPU Fallback: If VLM is slow or unavailable, automatically executes rule-based OCR token parsing.
- File storage: Checksummed original images stored in `./data/documents/` and indexed in `./data/almirah.db`.

### B. Demo Mode (Zero-Dependency Deployed Link / Vercel)
- Designed for judges or users evaluating a deployed web link where local Ollama is not exposed over the Internet.
- Operates 100% in the browser using pre-computed synthetic extractions and identical UI schemas.
- Clearly bannered: `Demo mode: precomputed results on synthetic documents`.
- Toggle between Live and Demo mode with a single click.

---

## 4. Models and Licenses

All models used in The Almirah are verified open-source or open-weight:

| Capability | Model / Engine | Developer | Official License | Classification | Runtime Port |
|---|---|---|---|---|---|
| Text Reasoning | `qwen2.5:7b-instruct` / `qwen3` | Alibaba Cloud | **Apache 2.0** | Open-Weight | `localhost:11434` |
| Vision Grounding | `qwen2.5-vl:7b` | Alibaba Cloud | **Apache 2.0** | Open-Weight | `localhost:11434` |
| Vector Retrieval | `bge-m3` | BAAI | **MIT License** | Open-Source | `localhost:11434` |
| Fast OCR Fallback | `Tesseract OCR 5` / Rule Engine | HP / Google / Community | **Apache 2.0** | Open-Source | Local CPU |
| Voice Input | `Whisper Base` | OpenAI | **MIT License** | Open-Source Code | Local Browser / ONNX |

*Full license details and verification links are documented in [docs/MODELS.md](file:///c:/Users/shrea/Desktop/The%20Almirah/docs/MODELS.md).*

---

## 5. Privacy & Offline Design

### No Data Leaves This Device
1. **Zero External Calls**: Zero telemetry, zero analytics, zero external CDNs.
2. **Self-Hosted Assets**: Fonts (`Source Serif 4` and `Inter`) are bundled directly as local WOFF2 files in `public/fonts/`.
3. **Strict Content Security Policy (CSP)**:
   ```http
   Content-Security-Policy: default-src 'self' data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 http://localhost:11434 http://127.0.0.1:11434;
   ```
4. **Active Runtime Guard (`src/lib/offlineCheck.ts`)**: Monkey-patches `window.fetch` to intercept and immediately block any network attempt targeting a remote hostname, raising a visible alert in the UI.

---

## 6. Setup & Installation

### Prerequisites
- Node.js 18+ (tested on Node v24)
- Python 3.10+ (tested on Python 3.14)
- [Ollama](https://ollama.com/) (for Live Mode)

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r backend/requirements.txt
```

### Step 2: Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Step 3: Pull Ollama Models (Live Mode)
```bash
ollama pull qwen2.5:7b
ollama pull qwen2.5-vl:7b
ollama pull bge-m3
```

### Step 4: Run The Application
In Terminal 1 (Start FastAPI Backend):
```bash
python -m uvicorn backend.main:app --port 8000 --host 127.0.0.1
```

In Terminal 2 (Start Next.js Frontend):
```bash
npm run dev
# Or for optimized production build:
# npm run build && npm run start:local
```
Open **`http://localhost:3001`** in your browser.

---

## 7. Cloud Deployment on Render (render.com)

The Almirah is 100% pre-configured for instant deployment on [Render](https://render.com).

### Option A: 1-Click Render Blueprint (Recommended)
This repository includes a ready-to-deploy [`render.yaml`](render.yaml) specification:

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/Shreyansh00987/The-Almirah`.
4. Render automatically parses `render.yaml` and provisions:
   - **`the-almirah-backend`**: Python 3.11 FastAPI service with auto-seeded synthetic SQLite documents.
   - **`the-almirah-frontend`**: Next.js 14 Web Service connected to the backend with automated health monitoring.
5. Click **Apply** to trigger deployment!

### Option B: Single Free Web Service (Docker)
To host the full stack on Render's 100% Free Tier within a single instance:
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect `https://github.com/Shreyansh00987/The-Almirah`.
3. Select **Docker** as the runtime.
4. Render will build the bundled multi-stage [`Dockerfile`](Dockerfile) and run both the FastAPI engine and Next.js UI on a single live URL (`https://the-almirah.onrender.com`).

---

## 8. Synthetic Document Benchmark (Evaluation)

The application ships with 9 realistic synthetic documents labeled `"Synthetic sample"` spanning all 5 drawers:

| Document ID | Document Type | Drawer | Correct Fields | Field Accuracy | VLM Latency | Fast OCR Latency |
|---|---|---|---|---|---|---|
| SYN-01 | Comprehensive Health Insurance | Insurance | 7 / 7 | 100% | 4.8s | 0.42s |
| SYN-02 | Private Car Package Policy | Vehicle | 7 / 7 | 100% | 4.2s | 0.38s |
| SYN-03 | Property Tax Assessment Receipt | Property | 7 / 7 | 100% | 4.1s | 0.35s |
| SYN-04 | Vehicle Registration Card (RC) | Vehicle | 6 / 7 | 85.7% | 3.9s | 0.31s |
| SYN-05 | Water Purifier Extended Warranty | Warranties | 7 / 7 | 100% | 4.0s | 0.34s |
| SYN-06 | Refrigerator Compressor Warranty | Warranties | 7 / 7 | 100% | 4.1s | 0.33s |
| SYN-07 | Citizen National ID Card | Identity | 7 / 7 | 100% | 3.6s | 0.28s |
| SYN-08 | Driving License Validity Slip | Identity | 6 / 7 | 85.7% | 3.7s | 0.30s |
| SYN-09 | Residential Tenancy Agreement | Property | 7 / 7 | 100% | 4.5s | 0.41s |
| **Total** | **Benchmark Corpus** | — | **61 / 63** | **96.8%** | **4.1s avg** | **0.35s avg** |

*Complete benchmark metrics, IoU overlap, and test protocols are in [docs/EVAL.md](file:///c:/Users/shrea/Desktop/The%20Almirah/docs/EVAL.md).*

---

## 9. Limitations & Future Scope

1. **Multi-page PDF Stitching**: Current MVP optimizes single-page scans and smartcard photos. Multi-page leases are processed via the primary schedule page.
2. **Local GPU Requirement for 7B VLM**: While the fast OCR fallback operates in under 400ms on any CPU, running Qwen2.5-VL-7B at full precision requires ~6GB VRAM for real-time responsiveness.
3. **Handwritten Indian Script Annotations**: Fine-tuned regional OCR (e.g. Devanagari or Tamil handwritten marginalia) requires higher parameter models or domain-specific adapters.
