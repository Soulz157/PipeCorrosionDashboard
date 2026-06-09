"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"
import { evaluationMetrics, logEntries, sensorNodes } from "@/lib/mock-data"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

function MetricTooltip({ active, payload, label }: any) {
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
          <span className="uppercase text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-medium tabular-nums text-popover-foreground">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function SensorComparisonTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-medium tabular-nums text-popover-foreground">
            {p.value} mm
          </span>
        </div>
      ))}
    </div>
  )
}

const ACTIVE_NODES = sensorNodes.filter((n) => n.status !== "offline")

export function LogsView() {
  const latest = evaluationMetrics[evaluationMetrics.length - 1]

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(ACTIVE_NODES.map((n) => n.id)),
  )

  function toggleNode(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const comparisonData = ACTIVE_NODES.filter((n) => selectedIds.has(n.id)).map((n) => ({
    id: n.id,
    hard: n.thickness,
    soft: n.predictedThickness,
    status: n.status,
  }))

  const tableNodes = sensorNodes.filter(
    (n) => selectedIds.has(n.id) || n.status === "offline",
  )
  return (
    <div className="flex flex-col gap-6">
      {/* Soft sensor vs. hard sensor comparison */}
      <Card className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Soft Sensor vs. Hard Sensor
            </h2>
            <p className="text-xs text-muted-foreground">
              Per-node predicted (model) vs. measured wall thickness (mm)
            </p>
          </div>
          <div className="flex gap-3 text-xs shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--chart-2)]" />
              <span className="text-muted-foreground">Hard sensor</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--chart-1)]" />
              <span className="text-muted-foreground">Soft sensor</span>
            </span>
          </div>
        </div>

        {/* Node filter chips */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground mr-1">Filter:</span>
          {ACTIVE_NODES.map((node) => {
            const active = selectedIds.has(node.id)
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => toggleNode(node.id)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-medium transition-all",
                  active
                    ? "border-border bg-secondary text-foreground"
                    : "border-transparent bg-muted/20 text-muted-foreground opacity-50",
                )}
              >
                <span className="font-mono">{node.id}</span>
                <span className="hidden sm:inline text-muted-foreground/70">
                  · {node.location.split(" ")[0]}
                </span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setSelectedIds(new Set(ACTIVE_NODES.map((n) => n.id)))}
            className="rounded px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ml-1"
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="rounded px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Clear
          </button>
        </div>

        <div className="h-52 w-full">
          {comparisonData.length === 0 && (
            <p className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Select at least one monitoring point above.
            </p>
          )}
          <ResponsiveContainer width="100%" height="100%" style={{ display: comparisonData.length === 0 ? "none" : undefined }}>
            <BarChart
              data={comparisonData}
              margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
              barCategoryGap="28%"
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="id"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 14]}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<SensorComparisonTooltip />} />
              <ReferenceLine
                y={6}
                stroke="var(--status-error)"
                strokeDasharray="4 4"
                label={{ value: "min", position: "insideTopRight", fill: "var(--status-error)", fontSize: 10 }}
              />
              <Bar dataKey="hard" name="Hard sensor" fill="var(--chart-2)" radius={[3, 3, 0, 0]}>
                {comparisonData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill="var(--chart-2)"
                    opacity={entry.status === "offline" ? 0.25 : 1}
                  />
                ))}
              </Bar>
              <Bar dataKey="soft" name="Soft sensor" fill="var(--chart-1)" radius={[3, 3, 0, 0]}>
                {comparisonData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill="var(--chart-1)"
                    opacity={entry.status === "offline" ? 0.25 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Node</th>
                <th className="pb-2 pr-4 font-medium">Location</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Hard (mm)</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Soft (mm)</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Residual</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tableNodes.map((node) => {
                const residual =
                  node.status !== "offline"
                    ? node.thickness - node.predictedThickness
                    : null
                const residualColor =
                  residual === null
                    ? "var(--muted-foreground)"
                    : residual < -0.5
                      ? "var(--status-error)"
                      : residual > 0.5
                        ? "var(--status-warning)"
                        : "var(--muted-foreground)"
                return (
                  <tr
                    key={node.id}
                    className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                  >
                    <td className="py-2.5 pr-4 font-mono font-medium text-foreground">{node.id}</td>
                    <td className="py-2.5 pr-4 text-foreground">{node.location}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-foreground">
                      {node.status !== "offline" ? node.thickness.toFixed(1) : "—"}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-foreground">
                      {node.status !== "offline" ? node.predictedThickness.toFixed(1) : "—"}
                    </td>
                    <td
                      className="py-2.5 pr-4 tabular-nums font-medium"
                      style={{ color: residualColor }}
                    >
                      {residual !== null
                        ? `${residual >= 0 ? "+" : ""}${residual.toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={node.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Model evaluation metrics
              </h2>
              <p className="text-xs text-muted-foreground">
                Prediction error over the trailing 12 months
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-1)]" />
                <span className="text-muted-foreground">RMSE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--chart-3)]" />
                <span className="text-muted-foreground">MAE</span>
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={evaluationMetrics}
                margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 0.5]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<MetricTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rmse"
                  name="rmse"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="mae"
                  name="mae"
                  stroke="var(--chart-3)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Current model health
          </h2>
          {[
            { l: "RMSE", v: latest.rmse, target: 0.3, unit: "mm" },
            { l: "MAE", v: latest.mae, target: 0.25, unit: "mm" },
          ].map((m) => {
            const ok = m.v <= m.target
            return (
              <div
                key={m.l}
                className="rounded-md border border-border bg-secondary/50 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{m.l}</span>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: ok
                        ? "var(--status-normal)"
                        : "var(--status-warning)",
                    }}
                  >
                    {ok ? "Within target" : "Above target"}
                  </span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
                  {m.v}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {m.unit}
                  </span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (m.v / 0.5) * 100)}%`,
                      backgroundColor: ok
                        ? "var(--status-normal)"
                        : "var(--status-warning)",
                    }}
                  />
                </div>
              </div>
            )
          })}
          <div className="rounded-md border border-border bg-secondary/50 p-3">
            <span className="text-xs text-muted-foreground">
              Inference latency (p95)
            </span>
            <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
              42
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ms
              </span>
            </p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Execution logs
          </h2>
          <p className="text-xs text-muted-foreground">
            Most recent model inference and training events
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Model ID</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {logEntries.map((log) => (
                <tr
                  key={log.id}
                  className={cn(
                    "border-b border-border/60 transition-colors hover:bg-secondary/40",
                    log.status === "error" &&
                      "bg-[color-mix(in_oklch,var(--status-error)_10%,transparent)] hover:bg-[color-mix(in_oklch,var(--status-error)_16%,transparent)]",
                  )}
                >
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted-foreground">
                    {log.timestamp}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-foreground">
                    {log.modelId}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-foreground">
                    {log.location}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
