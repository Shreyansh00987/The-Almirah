# The Almirah — Product Context

## Purpose
The Almirah is an offline, completely local document sanctuary designed primarily for families and older adults who possess essential physical paper documents (property deeds, vehicle registrations, tax receipts, warranty certificates, insurance policies, identity cards) and want them digitized, monitored, and queried without sending a single byte to the cloud.

## Primary User Profile
- Older adults, family record keepers, privacy-conscious individuals.
- Value clarity, physical familiarity, calm visuals, large high-contrast typography, and explicit control.
- Skeptical of "black-box AI" and automatic actions: nothing becomes an active deadline until human confirmation.

## Core Pillars
1. **Unconditional Privacy & Offline Operation**: Zero remote telemetry, zero external CDNs, self-hosted fonts, verifiable local-only execution.
2. **Physical Metaphor with Information Density**: The 3D Almirah is not decorative 3D eye-candy; its walnut drawers glide with realistic weight, and drawer lighting directly encodes impending deadlines (Calm slate/warm, Amber warning for 30-90 days, Signal Red alert for < 30 days or overdue).
3. **Traceability & Grounded Citations**: Every extracted field links directly to its pixel bounding box on the original document image. In semantic question-answering, every assertion cites the exact document title, page, and highlighted region. If information is absent, the system explicitly refuses to guess.
4. **Dual-Mode Reliability**: Full Live mode running local Ollama inference, complemented by a pre-computed synthetic Demo mode that works identically on deployed environments (like Vercel).
