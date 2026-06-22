# Design System — PipeCorrosion Dashboard

**Light theme (white base)** industrial monitoring UI. Aesthetic direction: **utilitarian precision** — dense data, high contrast, zero decoration that doesn't carry meaning. Accent palette derived from THEME.md (green/teal).

---

## Theme Source & THEME.md

The live theme is a **light, white-based** theme with **THEME.md green/teal accents** (oklch). `:root` holds the light values (default — `<html>` has no `dark` class). The `.dark` block retains the legacy blue dark theme and stays togglable.

THEME.md palette → where it maps in the app:

| Role | Name | Hex | App use |
|---|---|---|---|
| Text | Midnight Charcoal | `#181A1B` | `--foreground` |
| Primary Dark | Deep Forest Green | `#0A2E1F` | `--sidebar` (dark green nav on light content) |
| Primary Accent | Emerald Moss | `#255946` | `--primary`, `--ring` |
| Secondary | Muted Teal | `#6B979C` | `--chart-5`, secondary tone |
| Soft Accent | Soft Sky Teal | `#9AB8BA` | `--border` family |
| Text / Light | Light Ash Grey | `#D9DBDA` | light surfaces / sidebar text |

Guidance from THEME.md: 60-30-10 weighting — white/ash bg (60%), forest-green sidebar + panels (30%), emerald-moss CTA (10%). `app/globals.css` is the source of truth.

---

## Theme

Defined entirely in `app/globals.css` via CSS custom properties (oklch color space). `:root` = light (default), `.dark` = legacy dark (togglable).

### Background / Surface Stack (light)

| Token | Value | Usage |
|---|---|---|
| `--background` | `oklch(0.985 0.004 190)` | Page background (near-white, faint teal) |
| `--card` | `oklch(1 0 0)` | Cards, panels (white) |
| `--popover` | `oklch(1 0 0)` | Tooltips, popovers |
| `--sidebar` | `oklch(0.275 0.045 165)` | Sidebar — Deep Forest Green |
| `--secondary` | `oklch(0.93 0.012 195)` | Secondary buttons, row highlights |
| `--muted` | `oklch(0.955 0.006 195)` | Muted backgrounds |
| `--accent` | `oklch(0.9 0.02 192)` | Hover states |

### Foreground / Text

| Token | Usage |
|---|---|
| `--foreground` | Primary text |
| `--muted-foreground` | Labels, secondary text |
| `--card-foreground` | Text on cards |

### Interactive

| Token | Value | Usage |
|---|---|---|
| `--primary` | `oklch(0.415 0.075 162)` | Emerald Moss — buttons, active, links |
| `--primary-foreground` | `oklch(0.985 0.005 180)` | Text on primary (near-white) |
| `--ring` | `oklch(0.415 0.075 162)` | Focus rings |
| `--border` | `oklch(0.87 0.018 195)` | Borders (soft sky teal) |
| `--input` | `oklch(0.89 0.015 195)` | Input borders |
| `--destructive` | `oklch(0.57 0.2 27)` | Destructive actions |

### Status Colors

Single source of truth: `STATUS_META` in `lib/mock-data.ts`. Always reference via CSS token — never hardcode hex/rgb for status indicators.

| Token | Color | Meaning |
|---|---|---|
| `--status-normal` | `oklch(0.58 0.15 150)` | Green — healthy |
| `--status-warning` | `oklch(0.68 0.15 75)` | Amber — degrading |
| `--status-error` | `oklch(0.55 0.2 27)` | Red-orange — critical / breach |
| `--status-offline` | `oklch(0.6 0.012 200)` | Neutral gray — no signal |

> Status colors darkened/desaturated vs. the dark theme for legibility on white.

Usage pattern: `style={{ color: STATUS_META[node.status].token }}` or `style={{ backgroundColor: STATUS_META[node.status].token }}`.

### Chart Colors

| Token | Hue | Default use |
|---|---|---|
| `--chart-1` | Teal `oklch(0.5 0.08 178)` | Primary series (Inlet) |
| `--chart-2` | Green `oklch(0.6 0.13 150)` | |
| `--chart-3` | Amber `oklch(0.7 0.13 80)` | Tertiary series (Exchanger) |
| `--chart-4` | Red-orange `oklch(0.57 0.2 27)` | Danger series (Reactor) |
| `--chart-5` | Muted Teal `oklch(0.63 0.035 205)` | THEME.md `#6B979C` |

