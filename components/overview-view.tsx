"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { AlertBanner } from "@/components/alert-banner"
import { FactoryCanvas } from "@/components/factory-canvas"
import {
  STATUS_META,
  fleetSummary,
  perNodeThicknessTrend,
  sensorNodes,
  statusCounts,
  type Status,
} from "@/lib/mock-data"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Activity, AlertTriangle, Gauge, ShieldCheck } from "lucide-react"

const NODE_CHART_COLORS: Record<string, string> = {
  "PN-01": "var(--chart-1)",
  "PN-02": "var(--chart-3)",
  "PN-03": "var(--chart-4)",
  "PN-04": "var(--chart-2)",
  "PN-05": "var(--chart-5)",
}

const TRACKABLE_NODES = sensorNodes.filter((n) => n.status !== "offline")

function StatusSummaryCard({
  status,
  count,
}: {
  status: Status
  count: number
}) {
  const meta = STATUS_META[status]
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {meta.label}
        </span>
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: meta.token }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span
          className="text-3xl font-semibold tabular-nums"
          style={{ color: meta.token }}
        >
          {count}
        </span>
        <span className="pb-1 text-xs text-muted-foreground">
          {count === 1 ? "model" : "models"}
        </span>
      </div>
    </Card>
  )
}

function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
}: {
  label: string
  value: string
  unit?: string
  icon: typeof Activity
}) {
  return (
    <Card className="flex-row items-center gap-4 p-4">
      <div className="flex size-10 items-center justify-center rounded-md border border-border bg-secondary text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">
          {value}
          {unit ? (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </p>
      </div>
    </Card>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground capitalize">{p.name}</span>
          <span className="ml-auto font-medium tabular-nums text-popover-foreground">
            {p.value} mm
          </span>
        </div>
      ))}
    </div>
  )
}

export function OverviewView() {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(
    () => new Set(["PN-02", "PN-03", "PN-05"]),
  )

  function toggleNode(id: string) {
    setSelectedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const activeNodes = TRACKABLE_NODES.filter((n) => selectedNodes.has(n.id))

  return (
    <div className="flex flex-col gap-6">
      {/* Threshold alerts */}
      <AlertBanner nodes={sensorNodes} />

      {/* Status summary cards */}
      <section aria-label="Status summary">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statusCounts.map((s) => (
            <StatusSummaryCard
              key={s.status}
              status={s.status}
              count={s.count}
            />
          ))}
        </div>
      </section>

      {/* Fleet KPIs */}
      <section aria-label="Fleet metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Models online"
            value={`${fleetSummary.modelsOnline}/${fleetSummary.totalModels}`}
            icon={Activity}
          />
          <KpiCard
            label="Avg degradation rate"
            value={fleetSummary.avgDegradationRate.toFixed(2)}
            unit="mm/yr"
            icon={Gauge}
          />
          <KpiCard
            label="Critical assets"
            value={String(fleetSummary.criticalAssets)}
            icon={AlertTriangle}
          />
          <KpiCard
            label="Mean confidence"
            value={`${Math.round(fleetSummary.meanConfidence * 100)}%`}
            icon={ShieldCheck}
          />
        </div>
      </section>

      {/* 2.5D Factory Floor */}
      <section aria-label="Factory floor map">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Factory Floor — 2.5D Pipe Network
            </h2>
            <p className="text-xs text-muted-foreground">
              Live monitoring nodes overlaid on factory layout. Use Build Mode to insert, edit, or remove nodes.
            </p>
          </div>
        </div>
        <div style={{ height: 480 }}>
          <FactoryCanvas />
        </div>
      </section>

      {/* Charts + monitoring list */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Wall thickness trend
                </h2>
                <p className="text-xs text-muted-foreground">
                  Trailing 12 months — select monitoring points to compare
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedNodes(new Set(TRACKABLE_NODES.map((n) => n.id)))
                  }
                  className="rounded px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNodes(new Set())}
                  className="rounded px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            </div>
            {/* Node toggle chips */}
            <div className="flex flex-wrap gap-1.5">
              {TRACKABLE_NODES.map((node) => {
                const active = selectedNodes.has(node.id)
                const color = NODE_CHART_COLORS[node.id]
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => toggleNode(node.id)}
                    className="flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-medium transition-all"
                    style={{
                      borderColor: active ? color : "transparent",
                      backgroundColor: active
                        ? `color-mix(in oklch, ${color} 12%, transparent)`
                        : "color-mix(in oklch, var(--muted) 40%, transparent)",
                      color: active ? color : "var(--muted-foreground)",
                      opacity: active ? 1 : 0.6,
                    }}
                    aria-pressed={active}
                    title={node.location}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: color, opacity: active ? 1 : 0.4 }}
                    />
                    <span className="font-mono">{node.id}</span>
                    <span className="hidden truncate max-w-[80px] sm:inline">
                      &nbsp;·&nbsp;{node.location.split(" ")[0]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={perNodeThicknessTrend}
                margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  {TRACKABLE_NODES.map((node) => {
                    const c = NODE_CHART_COLORS[node.id]
                    return (
                      <linearGradient
                        key={node.id}
                        id={`grad-${node.id}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={c} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    )
                  })}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                />
                <YAxis
                  domain={[0, 14]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                {activeNodes.map((node) => (
                  <Area
                    key={node.id}
                    type="monotone"
                    dataKey={node.id}
                    name={node.location}
                    stroke={NODE_CHART_COLORS[node.id]}
                    fill={`url(#grad-${node.id})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {activeNodes.length === 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Select at least one monitoring point above to display trend data.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Monitoring points
          </h2>
          <ul className="flex flex-col divide-y divide-border">
            {sensorNodes.map((node) => {
              const alertLevel =
                node.status !== "offline" && node.thickness <= node.minThicknessTarget
                  ? "critical"
                  : node.status !== "offline" && node.thickness <= node.minThicknessTarget * 1.2
                    ? "warning"
                    : null
              return (
                <li
                  key={node.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {node.location}
                      </p>
                      {alertLevel && (
                        <AlertTriangle
                          className="size-3 shrink-0"
                          style={{
                            color:
                              alertLevel === "critical"
                                ? "var(--status-error)"
                                : "var(--status-warning)",
                          }}
                          aria-label={`${alertLevel} thickness alert`}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {node.id} · {node.thickness.toFixed(1)}mm&nbsp;
                      <span className="text-muted-foreground/60">
                        (min {node.minThicknessTarget.toFixed(1)}mm)
                      </span>
                      &nbsp;· {node.degradationRate.toFixed(2)}&nbsp;mm/yr
                    </p>
                  </div>
                  <StatusBadge status={node.status} />
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

    </div>
  )
}
