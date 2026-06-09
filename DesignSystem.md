# Design System — PipeCorrosion Dashboard

Dark-only industrial monitoring UI. Aesthetic direction: **utilitarian precision** — dense data, high contrast, zero decoration that doesn't carry meaning.

---

## Theme

Defined entirely in `app/globals.css` via CSS custom properties (oklch color space). Same values for `:root` and `.dark` — this is a dark-only app.

### Background / Surface Stack

| Token | Value | Usage |
|---|---|---|
| `--background` | `oklch(0.16 0.005 240)` | Page background |
| `--card` | `oklch(0.20 0.006 240)` | Cards, panels |
| `--popover` | `oklch(0.19 0.006 240)` | Tooltips, popovers |
| `--sidebar` | `oklch(0.18 0.006 240)` | Sidebar surface |
| `--secondary` | `oklch(0.26 0.007 240)` | Secondary buttons, row highlights |
| `--muted` | `oklch(0.24 0.006 240)` | Muted backgrounds |
| `--accent` | `oklch(0.28 0.008 240)` | Hover states |

### Foreground / Text

| Token | Usage |
|---|---|
| `--foreground` | Primary text |
| `--muted-foreground` | Labels, secondary text |
| `--card-foreground` | Text on cards |

### Interactive

| Token | Value | Usage |
|---|---|---|
| `--primary` | `oklch(0.65 0.16 230)` | Primary buttons, active states, links |
| `--primary-foreground` | `oklch(0.14 0.01 240)` | Text on primary |
| `--ring` | `oklch(0.65 0.16 230)` | Focus rings |
| `--border` | `oklch(1 0 0 / 10%)` | Borders |
| `--input` | `oklch(1 0 0 / 12%)` | Input backgrounds |
| `--destructive` | `oklch(0.62 0.21 25)` | Destructive actions |

### Status Colors

Single source of truth: `STATUS_META` in `lib/mock-data.ts`. Always reference via CSS token — never hardcode hex/rgb for status indicators.

| Token | Color | Meaning |
|---|---|---|
| `--status-normal` | `oklch(0.72 0.17 145)` | Green — healthy |
| `--status-warning` | `oklch(0.78 0.16 80)` | Amber — degrading |
| `--status-error` | `oklch(0.62 0.21 25)` | Red-orange — critical / breach |
| `--status-offline` | `oklch(0.60 0.01 240)` | Neutral gray — no signal |

Usage pattern: `style={{ color: STATUS_META[node.status].token }}` or `style={{ backgroundColor: STATUS_META[node.status].token }}`.

### Chart Colors

| Token | Hue | Default use |
|---|---|---|
| `--chart-1` | Blue `oklch(0.65 0.16 230)` | Primary series (Inlet) |
| `--chart-2` | Green `oklch(0.72 0.17 145)` | |
| `--chart-3` | Amber `oklch(0.78 0.16 80)` | Tertiary series (Exchanger) |
| `--chart-4` | Red-orange `oklch(0.62 0.21 25)` | Danger series (Reactor) |
| `--chart-5` | Neutral `oklch(0.70 0.02 240)` | |

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
