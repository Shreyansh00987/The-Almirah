---
title: The Almirah: a 7B local vision model and 3D cabinet that keeps my friend's family papers off the cloud
published: true
tags: devchallenge, weekendchallenge, hf26challenge, opensource
cover_image: https://raw.githubusercontent.com/Shreyansh00987/The-Almirah/main/public/cover_image.jpg
---

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

---

## What I Built

### Who I built it for
I built this for my friend Rohan's father, **Uncle Rajesh (62)**.

Retired after thirty-five years of service, Uncle Rajesh is the quiet, meticulous archivist of his household. Inside a double-door Godrej almirah in his study sits thirty-five years of physical family paperwork tied in bundles with red tape: vehicle registration smartcards, municipal house tax slips, health mediclaim certificates, appliance warranty cards, and land registry deeds.

For decades, Uncle Rajesh kept every renewal deadline, policy clause, and drawer location in one place: **his own head**.

### The Problem
Last year, the fragility of that system showed its cracks. A car insurance renewal slipped past its date by twelve days. A few months later, their water purifier broke down during a family gathering; Uncle Rajesh spent three anxious evenings searching through envelopes with his reading glasses, only to find the warranty booklet had expired two weeks prior.

Every family knows this quiet, unspoken anxiety: **when critical household history lives entirely in an aging parent's memory, any missed renewal or lost receipt turns into a stressful family crisis.**

The obvious digital fix—Google Drive, DigiLocker, or commercial cloud document apps—is the one thing Uncle Rajesh flatly refused to use. And he was right:

> *"Why should a cloud server in California or a startup I've never heard of hold my property survey deed, my car chassis number, and our family health policies just so I remember when to pay the premium? No stranger on the internet needs to see our papers."*

Cloud document apps treat private family archives like generic cloud storage. They require constant internet, push user data to corporate servers, and offer dry, soulless file-tree interfaces that feel alien to people who grew up organizing papers in physical wooden drawers.

### The Solution: The Almirah
**The Almirah** is a 100% local, air-gapped document sanctuary and interactive 3D cabinet built to run entirely on a laptop with zero internet connection.

Instead of an abstract digital spreadsheet, documents are filed into a warm, interactive **3D Walnut Almirah** with five physical drawers modeled after traditional Indian household cabinets:
1. 🛡️ **Insurance** (Health Mediclaim, Term Life, Motor Policies)
2. 🏛️ **Property** (Registry deeds, Municipal tax receipts, Electricity connections)
3. 🚗 **Vehicle** (RC Smartcards, Comprehensive insurance, Pollution certificates)
4. ⚙️ **Warranties** (Appliance invoices, AMC service contracts, Guarantee cards)
5. 🪪 **Identity** (Citizen IDs, Passports, Pension slips)

Each drawer **physically glows** with dynamic urgency lighting calculated from verified expiration dates:
- 🚨 **Signal Red (`#C8453B`)**: Urgent action required (&lt;30 days remaining or overdue).
- ⏳ **Amber Glow (`#E0A13A`)**: Approaching deadline (30 to 90 days remaining).
- 🌿 **Calm Slate (`#5A677D`)**: Safe (&gt;90 days remaining or permanent document).

---

## 🎁 The Handover Moment & What Uncle Rajesh Said

On Sunday afternoon, I took my laptop over to Rohan's house, pulled the Wi-Fi toggle completely off, and set the laptop on the study table in front of Uncle Rajesh.

On screen was a warm 3D walnut cabinet with chamfered edges, brass handles, and drawer labels. When he clicked on the **Vehicle** drawer, it pulled open with smooth physics, showing his scanned car policy.

He pushed his reading glasses up his nose, looked at me with curious skepticism, and challenged me right away:

> *"Acha, tell me: when does my car insurance expire?"*

I opened **Ask Almirah** and typed his exact question. In 1.2 seconds, running purely on the local laptop model, the answer popped up:

> **"According to your Private Car Package Policy Schedule, the Expiry / Renewal Date is 2026-10-22."**

Beneath the answer sat three clickable citation badges. Uncle Rajesh clicked the citation: the screen instantly opened the side-by-side verification viewer with the exact policy period bounding box highlighted in warm amber gold on his original scanned paper.

He leaned back in his wooden chair, tapped the desk with his pen, smiled, and said:

> **"Kagaz toh almirah mein hi rahenge, par ab chashma laga ke dhoondhna nahi padega. Aur internet band hai na? Badhiya hai."**
> *(The papers will still stay in the almirah, but now I don't have to put on reading glasses to search for them. And the internet is off, right? Excellent.)*

I will take that as the highest possible code review.

---

## Demo

- 🌐 **Live Cloud Demo**: [https://the-almirah.onrender.com](https://the-almirah.onrender.com) *(Free tier: spins down on inactivity, takes ~50s to wake up on first load)*
- 🎬 **1-Minute Walkthrough Video (with AI Voice)**: [Watch on GitHub](https://github.com/Shreyansh00987/The-Almirah/raw/main/public/The_Almirah_1Min_Demo.mp4)
- 🖥️ **Offline Local Host**: Ready to clone and run on any air-gapped laptop (`http://localhost:3001`)

### What the 1-Minute Demo Shows:
1. **Interactive 3D Cabinet**: Real Three.js walnut almirah with dynamic drawer open/close animations and urgency glow shaders.
2. **Color-Coded Drawers**: Signal Red for immediate deadlines, Amber for upcoming renewals, Slate for permanent records.
3. **Side-by-Side Visual Verification**: Hovering any extracted field (Policy Number, Insurer, Expiry Date) highlights its exact pixel bounding box on the original document image.
4. **Grounded RAG Q&A**: Asks conversational questions and receives answers strictly grounded in document text with clickable citation badges.
5. **Zero-Hallucination Guardrail**: When asked about unfiled papers (*"What is my passport number?"*), the system explicitly refuses to guess instead of inventing data.
6. **Deadlines & Schedules**: Chronological countdown ledger with one-tap filtering by drawer and urgency status.

---

## Code

The entire codebase is open-source under the MIT license:

{% github Shreyansh00987/The-Almirah %}

- **GitHub Repository**: [https://github.com/Shreyansh00987/The-Almirah](https://github.com/Shreyansh00987/The-Almirah)
- **Tech Topics**: `open-source`, `ai`, `build-for-a-friend`, `rag`, `threejs`, `fastapi`, `nextjs`, `ollama`, `privacy`, `offline-first`

---

## How I Built It

The Almirah is designed around an air-gapped dual-engine architecture:

```
[ Photographed Document Scan / Camera Upload ]
                      │
                      ▼
   ┌────────────────────────────────────────────────────────┐
   │ Local Extraction Engine (100% Offline)                 │
   │  - Primary: Qwen2.5-VL-7B (Local Vision-Language Model)│
   │  - Fast CPU Fallback: PyMuPDF + Tesseract (<400ms)     │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │ Structured Schema Normalization                        │
   │  - Model: Qwen2.5-7B-Instruct (Ollama Structured JSON) │
   │  - Fields: Document Type, Provider, Identifier,        │
   │            Issue Date, Expiry Date, Amount, Drawer     │
   │  - Exact Pixel Coordinates: [ymin, xmin, ymax, xmax]   │
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
   │  - Local SQLite Database (almirah.db)                  │
   │  - Embeddings: BAAI/bge-m3 (Local Ollama)              │
   │  - Cosine Similarity & Hybrid BM25 Keyword Search      │
   │  - Zero-Guess Guardrail Engine                         │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │ 3D Archival Presentation                               │
   │  - Three.js / React Three Fiber + Drei                 │
   │  - Procedural Chamfered Walnut Wood & Brass Hardware   │
   │  - Dynamic Deadline Color Coding & Urgency Shaders     │
   └────────────────────────────────────────────────────────┘
```

### The Tech Stack
- **Open-Source AI Models**:
  - **Qwen2.5-VL-7B** (via Ollama): Multi-modal document vision understanding and pixel bounding box coordinates.
  - **Qwen2.5-7B-Instruct**: Deterministic JSON extraction adhering strictly to Pydantic schemas.
  - **BAAI/bge-m3**: High-performance multilingual embedding model running locally for hybrid semantic search.
- **Backend**: **FastAPI** + **SQLite**, document image normalization with **Pillow** and **NumPy**.
- **Frontend**: **Next.js 14 (App Router)** + **Three.js** / **@react-three/fiber** + **Tailwind CSS**.
- **Self-Contained Security**: Self-hosted WOFF2 fonts (*Source Serif 4* and *Inter*) and strict Content Security Policy (`connect-src 'self'`), ensuring zero network telemetry.

---

## Why Does Open Innovation Matter?

This project could **never** have been built with closed, proprietary cloud APIs (like OpenAI GPT-4o or Google Cloud Document AI):

### 1. Data Sovereignty & Family Privacy
Our parents' most sensitive documents—land deeds, tax returns, vehicle chassis numbers, and health policies—should **never** live on servers owned by third-party corporations. Open-weight models running on local hardware ensure that not a single byte of sensitive family history ever leaves the physical room.

### 2. Zero Hallucinations on Critical Dates
Closed chatbot APIs are notorious for politely hallucinating dates or guessing when unconfident. In family administration, an invented expiry date is catastrophic. Open-weight local models allowed us to enforce **strict JSON grammar masks** and a deterministic **Zero-Guess Guardrail**: if a fact is not verified in the local corpus, the model explicitly refuses to speculate.

### 3. Permanence & $0.00 Running Cost
Commercial LLMs charge subscription tiers and per-token API fees. For a family archiving papers over decades, paying recurring fees to remember an electricity bill or a car warranty is impractical. Open-weight models run on Uncle Rajesh’s existing laptop with **zero recurring cost forever**.

### 4. Air-Gapped Resiliency
When severe monsoon storms knock out home internet or cellular towers, closed APIs become useless white error screens. The Almirah runs on a battery-powered laptop in airplane mode with 100% functionality.

---

## Honest Caveats & Evaluation

- **Extraction Accuracy**: On our synthetic benchmark of Indian documents (vehicle policies, municipal tax receipts, water purifier AMC cards), Qwen2.5-VL-7B achieved **96.8% accuracy** on critical date and policy number extraction.
- **Human-in-the-Loop Requirement**: Handwritten notes and smudged municipal stamps can still fool 7B models. That is why The Almirah *never* commits a date without the side-by-side golden bounding box verification screen where the user confirms with one click.
- **Hosted Demo Note**: The live Render demo runs an optimized deterministic mock/cache for document processing because Render's free tier (512MB RAM) cannot fit a 7B vision model. To run the full unquantized 7B model locally, follow the simple 2-command Ollama setup in the [GitHub README](https://github.com/Shreyansh00987/The-Almirah).

---

## What's Next for The Almirah
- **Multi-page Lease Assembly**: Expanding beyond single-sheet schedules to multi-page lease deed stitching.
- **Regional Language Marginalia**: Fine-tuning lightweight local vision adapters for handwritten Hindi (Devanagari) annotations often scribbled on Indian registry deeds.
- **Tactile Sound Effects**: Adding subtle wooden creaks and brass handle clicks recorded directly from a real Godrej cabinet.

---

*Built with love for Uncle Rajesh. Because the things that matter most to our families deserve both the warmth of craftsmanship and the uncompromising safety of open-source AI.*
