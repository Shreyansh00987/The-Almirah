# The Almirah — Design System & Visual Specification

## Design Language: "Quiet, Trustworthy, Wood-and-Slate"

### 1. Palette
- **Slate Deep (Background / Structural Framing)**: `#12151A` (rich, dark slate with subtle blue-gray undertone)
- **Slate Surface / Panels**: `#1B2028`
- **Slate Elevated**: `#242A35`
- **Border Slate**: `#2E3644`
- **Walnut Dark (Cabinet Carcass)**: `#4A3323`
- **Walnut Warm (Drawer Fronts)**: `#6B4A33`
- **Walnut Highlight**: `#8B6143`
- **Brass / Metallic Handles**: `#C8A265`
- **Paper Parchment (Document Background)**: `#F1ECE2`
- **Paper Light**: `#F8F5EE`
- **Ink Primary (Document Text)**: `#1F242C`
- **Ink Muted**: `#545D6E`
- **Urgency Glow — Calm (Safe)**: Soft warm slate / amber tint `#5A677D` (glow radius: 0-4px, low opacity)
- **Urgency Glow — Amber (30–90 Days)**: `#E0A13A` (subtle pulse, warm amber glow on drawer seams and badge)
- **Urgency Glow — Signal Red (<30 Days or Overdue)**: `#C8453B` (urgent beacon glow, high contrast warning)

### 2. Typography
- **Headings & Metaphor Labels**: `Source Serif 4`, serif (weights: 400, 600, 700) — authoritative, traditional, literary, calm.
- **Interface & Dense Data**: `Inter`, sans-serif (weights: 400, 500, 600, 700) — crisp, high legibility, generous line height.
- **High-Contrast Baseline**: Body text ratio exceeds WCAG AAA (7:1+), touch targets min 44x44px, large readable font sizing for older adult comfort.

### 3. Motion & Physics
- Drawers slide with tactile weight (`easeOutCubic`, 0.45s duration, damped spring).
- Scanner sweep: slow, deliberate paper-scanning beam across the document during AI extraction.
- Settling animation: upon user confirmation, the document smoothly folds and glides into its designated drawer slot.
- Honors `prefers-reduced-motion` across all components (fallback to immediate opacity transitions).

### 4. 3D Metaphor & Spatial Rules
- Frontal isometric/perspective camera ($z \approx 6.0$, slight elevation).
- Mouse movement produces delicate parallax ($\pm 2^\circ$).
- Opening a drawer pulls camera focus smoothly toward that drawer's compartment.
- Inside drawer: organized folder tabs bearing labels. Clicking a folder opens the full document view.
- 100% full accessible list view alternative accessible via keyboard shortcut or one-click toggle.
