# Architecture Review — PipeCorrosionDashboard

**Reviewed:** 2026-06-08  
**Scope:** Full codebase · 23 source files · 3,682 lines

---

## 1. System Structure

**Shape:** Single-route Next.js 16 SPA (all `"use client"`). Three-layer layout:

```text
app/          → routing, auth gate, view switching
components/   → views + UI components
lib/          → data, auth, utilities
```

View routing via string literal `View` type in `page.tsx`. No API calls — all data is static mock in `lib/mock-data.ts`.

**File sizes (lines):**

| File | Lines |
| --- | --- |
| `components/factory-canvas.tsx` | 869 |
| `components/forecast-view.tsx` | 522 |
| `components/logs-view.tsx` | 450 |
| `components/overview-view.tsx` | 386 |
| `lib/mock-data.ts` | 351 |
| `components/streamlit-view.tsx` | 329 |
| All others | < 200 each |

---

## 2. Critical Issues

### 🔴 God Component — `factory-canvas.tsx` (869 lines, 9 useState, 28 fn defs)

Contains SVG pipe rendering, node inspector, build mode state machine (view/insert/edit/delete), floating labels, and drag logic — all in one component. Any bug or feature touch risks regressions across unrelated concerns.

**Recommended split:**

```text
factory-canvas.tsx
  ├── FactoryCanvasBase      (SVG pipes + node positioning)
  ├── NodeInspector          (inspector panel, channel tabs)
  ├── BuildModeToolbar       (mode buttons, insert/edit/delete actions)
  └── FloatingNodeLabel      (M/P/∂ label above each node)
```

---

### 🔴 Unused Dependencies — ~2MB dead weight

```json
"@react-three/fiber"   // zero imports in source
"@react-three/drei"    // zero imports in source
"three"                // zero imports in source
"@base-ui/react"       // zero imports in source
```

`shadcn` should be in `devDependencies` (CLI tool, not runtime).

**Fix:**

```bash
pnpm remove @react-three/fiber @react-three/drei three @base-ui/react
```

---

### 🔴 Credential Export Leak — `lib/auth-store.ts:3`

```ts
export const CREDENTIALS = { username: "admin", password: "1234" } as const;
```

`CREDENTIALS` is a named export — any module can `import { CREDENTIALS }`. Remove the export; keep the comparison inside `login()` only.

---

## 3. Design Pattern Issues

### 🟡 Header Owns Business Logic — `header.tsx:38`

```ts
const alertCount = sensorNodes.filter(
  n => n.status !== "offline" && n.thickness <= n.minThicknessTarget * 1.2
).length;
```

Navigation chrome computing domain alert logic while directly importing `sensorNodes`. Pass `alertCount` as a prop from `page.tsx` or a shared hook instead.

---

### 🟡 `CountdownCell` Defined Inside `ProcessEngineerCard` — `forecast-view.tsx`

Inner function definition re-creates the component reference on every render of the outer component. Lift to module scope.

---

### 🟡 Module-Level `new Date()` in `mock-data.ts`

```ts
const _now = new Date()  // frozen at import time
```

Safe for a mock, but if Next.js ever switches to RSC or the module is server-imported the date is captured at build time. Use `Date.now()` inside a function or document the limitation explicitly.

---

## 4. Data Flow Assessment

| Pattern | Assessment |
| --- | --- |
| All state in components, no Context | ✅ correct at this scale |
| `STATUS_META` single source of truth for status colors | ✅ well-designed |
| `perNodeThicknessTrend` computed at module load | ✅ efficient for static mock |
| `evaluationMetrics` IIFE for dynamic labels | ⚠️ unusual in data file — consider moving to `lib/chart-utils.ts` |
| `header.tsx` directly imports domain data | ❌ couples nav chrome to business logic |

---

## 5. TypeScript

7 `any` uses — all in Recharts tooltip props (`{ active, payload, label }: any`). Recharts does not export clean tooltip prop types, so this is acceptable. Define a shared local interface to eliminate repetition across the four tooltip components:

```ts
// lib/chart-utils.ts
export type RechartsTooltipProps = {
  active?: boolean
  payload?: {
    dataKey: string
    name: string
    value: number
    color: string
    fill?: string
  }[]
  label?: string
}
```

---

## 6. State Management

View routing uses conditional rendering (`{view === "forecast" && <ForecastView />}`), which **unmounts inactive views**. This means `FactoryCanvas` build-mode state (inserted nodes, edits) resets silently on every tab switch — not just on page reload.

CLAUDE.md documents "changes do not persist across page reloads" but the behaviour also applies to navigation.

**If persistence is needed:** lift canvas state to `page.tsx` and pass as props, or use `useRef` to preserve between mounts.

---

## 7. Security Notes

| Item | Status |
| --- | --- |
| Hardcoded `admin / 1234` credentials | Acceptable for demo — document clearly |
| `CREDENTIALS` exported as named export | ❌ Remove export (see §2) |
| `sessionStorage` for auth (not `localStorage`) | ✅ session-scoped, correct |
| No `dangerouslySetInnerHTML` | ✅ |
| No `@ts-ignore` / `@ts-nocheck` | ✅ |
| 1× `eslint-disable` (`<img>` in factory-canvas) | ✅ justified |

---

## 8. Prioritised Backlog

| Priority | Item | File | Effort |
| --- | --- | --- | --- |
| 🔴 High | Remove 4 unused packages | `package.json` | 5 min |
| 🔴 High | Unexport `CREDENTIALS` | `lib/auth-store.ts` | 2 min |
| 🟡 Medium | Split `factory-canvas.tsx` into 4 components | `components/factory-canvas.tsx` | ~2 hrs |
| 🟡 Medium | Lift `alertCount` out of `header.tsx` | `components/header.tsx`, `app/page.tsx` | 15 min |
| 🟡 Medium | Define shared `RechartsTooltipProps` interface | `lib/chart-utils.ts` | 20 min |
| 🟢 Low | Lift `CountdownCell` to module scope | `components/forecast-view.tsx` | 5 min |
| 🟢 Low | Move `evaluationMetrics` label logic to `lib/chart-utils.ts` | `lib/mock-data.ts` | 15 min |
| 🟢 Low | Document canvas state-on-nav-reset in CLAUDE.md | `CLAUDE.md` | 5 min |
