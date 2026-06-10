# Product

## Register

product

## Users

Two overlapping audiences who share the same tool:

- **Plant / field operators** — monitoring floor workers. Open the dashboard to check live sensor status, catch alerts, and confirm the factory floor is healthy. They need fast visual triage: is anything wrong, and where?
- **Engineers / analysts** — technical staff reviewing corrosion trends over time, running manual forecasts, and evaluating ML model accuracy. They go deeper: time-series analysis, decay rate simulation, RMSE/MAE evaluation metrics.

Both groups work in an industrial context. Neither is a passive viewer — they act on what they see.

## Product Purpose

PipeCorrosionDashboard is an internal monitoring and predictive-maintenance tool for factory pipe infrastructure. It aggregates sensor readings for pipe wall thickness across a physical plant, surfaces corrosion trends, and provides ML-backed forecasting to predict when a pipe node reaches a critical threshold.

Success means: operators catch anomalies before they become failures; engineers trust the model outputs enough to act on them; the tool earns daily use by being accurate and fast to read.

## Brand Personality

Industrial, rugged, direct.

The tool lives in a factory context. It should feel like it was purpose-built for that environment — not softened for a SaaS demo, not over-styled for a trade show. Confidence comes from precision and density, not decoration. Every element present is there because it carries information.

## Anti-references

- **Generic SaaS** (purple gradients, Inter, hero-metric cards, identical card grids) — this is not a B2B pitch deck disguised as a dashboard.
- **Cyberpunk / gaming dashboard** — no neon glows, no scanline overlays, no gratuitous animation. Status glows are informational, not atmospheric.
- **Enterprise gray** (flat, lifeless SCADA / SAP aesthetic) — the tool is functional but not visually dead. Dark surfaces are intentional, not a default.
- **Chart-forward over-decoration** — data visualizations inform decisions; they do not perform. No animation-heavy chart reveals or gratuitous data viz.

## Design Principles

1. **Every pixel earns its place.** No decoration without function. If removing an element doesn't cost information, remove it.
2. **Status clarity is the primary task.** Color, hierarchy, and layout all serve one goal: operators must read system health in under two seconds.
3. **Density over whitespace.** This is a monitoring tool, not a landing page. Information compactness is a feature for both operators and engineers.
4. **Trust through precision.** Typography, spacing, and data formatting reinforce accuracy. Rounding, truncation, or visual approximation erodes trust.
5. **Industrial restraint.** Motion and color signal state — they do not decorate. When nothing is wrong, the dashboard is quiet.

## Accessibility & Inclusion

- WCAG AA required: minimum 4.5:1 contrast for body text, 3:1 for large text and UI components.
- Full keyboard navigation (all interactive elements reachable via Tab/Enter/Arrow keys).
- `prefers-reduced-motion` respected: transitions collapse to instant or a simple crossfade.
- Status colors are never the sole differentiator — labels, icons, or text always accompany color-coded status.
