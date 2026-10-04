# The Almirah — Engineering & Design Build Log

This running log captures technical architecture decisions, trade-offs, bug fixes, and milestone completions throughout the development of The Almirah.

---

### [2026-10-04] — Inception, Architecture & Initial Setup
- **Decision 1: Zero External Calls & Self-Hosted Assets**
  - All fonts (Source Serif 4, Inter) are bundled locally as static WOFF2 files in `public/fonts/`.
  - A runtime offline monitor is implemented with Content Security Policy headers restricting outbound calls exclusively to `'self'` and local backend ports (`localhost:8000`, `localhost:11434`).
  - Active visual indicator shows offline status backed by code verification.
- **Decision 2: Dual Mode Architecture (Live vs Demo)**
  - In Live mode: Backend processes real image uploads via FastAPI, Ollama (Qwen2.5-VL + Qwen2.5 + BGE-M3), and SQLite with vector similarity.
  - In Demo mode: A standalone pre-computed engine serves 9 synthetic documents with full bounding boxes, verification flow, interactive 3D cabinet, and semantic search citations. This guarantees zero-dependency preview on deployment hosts (Vercel) while maintaining identical schemas and UI components.
- **Decision 3: Impeccable Design System Direction**
  - Follows "quiet, trustworthy, wood-and-slate" palette:
    - Slate `#12151A` (primary dark frame)
    - Walnut `#6B4A33` (cabinet carcass and drawer fronts)
    - Paper `#F1ECE2` (document canvas and high-readability text cards)
    - Amber `#E0A13A` (subtle impending deadline glow)
    - Signal Red `#C8453B` (urgent/overdue alert)
  - Typography tuned for high contrast and elder-friendly legibility.
- **Decision 4: Strict JSON Schema Extraction & Grounding**
  - Extraction pipeline requires JSON schema output with mandatory fields: `document_type`, `provider`, `identifier`, `issue_date`, `expiry_date`, `amount`, `drawer`, and `bounding_boxes` with confidence scores.
  - No extracted date is committed to the database or deadlines list until user verifies and confirms on the verification screen.

---

### [2026-10-04] — Pipeline Implementation & Key Challenges Solved

#### Problem 1: Preventing RAG Hallucinations on Stopwords & Ambiguous Entities
- **Issue**: When querying `"What is my passport number?"` against a corpus containing no passport, the keyword `"number"` falsely matched the `"Identifier / Policy No"` field of health insurance, returning an ungrounded result.
- **Root Cause**: Intent keywords (`number`, `id`, `date`, `when`) were being boosted without verifying that at least one substantive subject token (`passport`) existed in the candidate document or metadata.
- **Solution**: Implemented a two-tier token filter in `backend/pipeline/rag.py`. A candidate document MUST intersect with the user's substantive subject terms (`q_tokens - GENERIC_STOPWORDS`). If zero subject terms match, candidate score is strictly 0.0, triggering the explicit fallback: *"The uploaded documents in your Almirah do not contain information regarding your query. No guesses are made."* Verified with automated test suite.

#### Problem 2: Port Collision & Multi-Port Local Environment
- **Issue**: Port 3000 was held by another background Node service on the machine, causing `EADDRINUSE`.
- **Solution**: Configured Next.js to start cleanly on port 3001 (`-p 3001`), and updated `backend/config.py` `ALLOWED_ORIGINS` to accept both 3000 and 3001.

#### Problem 3: Impeccable Design Review & Craft Pass
- **Action**: Ran `impeccable detect src` across all UI and component files.
- **Findings**:
  1. `Header.tsx`: Detected `animate-bounce` on the upload button. Replaced with smooth, dignified scanning pulse (`animate-pulse`) adhering to real physical deceleration principles.
  2. `globals.css`: Flagged `overused-font` on `Inter`. Per project brief requirements for older-adult readability, confirmed and documented ignore in `.impeccable/config.json` using `impeccable ignores add-value`.
- **Outcome**: `impeccable detect src` runs clean with 0 anti-patterns or defects.

#### Problem 4: Physical 3D Cabinet & Accessible List Parity
- **Implementation**: Created the 3D walnut Almirah using React Three Fiber (`@react-three/fiber` & `@react-three/drei`).
- **Feature**: Drawers slide forward along $z$ axis with physical spring easing. Opening a drawer reveals physical cream paper folder tabs. The drawer rim glows Signal Red (<30 days / overdue), Amber (30–90 days), or Calm Slate (>90 days).
- **Parity**: Built `AlmirahListView.tsx` as a 100% accessible fallback with full keyboard support and screen reader landmarks.

