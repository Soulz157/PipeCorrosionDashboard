"use client"

import { useState } from "react"
import { FactoryCanvas } from "@/components/factory-canvas"
import {
  STATUS_META,
  perNodeThicknessTrend,
  sensorNodes,
  statusCounts,
} from "@/lib/mock-data"
import { Home, TrendingDown, X } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const NODE_CHART_COLORS: Record<string, string> = {
  "PN-01": "var(--chart-1)",
  "PN-02": "var(--chart-3)",
  "PN-03": "var(--chart-4)",
  "PN-04": "var(--chart-2)",
  "PN-05": "var(--chart-5)",
}

const ACTIVE_NODES = sensorNodes.filter((n) => n.status !== "offline")

const SCANLINE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.012) 2px,rgba(255,255,255,0.012) 4px)",
}

const BAR_BG: React.CSSProperties = {
  background: "oklch(0.13 0.005 240 / 96%)",
  backdropFilter: "blur(14px)",
  ...SCANLINE,
}

// Status bar height in px — keep in sync with h-11 (44px)
const STATUS_BAR_H = 44

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="border bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md"
      style={{ borderColor: "var(--border)", borderRadius: 2 }}
    >
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="size-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="font-mono text-[10px] text-muted-foreground">{p.dataKey}</span>
          <span
            className="ml-auto font-mono text-[10px] font-bold tabular-nums"
            style={{ color: p.color }}
          >
            {p.value} mm
          </span>
        </div>
      ))}
    </div>
  )
}

