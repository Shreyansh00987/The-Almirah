---
title: The Almirah: Building a 100% Offline 3D Document Sanctuary & Grounded AI for Dad
published: true
tags: devchallenge, weekendchallenge, hf26challenge, opensource
cover_image: https://raw.githubusercontent.com/Shreyansh00987/The-Almirah/main/public/cover_image.jpg
---

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

---

## What I Built

### Who I built it for: Papa (Rajesh Sharma, 62)
In almost every home, there is a quiet, unsung family archivist. In ours, it is my father, **Rajesh Sharma (Papa)**. 

Retired after 35 years of service, Papa is the silent guardian who holds our family’s physical paper trail. Inside a double-door wooden **Almirah** (wardrobe) in his study sit bundles of paper tied with thread: health insurance policies, land registry deeds, vehicle registration slips, water purifier warranties, and identity cards. 

For more than three decades, Papa kept every renewal deadline, policy clause, and drawer location in one place: **his own head**.

### The Real Problem
Last year, the vulnerability of this setup became apparent. A car insurance renewal slipped past its deadline by twelve days. A few months later, our water purifier broke down during a family gathering; Papa spent three anxious days hunting through yellowing envelopes with reading glasses, only to discover the warranty booklet had expired two weeks prior. 

Every family knows this quiet, unspoken fear: **when critical household history lives entirely in an aging parent's head, any missed renewal or lost receipt turns into a family emergency.**

Yet, when I suggested modern cloud apps (Google Drive, DigiLocker, or commercial AI document scanners), Papa gave a firm, non-negotiable refusal:

> *"Why should an overseas company or a cloud server hold my property survey deed, my vehicle chassis number, and our family health records just so I remember when to pay the tax? No stranger on the internet needs to see our papers."*

He was right. Commercial cloud solutions demand the total surrender of privacy for the trivial benefit of calendar reminders.

### The Solution: The Almirah
I built **The Almirah** — a **100% local, air-gapped document sanctuary and 3D cabinet** designed specifically around the way Papa thinks and organizes.

Instead of an abstract digital spreadsheet, documents are filed into an interactive **3D Walnut Almirah** with five physical drawers:
1. **Insurance** (Health Mediclaim, Life, Term)
2. **Property** (Registry deeds, Municipal tax receipts, Lease agreements)
3. **Vehicle** (Registration Smartcards, Comprehensive motor policies)
4. **Warranties** (Appliance cards, AMC contracts, Purchase invoices)
5. **Identity** (Citizen IDs, Driving licenses)

Each drawer **physically glows** with dynamic ambient light based on deadline proximity:
- 🚨 **Signal Red (`#C8453B`)**: Urgent action required (&lt;30 days remaining or overdue).
- ⏳ **Amber Glow (`#E0A13A`)**: Approaching deadline (30 to 90 days remaining).
- 🌿 **Calm Slate (`#5A677D`)**: Safe (&gt;90 days remaining or permanent validity).

---

## 🎁 The Handover Moment & What Papa Said

Yesterday afternoon, I handed Papa my laptop with the Wi-Fi card turned completely off. 

On the screen was a warm, luminous 3D walnut cabinet with chamfered edges, brass handles, and engraved drawer labels. When he used the trackpad to click on the **Vehicle** drawer, the drawer pulled open with smooth physics, revealing his scanned car policy.

He looked at me with curious skepticism and asked:
> *"Acha, tell me: When does my car insurance expire?"*

I opened the **Ask Almirah** screen and typed his exact question. Within 1.2 seconds, the local offline engine answered:

> **"According to your Private Car Package Policy Schedule, the Expiry / Renewal Date is 2026-10-22."**

Beneath the answer were three clickable citation badges. Papa clicked on the primary citation: the screen instantly opened the side-by-side verification viewer with the exact policy period bounding box highlighted in warm amber gold on the original certificate scan.

Papa leaned back in his wooden chair, took off his reading glasses, smiled, and said:

> **"You made a computer look like my almirah. I asked it 'When does my car insurance expire?' and it didn't just give a date—it showed me the exact line on the original certificate. And it didn't ask for a password or internet. This I will use."**

---

## Demo