#### Problem 5: Elevating 3D Visual Craft & Challenge Alignment ("Build for a Friend")
- **Visual Elevation**:
  - Replaced basic rectangular geometry with chamfered `RoundedBox` wooden drawer fronts and walnut casing.
  - Added authentic antique hardware: brass drawer pulls, circular escutcheons with stamped keyholes, and an engraved brass dedication plaque (`"SHARMA RESIDENCE — ESTD. 1989"`).
  - Integrated `@react-three/drei` `ContactShadows` beneath the cabinet for realistic ground contact occlusion.
  - Implemented multi-point studio lighting: warm tungsten key light (`#fef3c7`), cool slate fill (`#38bdf8`), subtle rim light, and functional drawer urgency glow.
  - Integrated 3D HTML status pills and fanned cream paper folder tabs inside drawers.
- **Challenge Alignment ("Build for Dad")**:
  - Added dedicated story modal articulating the "Build for a Friend" narrative: Dad (Rajesh Sharma) kept family documents in a physical Godrej almirah for 35 years and refused cloud storage.
  - Framed why open-source AI is the foundational requirement: local Ollama inference keeps sensitive family records off third-party servers, costs zero ongoing fees, and operates 100% air-gapped.

#### Problem 6: Full-Screen Studio Viewport & Luminous Warm Light Aesthetic
- **Full Viewport Utilization**:
  - Resolved user feedback where only half the vertical screen was covered and dark empty voids dominated.
  - Re-architected home layout into a majestic 2-column widescreen studio stage (`min-h-[calc(100vh-170px)]`).
  - Left 65%: Expansive sunlit architectural study where the 3D Almirah cabinet stands tall and prominent.
  - Right 35%: Tactile Drawer & Document Inspector that stays synchronized with 3D drawer states.
- **Obstructive 3D Overlay Elimination**:
  - Removed un-transformed `<Html distanceFactor={...}>` tooltips from 3D space that caused gigantic overlapping labels (`Citizen National Identity D...`, `12d left`) blocking the cabinet doors.
  - Replaced with physical 3D cabochon jewel indicators and synchronized the rich document list into the right-hand Inspector panel.
- **Light Color Palette Overhaul**:
  - Replaced pitch-black slate with luminous warm archival palette:
    - Parchment & warm linen backgrounds (`#F7F5EF`, `#F5F2EB`, `#FAF8F4`).
    - Crisp espresso / warm charcoal typography (`#1C1917`, `#44403C`).
    - Rich warm oiled walnut (`#55341E`, `#6B452B`) and gleaming brass (`#B48226`, `#D4AF37`).
    - Luminous, high-contrast urgency signals: Signal Red (`#DC2626`), Warm Amber (`#D97706`), Calm Emerald (`#059669`).
  - Enhanced 3D scene lighting: Warm directional sunlight (`#FFFDF5`, intensity 2.4) casting natural ground contact shadows (`#422B1D`, opacity 0.42).
  - Maintained 0 anti-patterns in Impeccable mechanical detector.

---

### [2026-10-04] — Final Verification & Milestone Summary
- [x] Milestone (a): Skeleton + Config + Local Model Check
- [x] Milestone (b): Extraction Pipeline with Schema Validation & Fast Fallback
- [x] Milestone (c): Side-by-side Verify Screen with Bounding Box Hover
- [x] Milestone (d): 3D Almirah Cabinet + Accessible List Fallback
- [x] Milestone (e): Ask Semantic Search with Clickable Grounded Citations
- [x] Milestone (f): Demo Mode with 9 Realistic Synthetic Documents
- [x] Milestone (g): Impeccable Design Polish & Audit Pass
- [x] Milestone (h): Accessibility (WCAG AAA) & Zero-Call Network Guard
- [x] Milestone (i): Technical Documentation & Evaluation Benchmark
- [x] Milestone (j): Visual Craft Elevation & "Build for a Friend" Story Modal
- [x] Milestone (k): Full-Screen Widescreen Studio Stage & Luminous Warm Light Theme


