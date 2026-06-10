---
name: PipeGuard
description: Industrial corrosion monitoring dashboard for plant operators and engineers
colors:
  bunker: "oklch(0.16 0.005 240)"
  bunker-surface: "oklch(0.20 0.006 240)"
  bunker-raised: "oklch(0.26 0.007 240)"
  steel-white: "oklch(0.96 0.003 240)"
  steel-muted: "oklch(0.68 0.01 240)"
  ghost-border: "oklch(1 0 0 / 10%)"
  flux-blue: "oklch(0.65 0.16 230)"
  all-clear: "oklch(0.72 0.17 145)"
  caution-amber: "oklch(0.78 0.16 80)"
  alarm-red: "oklch(0.62 0.21 25)"
  cold-gray: "oklch(0.60 0.01 240)"
typography:
  title:
    fontFamily: "Geist Sans, 'Geist Fallback', system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist Sans, 'Geist Fallback', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Sans, 'Geist Fallback', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono, 'Geist Mono Fallback', 'JetBrains Mono', monospace"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "\"tnum\" 1"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "11px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.flux-blue}"
    textColor: "oklch(0.14 0.01 240)"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "oklch(0.70 0.16 230)"
    textColor: "oklch(0.14 0.01 240)"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.steel-muted}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  status-badge-normal:
    backgroundColor: "color-mix(in oklch, oklch(0.72 0.17 145) 12%, transparent)"
    textColor: "{colors.all-clear}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-badge-warning:
    backgroundColor: "color-mix(in oklch, oklch(0.78 0.16 80) 12%, transparent)"
    textColor: "{colors.caution-amber}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-badge-error:
    backgroundColor: "color-mix(in oklch, oklch(0.62 0.21 25) 12%, transparent)"
    textColor: "{colors.alarm-red}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-badge-offline:
    backgroundColor: "color-mix(in oklch, oklch(0.60 0.01 240) 12%, transparent)"
    textColor: "{colors.cold-gray}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  card:
    backgroundColor: "{colors.bunker-surface}"
    textColor: "{colors.steel-white}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: PipeGuard

## 1. Overview

**Creative North Star: "The Plant Operations Room"**

PipeGuard is built for people who can't afford to be wrong. The design language is borrowed from industrial control panels, not software products: every indicator in a fixed position, every color carrying exactly one meaning, nothing decorative that earns no information. Operators scan for anomalies in under two seconds; engineers dig into trend data without fighting the interface.

The surface is dark blue-steel — a bunker, not a night mode. Depth comes from three tonal surface steps (Bunker → Bunker Surface → Bunker Raised), not from shadows or gradients. The sole interactive accent, Flux Blue, appears only on active elements, primary buttons, and focus rings. Its rarity is what gives it authority. The four status colors — All Clear green, Caution Amber, Alarm Red, Cold Gray — are the loudest signals on any screen; when nothing is wrong, the dashboard is quiet and the status colors are absent.

Motion is disciplined: state changes transition at 150ms ease-out, nothing choreographed. Typography is a single family (Geist Sans) in all roles, with Geist Mono reserved for numeric data where tabular alignment is mandatory. Components are compact and controlled: tight internal padding, restrained radius, borders and color doing the structural work.

This system explicitly rejects: generic SaaS aesthetics (hero-metric cards, purple gradients, Inter font everywhere), cyberpunk gaming dashboards (neon glows, scanline overlays, gratuitous animation), enterprise gray (flat, lifeless SCADA-era look), and chart-forward over-decoration (animation-heavy data viz, data that performs instead of informs).

**Key Characteristics:**
- Dark blue-steel surfaces — tonal depth via three surface layers, no decorative shadows
- One interactive accent (Flux Blue) — restricted to interactive elements and focus rings only
- Four semantic status colors — the highest-contrast signals on any screen; silent when not triggered
- Single sans-serif family (Geist Sans) + mono for numeric data (Geist Mono)
- Compact density: 32px button height, 8px base radius, padding varies by context not aesthetics
- 150ms ease-out state transitions only — zero decorative motion

## 2. Colors: The Bunker Palette

A near-achromatic dark blue-steel base carries the surface; a single mid-blue accent and a four-color semantic status system carry all meaning.

