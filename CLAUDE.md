# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # start dev server (Next.js, port 3000)
pnpm build      # production build
pnpm lint       # ESLint
```

No test suite is configured.

Add shadcn components: `pnpm shadcn add <component>`

## Architecture

Single-page Next.js 16 app. All rendering is client-side (`"use client"` on every component). The root `app/page.tsx` owns auth state and view routing — it reads `sessionStorage` via `lib/auth-store.ts` and renders one of three views based on a `View` string (`"overview" | "forecast" | "logs"`).

**Auth** — `lib/auth-store.ts` uses `sessionStorage` key `pipeguard_authed`. Hardcoded credentials: `admin / 1234`.

**Data** — all data lives in `lib/mock-data.ts` as static exports. No API calls. The core domain type is `SensorNode` (id, status, thickness metrics, 2D canvas position). `Status` is `"normal" | "warning" | "error" | "offline"`. `STATUS_META` maps each status to its CSS token (`var(--status-*)`) and is the single source of truth for status colors throughout the UI.

**Views:**
- `OverviewView` — fleet KPI cards, Recharts area chart (`thicknessTrend`), monitoring point list, and `FactoryCanvas`
- `ForecastView` — user-input form driving a client-side linear decay simulation rendered in a Recharts line chart
- `LogsView` — Recharts line chart of `evaluationMetrics` (RMSE/MAE) + `logEntries` table

**FactoryCanvas** (`components/factory-canvas.tsx`) — the most complex component. It renders a 2.5D pipe network overlaid on `/public/factory-floor.png`. Nodes are absolutely positioned using `position2d: [x%, y%]`. Pipe connections render as SVG `<line>` elements colored by the worst status of the two endpoints. Has four build modes (`view | insert | edit | delete`) managed entirely in local React state — changes do **not** persist across page reloads.

## Skills

**`frontend-design`** — invoke via `Skill` tool when building or redesigning UI components, pages, or any visual interface work. Guides creation of distinctive, production-grade frontends. Commit to a bold aesthetic direction before coding; avoid generic AI aesthetics (Inter, purple gradients, predictable layouts). See `.claude/skills/frontend-design/SKILL.md`.

## Styling

Dark-only theme. CSS custom properties defined in `app/globals.css` using `oklch()`. Key tokens:
- `--status-{normal|warning|error|offline}` — used everywhere for status colors; never hardcode hex/rgb for status
- `--chart-{1-5}` — chart series colors
- Tailwind 4 with `@theme inline` mapping; `tw-animate-css` for animations; shadcn `base-nova` style

Path alias `@/` maps to project root (configured in `tsconfig.json`).