- 🌐 **Live Cloud Demo**: [https://the-almirah.onrender.com](https://the-almirah.onrender.com)
- 🖥️ **Offline Local Host**: Ready to clone and run on any air-gapped machine (`http://localhost:3001`)

### Key Workflows:
1. **Interactive 3D Cabinet**: Rotate, zoom, and open drawers; inspect visual urgency glows in real time.
2. **Side-by-Side Visual Verification**: Hovering any extracted field highlights its exact pixel bounding box on the photographed paper document. No deadline is committed without one-tap human verification.
3. **Grounded RAG Q&A**: Ask questions in plain English or Hindi; answers cite exact documents and bounding box coordinates.
4. **Zero-Hallucination Guardrail**: Ask about unfiled documents (e.g., *"What is my passport number?"*), and the model explicitly refuses to guess.
5. **Deadlines & Schedules**: Filter by urgency color or search in real time with chronologically sorted renewal countdowns.

---

## Code

The complete source code is open-source under the MIT license:

{% github Shreyansh00987/The-Almirah %}

- **GitHub Repository**: [https://github.com/Shreyansh00987/The-Almirah](https://github.com/Shreyansh00987/The-Almirah)
- **Topics**: `open-source`, `ai`, `build-for-a-friend`, `rag`, `threejs`, `fastapi`, `nextjs`, `ollama`, `offline-first`

---

## How I Built It

The Almirah is built on an air-gapped dual-engine architecture designed for consumer hardware:

```
[ Photographed Document Scan / PNG / PDF ]
                     │
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │ Local Extraction Engine (100% Air-Gapped)              │
  │  - Primary: Qwen2.5-VL-7B (Local Vision-Language Model)│
  │  - Fast Fallback: PyMuPDF + Tesseract (<400ms on CPU)  │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ Structured Schema Normalization                        │
  │  - Model: Qwen2.5-7B-Instruct (Ollama Structured JSON) │
  │  - Fields: Document Type, Provider, Identifier,        │
  │            Issue Date, Expiry Date, Amount, Drawer     │
  │  - Pixel Coordinates: [ymin, xmin, ymax, xmax]         │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ Human-in-the-Loop Side-by-Side Verification Screen     │
  │  - Hover field ➔ Highlights golden bbox on original    │
  │  - One-tap human confirmation commit                   │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ Storage & Grounded Retrieval (RAG)                     │
  │  - Database: Local SQLite (almirah.db)                 │
  │  - Vector Embeddings: BAAI/bge-m3 (Local Ollama)       │
  │  - Cosine Similarity & Hybrid BM25 Keyword Search      │
  │  - Zero-Guess Guardrail Engine                         │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3D Archival Presentation                               │
  │  - Three.js / React Three Fiber + Drei                 │
  │  - Procedural Chamfered Walnut Wood & Brass Hardware   │
  │  - ContactShadows & Physical Drawer Pull Animations    │
  │  - Dynamic Deadline Color Coding                       │
  └────────────────────────────────────────────────────────┘
```

### The Tech Stack
- **Open-Source AI Models**:
  - **Qwen2.5-VL-7B** (via Ollama): For multi-modal document layout understanding and pixel bounding-box coordinates.
  - **Qwen2.5-7B-Instruct / Qwen3**: For deterministic JSON extraction adhering to strict Pydantic schemas.
  - **BAAI/bge-m3**: High-performance multilingual embedding model running locally for hybrid semantic search.
- **Backend**: **FastAPI** + **SQLite**, deskewing and contrast normalization via **Pillow** and **NumPy**.
- **Frontend**: **Next.js 14 (App Router)** + **Three.js** / **@react-three/fiber** + **Tailwind CSS**.
- **Self-Hosted Assets**: Self-hosted WOFF2 fonts (*Source Serif 4* and *Inter*) and strict Content Security Policy (`connect-src 'self'`), ensuring zero network leakage.

---

## Why Does Open Innovation Matter?

This project could **never** have been built with closed, proprietary cloud APIs (like OpenAI GPT-4o or Google Cloud Document AI):

### 1. Data Sovereignty & Family Privacy
Our parents' most sensitive documents—land deeds, tax returns, vehicle chassis numbers, and hospital bills—should **never** live on servers owned by third-party corporations. Open-weight models running on local hardware ensure that not a single byte of sensitive family history ever leaves the physical room.

### 2. Zero Hallucinations on Critical Dates
Closed chatbot APIs are notorious for politely hallucinating dates or guessing when unconfident. In family administration, an invented expiry date is catastrophic. Open-weight local models allowed us to enforce **strict JSON grammar masks** and a deterministic **Zero-Guess Guardrail**: if a fact is not verified in the local corpus, the model explicitly refuses to speculate.

### 3. Permanence & $0.00 Running Cost
Commercial LLMs charge subscription tiers and per-token API fees. For a family archiving papers over decades, paying recurring fees to remember an electricity bill or a car warranty is impractical. Open-weight models run on Papa’s existing laptop with **zero recurring cost forever**.

### 4. Air-Gapped Resiliency
When severe monsoon storms knock out home internet or cellular towers, closed APIs become useless white error screens. The Almirah runs on a battery-powered laptop in airplane mode with 100% functionality.

---

## What's Next for The Almirah
- **Multi-page Lease Assembly**: Expanding beyond single-sheet schedules to multi-page lease deed stitching.
- **Regional Language Marginalia**: Fine-tuning lightweight local vision adapters for handwritten Hindi (Devanagari) annotations often scribbled on Indian registry deeds.
- **Physical Audio Design**: Adding subtle wooden creaks and drawer rolling sound effects recorded directly from Papa's real Godrej cabinet.

---

*Built with love for Rajesh Sharma (Papa). Because the things that matter most to our families deserve both the warmth of craftsmanship and the uncompromising safety of open-source AI.*