### Primary

- **Flux Blue** (`oklch(0.65 0.16 230)`): The sole interactive accent. Used on primary buttons, active sidebar navigation items, focus rings, chart series 1, and the `--ring` token. Never used decoratively. Its restricted use is the design contract — one blue means "you can act here."

### Neutral

- **Bunker** (`oklch(0.16 0.005 240)`): Main application background. Dark blue-steel, not pure black. The slight blue tint (C: 0.005, H: 240) ties it to the Flux Blue accent family at near-zero chroma.
- **Bunker Surface** (`oklch(0.20 0.006 240)`): Card and panel surface. The first tonal step above Bunker. Elevates content containers without shadows.
- **Bunker Raised** (`oklch(0.26 0.007 240)`): Secondary buttons, muted surfaces, sidebar accent hover state. The second tonal step. Marks interactive-but-not-primary surfaces.
- **Steel White** (`oklch(0.96 0.003 240)`): Primary foreground text. Near-white with a barely perceptible blue cast that harmonizes with the blue-tinted background family.
- **Steel Muted** (`oklch(0.68 0.01 240)`): Secondary text, labels, placeholder content, icon default state. Verify ≥4.5:1 against Bunker Surface on any new surface.
- **Ghost Border** (`oklch(1 0 0 / 10%)`): Universal border token. White at 10% opacity reads as a subtle edge on any dark surface without requiring per-surface computation.

### Semantic Status

- **All Clear** (`oklch(0.72 0.17 145)`): `--status-normal`. Healthy sensor reading. Also chart-2.
- **Caution Amber** (`oklch(0.78 0.16 80)`): `--status-warning`. Approaching threshold. Also chart-3.
- **Alarm Red** (`oklch(0.62 0.21 25)`): `--status-error`. At or below minimum thickness. Also `--destructive` and chart-4.
- **Cold Gray** (`oklch(0.60 0.01 240)`): `--status-offline`. Sensor offline or unreachable. No chroma — visually inert, which is the point.

### Named Rules

**The One Accent Rule.** Flux Blue is the only interactive accent. Do not use it for decorative highlights, chart fills unrelated to primary data series, or any non-interactive element. Its rarity is what gives it authority.

**The Status-First Rule.** Status colors are reserved for status. Never use All Clear green for a "success" toast, Alarm Red for a "sale" badge, or any status color for non-status UI. The semantic contract is system-wide; a single violation breaks operator trust.

**The Color-Mix Rule.** All tinted status backgrounds use `color-mix(in oklch, var(--status-X) 8–12%, transparent)`. Never hardcode a hex approximation. The mix stays perceptually correct as the status palette evolves.

## 3. Typography

**Primary Font:** Geist Sans (with `'Geist Fallback', system-ui, sans-serif`)
**Data / Mono Font:** Geist Mono (with `'Geist Mono Fallback', 'JetBrains Mono', monospace`)

**Character:** A single geometric sans-serif family in multiple weights carries all type roles. No display-versus-body split — product UI doesn't need the contrast, and consistency is a virtue here. Geist Mono enters only for numeric data, where tabular alignment is structural, not aesthetic.

### Hierarchy

- **Title** (600 weight, 20px, lh 1.2, ls -0.025em): Page-level headings in the header bar. One per view. `text-wrap: pretty` applied.
- **Section Heading** (600 weight, 14–16px, lh 1.3): Section labels within a view (card headers, panel titles). Rarely larger than 16px.
- **Body** (400 weight, 14px, lh 1.5): Primary reading text — descriptions, table cells, list items, form content. The workhorse role.
- **Label** (500 weight, 12px, lh 1.4): Secondary labels, muted metadata, stat descriptions below KPI values. Never all-caps with letter-spacing — plain weight at small size is enough.
- **Mono Data** (400 weight, 13px, Geist Mono, tabular-nums): All numeric readings — thickness in mm, KPI counts, metric values, timestamps. Tabular-nums is non-negotiable.

### Named Rules

**The Tabular Commitment Rule.** Every numeric value in the UI — thickness readings, KPI counts, RMSE/MAE metrics, timestamps — must use `font-variant-numeric: tabular-nums`. Proportional numbers in data context cause columns to jitter on update and erode the precision-instrument feel. No exceptions.

