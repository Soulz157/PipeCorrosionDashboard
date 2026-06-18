"use client"

import { useState } from "react"
import { FactoryCanvas } from "@/components/factory-canvas"
import {
  STATUS_META,
  perNodePowerConsumption,
  perNodePowerConsumptionHistorical,
  perNodeThicknessTrend,
  perNodeThicknessTrendHistorical,
  sensorNodes,
  statusCounts,
} from "@/lib/mock-data"
import { Home } from "lucide-react"
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

type ChartRow = Record<string, number | string>

/** Schematic height clamp (vh) while dragging the splitter */
const SPLIT_MIN = 20
const SPLIT_MAX = 75

function TrendTooltip({ active, payload, label, unit = "mm" }: any) {
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
            {p.value} {unit}
          </span>
        </div>
      ))}
    </div>
  )
}

/** A single multi-line chart (one series per active node) keyed by id. */
function NodeChart({
  data,
  unit,
  domain,
  tickFormatter,
  minLine,
  gradPrefix,
}: {
  data: ChartRow[]
  unit: string
  domain: [number, number]
  tickFormatter: (v: number) => string
  minLine?: number
  gradPrefix: string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 10, left: -18, bottom: 0 }}>
        <defs>
          {ACTIVE_NODES.map((node) => {
            const c = NODE_CHART_COLORS[node.id]
            return (
              <linearGradient key={node.id} id={`${gradPrefix}-${node.id}`} x1="0" y1="0" x2="0" y2="1">
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
          domain={domain}
          tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={tickFormatter}
        />
        <Tooltip content={<TrendTooltip unit={unit} />} />
        {minLine !== undefined && (
          <ReferenceLine
            y={minLine}
            stroke="var(--status-warning)"
            strokeDasharray="4 3"
            strokeWidth={1}
            label={{
              value: "min",
              position: "insideTopRight",
              fill: "var(--status-warning)",
              fontSize: 8,
              fontFamily: "var(--font-mono)",
            }}
          />
        )}
        {ACTIVE_NODES.map((node) => (
          <Area
            key={node.id}
            type="monotone"
            dataKey={node.id}
            name={node.location}
            stroke={NODE_CHART_COLORS[node.id]}
            strokeWidth={1.5}
            fill={`url(#${gradPrefix}-${node.id})`}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** One titled visual block: a header + a wall-thickness and a power chart. */
function TrendPanel({
  title,
  thicknessData,
  powerData,
  gradPrefix,
}: {
  title: string
  thicknessData: ChartRow[]
  powerData: ChartRow[]
  gradPrefix: string
}) {
  return (
    <section style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
      {/* Panel header */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}
      >
        <span
          className="inline-flex size-1.5 rounded-full"
          style={{ backgroundColor: "var(--primary)" }}
        />
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-foreground">
          {title}
        </p>
        {/* Node legend */}
        <div className="ml-auto flex flex-wrap gap-3">
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
            </span>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-px lg:grid-cols-2">
        <div className="px-2 py-2">
          <p className="px-2 pb-1 font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
            Wall Thickness · mm
          </p>
          <div className="h-44 w-full">
            <NodeChart
              data={thicknessData}
              unit="mm"
              domain={[0, 14]}
              tickFormatter={(v) => `${v}mm`}
              minLine={6}
              gradPrefix={`${gradPrefix}-wt`}
            />
          </div>
        </div>
        <div className="px-2 py-2">
          <p className="px-2 pb-1 font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
            Power Consumption · kW
          </p>
          <div className="h-44 w-full">
            <NodeChart
              data={powerData}
              unit="kW"
              domain={[0, 160]}
              tickFormatter={(v) => `${v}`}
              gradPrefix={`${gradPrefix}-pw`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export function DashboardV2View({
  onNavigateHome,
}: {
  onNavigateHome?: () => void
}) {
  const [splitTop, setSplitTop] = useState(50)
  const [dragging, setDragging] = useState(false)

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(true)
    const move = (ev: PointerEvent) => {
      const pct = (ev.clientY / window.innerHeight) * 100
      setSplitTop(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, pct)))
    }
    const up = () => {
      setDragging(false)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  const alertCount = sensorNodes.filter(
    (n) => n.status !== "offline" && n.thickness <= n.minThicknessTarget * 1.2,
  ).length

  return (
    <div className="relative flex h-full w-full flex-col">

      {/* ═══════════════════════════════════
          Schematic — pinned on top, resizable height, stays interactive
      ═══════════════════════════════════ */}
      <div
        className={`relative min-h-0 shrink-0 overflow-hidden ${
          dragging ? "" : "transition-[height] duration-200 ease-out"
        }`}
        style={{ height: `${splitTop}vh` }}
      >
        <FactoryCanvas />
      </div>

      {/* ═══════════════════════════════════
          Divider — draggable splitter (top schematic ↕ bottom trends)
      ═══════════════════════════════════ */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize schematic and trend panels"
        onPointerDown={startDrag}
        className="group flex shrink-0 cursor-row-resize touch-none select-none items-center justify-center"
        style={{
          height: 14,
          borderTop: "2px solid var(--primary)",
          ...BAR_BG,
        }}
      >
        {/* Grab handle — stacked pill bars */}
        <div className="flex flex-col items-center gap-[3px]">
          <span
            className="block rounded-full transition-colors"
            style={{
              width: 34,
              height: 2,
              background: dragging ? "var(--primary)" : "oklch(1 0 0 / 28%)",
            }}
          />
          <span
            className="block rounded-full transition-colors"
            style={{
              width: 34,
              height: 2,
              background: dragging ? "var(--primary)" : "oklch(1 0 0 / 28%)",
            }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════
          Trend container — permanently visible, scrollable
      ═══════════════════════════════════ */}
      <div
        className="kiosk-trend-scroll min-h-0 flex-1 overflow-y-auto"
        style={BAR_BG}
      >
        <TrendPanel
          title="Real-Time 12-Month Visuals"
          thicknessData={perNodeThicknessTrend}
          powerData={perNodePowerConsumption}
          gradPrefix="rt"
        />
        <TrendPanel
          title="Historical 12-Month Visuals"
          thicknessData={perNodeThicknessTrendHistorical}
          powerData={perNodePowerConsumptionHistorical}
          gradPrefix="hist"
        />
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
      </div>
    </div>
  )
}