### Kiosk Tokens (`--kiosk-*`)

Dashboard v2 (full-screen kiosk) is the default view and was previously full of hardcoded inline `oklch()` literals. Those are now migrated to a scoped `--kiosk-*` layer defined in **both** `:root` (light) and `.dark`, so the kiosk retints from one place. Referenced inline as `var(--kiosk-panel)` (and `bg-[var(--kiosk-panel)]` in arbitrary classes).

| Token | Role |
|---|---|
| `--kiosk-bg` | Deepest page background |
| `--kiosk-panel` | Panel/card background |
| `--kiosk-panel-raised` | Raised / white panel |
| `--kiosk-surface` | Hover / raised surface |
| `--kiosk-line` / `--kiosk-line-strong` | Solid dividers |
| `--kiosk-hairline-soft` / `--kiosk-hairline` / `--kiosk-hairline-strong` | Translucent borders (alpha) |
| `--kiosk-ink-dim` / `--kiosk-ink-faint` | Secondary / faint text |
| `--kiosk-accent` | Teal accent text/lines |
| `--kiosk-glow` | Accent glow fills |
| `--kiosk-scrim` | Modal backdrop |
| `--kiosk-grid` | Scanline texture (rgba) |

Rule: in v2 components, **never** reintroduce raw `oklch()` — add/extend a `--kiosk-*` token instead. (Exception: `STREAMLIT_RED` brand const, intentionally theme-invariant.)

---

## Typography

| Font var | Source | Role |
|---|---|---|
| `--font-sans` (`--font-geist-sans`) | Geist Sans | All UI text |
| `--font-mono` (`--font-geist-mono`) | Geist Mono | Timestamps, sensor IDs, numeric data |

Sensor IDs and timestamps use `font-mono text-xs`. Numeric data in tables/cards uses `tabular-nums` for alignment.

---

## Radius Scale

Derived from `--radius: 0.5rem`.

| Token | Value |
|---|---|
| `--radius-sm` | `0.3rem` |
| `--radius-md` | `0.4rem` |
| `--radius-lg` | `0.5rem` (base) |
| `--radius-xl` | `0.7rem` |
| `--radius-2xl` | `0.9rem` |

---

## Component Conventions

**Cards** — `<Card className="p-4|p-5">`. No extra wrapper divs; use `gap-*` on the card for internal spacing.

**Status badges** — always `<StatusBadge status={node.status} />` from `components/status-badge.tsx`. Never inline a badge manually.

**Alert banners** — `<AlertBanner nodes={sensorNodes} />` from `components/alert-banner.tsx` for threshold breach alerts.

**Pipe/node colors on canvas** — pipe color = worst status of the two endpoint nodes. Pattern in `factory-canvas.tsx`:
```ts
const worst = a.status === "error" || b.status === "error" ? "error"
  : a.status === "warning" || b.status === "warning" ? "warning"
  : a.status === "offline" || b.status === "offline" ? "offline"
  : "normal"
```

**Pulse ring** — `animate-ping` (tw-animate-css) on nodes with `status === "error"` or thickness ≤ `minThicknessTarget`. Size `size-10`, opacity `0.30`.

**Node glow** — `box-shadow: 0 0 12px color-mix(in oklch, ${color} 40%, transparent)` on sensor node circles.

---

## Layout

Responsive breakpoints follow Tailwind defaults. Key patterns used:

- Sidebar: `hidden md:block` (collapsed on mobile, replaced by horizontal tab row)
- Grid layouts: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for KPI cards
- Chart+list split: `xl:col-span-2` in a 3-column grid
- FactoryCanvas height: fixed `height: 480px` wrapper

---

## Motion

`tw-animate-css` imported in `globals.css`. Used for:
- `animate-ping` — alert pulse rings on critical/error sensor nodes
- No page-level transitions currently

---

## shadcn

Style: `base-nova`. Components in `components/ui/`. Add via `pnpm shadcn add <component>`. Icon library: `lucide-react`.

Do not override shadcn component internals with arbitrary classes — extend via `className` prop using `cn()` from `lib/utils.ts`.