**The Scale Compression Rule.** The type scale uses a tight ratio (1.15–1.2× between steps). The biggest heading in the app is 20px (page title); data values at 30px (KPI emphasis) are the exception. Exaggerated heading sizes create noise in a dense multi-panel layout.

## 4. Elevation

This system uses **tonal layering**, not shadows, as the primary depth mechanism. Three surface steps create perceived elevation without light sources:

1. **Bunker** `oklch(0.16 0.005 240)` — application background, the floor
2. **Bunker Surface** `oklch(0.20 0.006 240)` — cards, panels, primary content containers
3. **Bunker Raised** `oklch(0.26 0.007 240)` — secondary interactive surfaces, hover states, nested panels

Shadows appear in one place only: the login card (`box-shadow: 0 20px 60px rgba(0,0,0,0.5)`). This is the only screen where a floating card over a background requires a shadow to communicate lift. All in-app surfaces are flat at rest.

The header uses `backdrop-filter: blur` to maintain legibility when content scrolls beneath it — a functional blur, not a glassmorphism effect.

### Named Rules

**The Flat-First Rule.** Surfaces are flat at rest. Depth is conveyed by tonal steps, not shadows. Do not add `box-shadow` to in-app cards, panels, or nav items. Reserve shadows for modal overlays and the login screen only.

## 5. Components

Components are compact and controlled. Tight internal padding, restrained radius, borders and color do the structural work.

### Buttons

- **Shape:** Slightly rounded corners (8px / `--radius-lg`). Never pill-shaped; never square.
- **Primary:** Flux Blue background (`--primary`) with near-black foreground (`--primary-foreground`). Height 32px, padding `0 10px`. Text 14px, 500 weight.
- **Hover / Focus:** Hover at 85% opacity. Focus-visible: 3px ring in `ring/50` (Flux Blue at 50%), 2px offset. Active state: 1px downward translate.
- **Ghost:** Transparent background, Steel Muted text. Hover reveals Bunker Raised surface. For secondary actions in toolbars and popovers.
- **Destructive:** Alarm Red at 10% opacity background, full Alarm Red text. Irreversible actions only.
- **Icon button:** 36px square (size-9), border + Bunker Surface background. Used in header for notifications and mobile hamburger.

### Status Badges

The most distinctive component. Round-pill shape (`border-radius: 9999px`), 1px solid border, 12% opacity tinted fill — all driven by the status color token.

- **Construction:** `border-color: var(--status-X)`, `color: var(--status-X)`, `background: color-mix(in oklch, var(--status-X) 12%, transparent)`. A 6px dot precedes the label.
- **Variants:** All four statuses (normal / warning / error / offline) follow identical structure. Color is never the sole indicator — the dot and text label always accompany it.
- **Size:** 12px text, 10px horizontal padding, 2px vertical padding.

### Cards / Containers

- **Corner Style:** Gently rounded (11px / `--radius-xl`)
- **Background:** Bunker Surface (`oklch(0.20 0.006 240)`) — one tonal step above page background
- **Shadow Strategy:** None at rest. Login card uses `shadow-xl` as the single exception.
- **Border:** Ghost Border (`oklch(1 0 0 / 10%)`) — consistent across all containers; no per-card color variations
- **Internal Padding:** 16px compact panels; 24px for spacious surfaces (login form)

### Inputs / Fields

- **Style:** Bordered stroke — `border border-border bg-card rounded-md`. Height ~36px.
- **Icon inset:** Left-icon pattern with `pl-9` offset. Icon in Steel Muted.
- **Focus:** Border shifts to `--ring` (Flux Blue). Focus ring: 3px at `ring/50`.
- **Error state:** `aria-invalid` triggers Alarm Red border + Alarm Red ring at 20% opacity.
- **Disabled:** 50% opacity, pointer-events none.

### Navigation (Sidebar)

