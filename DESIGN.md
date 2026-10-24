# DESIGN SYSTEM — The Dark Room & Solar Ember

## Visual Philosophy
- **Art Direction**: *The Dark Room* (distilled from Awwwards Site of the Day / One Page Love study, direction seed 441327086).
- **Subject Theme**: *Solar Ember* — Deep warm obsidian grounds (`#0e090a`, `#14080a`), glowing warm amber/ember accent (`#f4641b`, `#f9a41a`), high-contrast cream ink (`#fff7ed`, 14:1+ contrast), warm muted secondary ink (`#d6b8ae`, 8:1+ contrast).
- **Substance over Ornaments**: No generic purple/indigo AI slop, no 1px outline boxes, no 01/02/03 decorative numbers, no hairline rules, no emoji-as-UI, no icon-topped card rows, no decorative glassmorphism pillbars.
- **Atmospheric Depth**: Exhibits in a dark room; subjects emerge from low-key deep grounds. Real photographs, real 3D Blender Cycles renders, real interface fragments, and genuine footage.

## Typography
- **Primary Typeface**: `Archivo` (Google Fonts, weights 400 and 600).
- **Display Scale**:
  - `Display / Hero Title`: `clamp(2.5rem, 2rem + 3.5vw, 4.5rem)` (tight leading 1.05, tracking -0.02em, sentence case, maximum 2 lines at all viewports).
  - `Section Heading (h2)`: `clamp(1.75rem, 1.4rem + 1.8vw, 2.75rem)` (leading 1.15, tracking -0.015em, maximum 2 lines).
  - `Subsection Heading (h3)`: `clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem)` (leading 1.25).
  - `Lead / Statement Paragraph`: `clamp(1.125rem, 1rem + 0.5vw, 1.35rem)` (leading 1.5, max-width 56ch).
  - `Body`: `16px–18px` (`clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`, leading 1.6, full high-contrast ink).
  - `Small / Metadata`: `13px–14px` (`clamp(0.8125rem, 0.78rem + 0.15vw, 0.875rem)`, nothing below 13px).
- **Code & Shell**: Monospace is reserved exclusively for literal code blocks (`<pre><code>`) and the interactive shell terminal.

## Palette Tokens (CSS Custom Properties)
```css
:root {
  --ground-deep: #0e090a;
  --ground-surface: #14080a;
  --ground-card: #1b1113;
  --ground-raised: #251619;
  
  --ink-primary: #fff7ed;
  --ink-secondary: #d6b8ae;
  --ink-muted: #9e857e;
  
  --accent-ember: #f4641b;
  --accent-amber: #f9a41a;
  --accent-fire: #d24c29;
  
  --status-verified: #22c55e;
  --status-amber: #f59e0b;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  --page-margin: clamp(1.25rem, 0.8rem + 2.5vw, 3.5rem);
  --section-gap: clamp(6rem, 4rem + 6vw, 11rem);
}
```

## Motion & Physical Interactions (Apple Design Foundations)
1. **Immediate Touch Response**: Highlight and transform triggers on `pointerdown` (scale `0.97`–`0.98`), zero artificial latency.
2. **Critically Damped Springs**: Default physics uses `damping: 1.0` (smooth settle, zero overshoot). Momentum release transitions (flicks, drag handoffs) use `damping: 0.8`.
3. **Interruptibility**: Animations start from presentation values and never lock user input.
4. **Staggered Enters**: Elements in entering sections reveal with `transform: translateY(20px)` and `opacity: 0 -> 1`, staggered by 60ms–80ms.
5. **Moving Picture Loop**: Authentic celestial time-lapse loop (`assets/celestial-loop.webm` + poster) embedded seamlessly with `prefers-reduced-motion` fallbacks.
6. **Tactile Feedback**: Interactive buttons, copy toggles, and shell keys provide visual state acknowledgment.

## Inspection & Quality Guardrails
- **0 FAIL** on `lint.mjs` and `inspect.mjs` at 1440px (Desktop), 768px (Tablet), and 390px (Mobile).
- **Headline 2-Line Cap**: Every headline wraps to at most two lines across all viewports.
- **No Empty Half Screens**: Symmetrical outer margins; content fills grid balance.
- **Genuine Imagery Floor**: Contains authentic 3D Blender Cycles renders, real photographs of Jodhpur Mehrangarh, authentic video loop with poster, and real interface state models.