export function DashboardV2View({
  onNavigateHome,
}: {
  onNavigateHome?: () => void
}) {
  const [trendOpen, setTrendOpen] = useState(false)

  const alertCount = sensorNodes.filter(
    (n) => n.status !== "offline" && n.thickness <= n.minThicknessTarget * 1.2,
  ).length

  return (
    <div className="relative flex h-full w-full flex-col">

      {/* ═══════════════════════════════════
          Canvas — fills all remaining space
      ═══════════════════════════════════ */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <FactoryCanvas />
      </div>

      {/* ═══════════════════════════════════
          Trend panel — slides up from above status bar
      ═══════════════════════════════════ */}
      <div
        className={`absolute left-0 right-0 z-20 transition-transform duration-300 ${
          trendOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ bottom: STATUS_BAR_H }}
      >
        <div
          style={{
            borderTop: "2px solid var(--primary)",
            boxShadow: "0 -6px 28px color-mix(in oklch, var(--primary) 14%, transparent)",
            ...BAR_BG,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-4 px-4 py-2"
            style={{ borderBottom: "1px solid oklch(1 0 0 / 10%)" }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex size-1.5">
                <span
                  className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                  style={{ backgroundColor: "var(--primary)" }}
                />
                <span
                  className="relative inline-flex size-1.5 rounded-full"
                  style={{ backgroundColor: "var(--primary)" }}
                />
              </span>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
                  Real-time · 12-month window
                </p>
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-foreground">
                  Wall Thickness Monitor
                </p>
              </div>
            </div>

            <div className="h-7 w-px bg-border/40" aria-hidden="true" />

            <div className="flex flex-wrap gap-3">
              {ACTIVE_NODES.map((n) => (
                <span key={n.id} className="flex items-center gap-1.5 font-mono text-[9px]">
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      backgroundColor: NODE_CHART_COLORS[n.id],
                      boxShadow: `0 0 4px ${NODE_CHART_COLORS[n.id]}`,
                    }}
                    aria-hidden="true"
                  />
                  <span style={{ color: NODE_CHART_COLORS[n.id] }}>{n.id}</span>
                  <span className="text-muted-foreground/60">{n.location.split(" ")[0]}</span>
                </span>
              ))}
            </div>

            <button
              type="button"
              aria-label="Close trend panel"
              onClick={() => setTrendOpen(false)}
              className="ml-auto flex size-6 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              style={{ border: "1px solid oklch(1 0 0 / 14%)", borderRadius: 2 }}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Chart */}
          <div className="h-44 w-full px-2 pb-2 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={perNodeThicknessTrend} margin={{ top: 4, right: 10, left: -18, bottom: 0 }}>
                <defs>
                  {ACTIVE_NODES.map((node) => {
                    const c = NODE_CHART_COLORS[node.id]
                    return (
                      <linearGradient key={node.id} id={`d2-grad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    )
                  })}
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="oklch(1 0 0 / 7%)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                />
                <YAxis
                  domain={[0, 14]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}mm`}
                />
                <Tooltip content={<TrendTooltip />} />
                <ReferenceLine
                  y={6}
                  stroke="var(--status-warning)"
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  label={{ value: "min", position: "insideTopRight", fill: "var(--status-warning)", fontSize: 8, fontFamily: "var(--font-mono)" }}
                />
                {ACTIVE_NODES.map((node) => (
                  <Area
                    key={node.id}
                    type="monotone"
                    dataKey={node.id}
                    name={node.location}
                    stroke={NODE_CHART_COLORS[node.id]}
                    strokeWidth={1.5}
                    fill={`url(#d2-grad-${node.id})`}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          Status bar — fixed at bottom
      ═══════════════════════════════════ */}
      <div
        className="relative z-30 flex h-11 shrink-0 items-stretch"
        style={{
          borderTop: "1px solid oklch(1 0 0 / 14%)",
          ...BAR_BG,
        }}
      >
        {/* Home button */}
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-4 transition-colors hover:bg-white/5"
            style={{ borderRight: "1px solid oklch(1 0 0 / 12%)" }}
          >
            <Home
              className="size-3.5 shrink-0"
              style={{ color: "var(--muted-foreground)" }}
              aria-hidden="true"
            />
            <div className="text-left">
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
                Return
              </p>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-foreground">
                Home
              </p>
            </div>
          </button>
        )}

        {/* Status indicators */}
        {statusCounts.map(({ status, count }) => {
          const meta = STATUS_META[status]
          const isActive = count > 0
          const pulse = isActive && (status === "error" || status === "warning")
          return (
            <div
              key={status}
              className="flex items-center gap-2 px-3"
              style={{ borderRight: "1px solid oklch(1 0 0 / 8%)" }}
            >
              <span className="relative flex size-1.5 shrink-0">
                {pulse && (
                  <span
                    className="absolute inline-flex size-full animate-ping rounded-full opacity-50"
                    style={{ backgroundColor: meta.token }}
                  />
                )}
                <span
                  className="relative inline-flex size-1.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? meta.token : "oklch(0.28 0.005 240)",
                    boxShadow: isActive
                      ? `0 0 5px color-mix(in oklch, ${meta.token} 70%, transparent)`
                      : undefined,
                  }}
                />
              </span>
              <span
                className="hidden font-mono text-[9px] uppercase tracking-wider sm:block"
                style={{ color: isActive ? meta.token : "var(--muted-foreground)", opacity: isActive ? 1 : 0.45 }}
              >
                {meta.label}
              </span>
              <span
                className="font-mono text-xs font-bold tabular-nums leading-none"
                style={{ color: isActive ? meta.token : "oklch(0.38 0.005 240)" }}
              >
                {count}
              </span>
            </div>
          )
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Alert badge */}
        {alertCount > 0 && (
          <div
            className="flex items-center gap-2 px-3"
            style={{
              borderLeft: "1px solid color-mix(in oklch, var(--status-error) 35%, transparent)",
              background: "color-mix(in oklch, var(--status-error) 8%, transparent)",
            }}
          >
            <span className="relative flex size-2 shrink-0">
              <span
                className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: "var(--status-error)" }}
              />
              <span
                className="relative inline-flex size-2 rounded-full"
                style={{
                  backgroundColor: "var(--status-error)",
                  boxShadow: "0 0 6px color-mix(in oklch, var(--status-error) 80%, transparent)",
                }}
              />
            </span>
            <span
              className="font-mono text-sm font-bold tabular-nums leading-none"
              style={{ color: "var(--status-error)" }}
            >
              {alertCount}
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-wider text-muted-foreground sm:block">
              alert{alertCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Trend toggle */}
        <button
          type="button"
          onClick={() => setTrendOpen((v) => !v)}
          className="flex items-center gap-2 px-4 transition-all"
          style={{
            borderLeft: "1px solid oklch(1 0 0 / 12%)",
            background: trendOpen
              ? "color-mix(in oklch, var(--primary) 12%, transparent)"
              : undefined,
            borderLeftColor: trendOpen ? "var(--primary)" : undefined,
            boxShadow: trendOpen
              ? "inset 0 1px 0 color-mix(in oklch, var(--primary) 40%, transparent)"
              : undefined,
          }}
        >
          <TrendingDown
            className="size-3.5 shrink-0"
            style={{ color: trendOpen ? "var(--primary)" : "var(--muted-foreground)" }}
            aria-hidden="true"
          />
          <div className="text-left">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
              Monitor
            </p>
            <p
              className="font-mono text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: trendOpen ? "var(--primary)" : "var(--foreground)" }}
            >
              Trend
            </p>
          </div>
          <span className="ml-1 font-mono text-xs text-muted-foreground" aria-hidden="true">
            {trendOpen ? "▼" : "▲"}
          </span>
        </button>
      </div>
    </div>
  )
}