- **Default item:** 14px, 500 weight, Steel Muted text. Icon + label. `rounded-md` background on hover → Bunker Raised.
- **Active item:** Bunker Raised background, Steel White text. No accent stripe — tonal fill communicates selection.
- **Collapsed mode:** Icon-only at 56px width. Same hover/active treatment.
- **Width:** 256px expanded ↔ 56px collapsed, 200ms transition.

### Alert Banner

Triggered by sensor threshold breach. Full-width container, full border + tinted background — no side stripe.

- **Warning state:** Border at 40% opacity, background at 8% opacity, both Caution Amber. Bell icon + colored title text.
- **Critical state:** Same pattern with Alarm Red. Sorted above warnings.
- **Alert rows:** Each node: rounded border, status fill at 8%, inline reading vs. minimum. Dismiss per row.
- **Expand/collapse:** For > 2 alerts. Muted foreground toggle button.

### Status Indicator Dot

Minimal inline signal: 10px circle (`size-2.5 rounded-full`) filled with the status color token. Used in header fleet summary and status summary cards. Always accompanied by a numeric or text label — never standalone.

### FactoryCanvas (Signature Component)

The 2.5D pipe network map overlaid on a factory floor photograph. Sensor nodes absolutely positioned using `position2d: [x%, y%]`. Pipe connections are SVG `<line>` elements colored by the worst status of the two endpoint nodes, using status color tokens. Four edit modes (view / insert / edit / delete) in local state — changes do not persist. The canvas has a distinct visual register: industrial photography backdrop with color-coded indicators, not a schematic diagram.

## 6. Do's and Don'ts

### Do:

- **Do** use `font-variant-numeric: tabular-nums` on every numeric value — thickness readings, KPI counts, RMSE/MAE metrics, timestamps.
- **Do** drive all status colors via `var(--status-normal/warning/error/offline)` tokens. Never hardcode a hex approximation for status.
- **Do** use `color-mix(in oklch, var(--status-X) 8–12%, transparent)` for tinted status fills. This keeps backgrounds perceptually correct as the palette evolves.
- **Do** restrict Flux Blue to interactive elements: primary buttons, active nav items, focus rings, primary chart series. Its rarity is the design contract.
- **Do** accompany every status color with a text label or icon — color alone is never the sole status indicator (WCAG AA requirement, and operator trust depends on it).
- **Do** keep all numeric readings in Geist Mono. The typeface switch is a cue: "this is data, not prose."
- **Do** use Ghost Border (`oklch(1 0 0 / 10%)`) universally for container borders. Never compute a per-surface border color.
- **Do** transition state changes at 150ms with an ease-out curve. Operators need immediate feedback; anything slower feels broken.
- **Do** verify Steel Muted (`oklch(0.68 0.01 240)`) achieves ≥4.5:1 contrast against Bunker Surface on any new surface where it appears.

### Don't:

- **Don't** use gradient text (`background-clip: text` + gradient). Decorative, never meaningful. Single solid colors only.
- **Don't** use side-stripe borders (`border-left` > 1px as a colored accent on cards or alerts). Full borders + tinted backgrounds are the correct pattern.
- **Don't** add neon glows, scanline overlays, or gratuitous animation. This is not a cyberpunk gaming dashboard. Status colors inform; they do not atmosphere.
- **Don't** use purple gradients, hero-metric card layouts, or generic SaaS aesthetic patterns (big number, small label, gradient accent). PipeGuard is not a B2B pitch deck.
- **Don't** flatten the dark surfaces toward achromatic gray (chroma 0). Bunker's `C: 0.005, H: 240` is the minimum acceptable tint. The blue-steel character must hold.
- **Don't** use decorative motion: no orchestrated page-load sequences, no chart-entrance animations, no animated counters. Motion conveys state change only.
- **Don't** display numeric data without tabular-nums alignment. A column of thickness readings that jiggles on update destroys operator trust.
- **Don't** add shadows to in-app cards or panels. The tonal layer stack creates depth. Card shadows make the UI feel like a generic SaaS product.
- **Don't** use All Clear green, Caution Amber, or Alarm Red for non-status purposes. Corrupting the semantic contract (e.g., "success green" on a save button) breaks the operator's ability to triage at a glance.
- **Don't** produce chart-forward over-decoration: animation-heavy chart reveals, gratuitous data viz effects, data that performs instead of informs.
