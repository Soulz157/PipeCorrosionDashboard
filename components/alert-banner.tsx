"use client"

import { useState } from "react"
import { AlertTriangle, Bell, ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { type SensorNode } from "@/lib/mock-data"

type AlertItem = {
  node: SensorNode
  level: "critical" | "warning"
}

function computeAlerts(nodes: SensorNode[]): AlertItem[] {
  return nodes
    .filter((n) => n.status !== "offline")
    .flatMap((n): AlertItem[] => {
      if (n.thickness <= n.minThicknessTarget) {
        return [{ node: n, level: "critical" as const }]
      }
      if (n.thickness <= n.minThicknessTarget * 1.2) {
        return [{ node: n, level: "warning" as const }]
      }
      return []
    })
    .sort((a, b) => (a.level === "critical" ? -1 : 1) - (b.level === "critical" ? -1 : 1))
}

export function useAlerts(nodes: SensorNode[]) {
  return computeAlerts(nodes)
}

export function AlertBanner({ nodes }: { nodes: SensorNode[] }) {
  const alerts = computeAlerts(nodes)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState(false)

  const visible = alerts.filter((a) => !dismissed.has(a.node.id))

  if (visible.length === 0) return null

  const criticals = visible.filter((a) => a.level === "critical")
  const warnings = visible.filter((a) => a.level === "warning")
  const hasCritical = criticals.length > 0
  const shown = expanded ? visible : visible.slice(0, 2)

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "rounded-lg border px-4 py-3",
        hasCritical
          ? "border-[var(--status-error)]/40 bg-[var(--status-error)]/8"
          : "border-[var(--status-warning)]/40 bg-[var(--status-warning)]/8",
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <Bell
          className="size-4 shrink-0"
          style={{ color: hasCritical ? "var(--status-error)" : "var(--status-warning)" }}
          aria-hidden="true"
        />
        <span
          className="text-sm font-semibold"
          style={{ color: hasCritical ? "var(--status-error)" : "var(--status-warning)" }}
        >
          {hasCritical ? "Critical thickness alert" : "Thickness warning"}&nbsp;—&nbsp;
          {criticals.length > 0 && (
            <span>{criticals.length} below minimum</span>
          )}
          {criticals.length > 0 && warnings.length > 0 && ", "}
          {warnings.length > 0 && (
            <span>{warnings.length} approaching minimum</span>
          )}
        </span>
        {visible.length > 2 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>Less <ChevronUp className="size-3" /></>
            ) : (
              <>+{visible.length - 2} more <ChevronDown className="size-3" /></>
            )}
          </button>
        )}
      </div>

      {/* Alert rows */}
      <ul className="mt-2 flex flex-col gap-1.5">
        {shown.map(({ node, level }) => (
          <li
            key={node.id}
            className="flex items-center gap-3 rounded-md border px-3 py-2 text-xs"
            style={{
              borderColor:
                level === "critical"
                  ? "color-mix(in oklch, var(--status-error) 25%, transparent)"
                  : "color-mix(in oklch, var(--status-warning) 25%, transparent)",
              backgroundColor:
                level === "critical"
                  ? "color-mix(in oklch, var(--status-error) 8%, transparent)"
                  : "color-mix(in oklch, var(--status-warning) 8%, transparent)",
            }}
          >
            <AlertTriangle
              className="size-3.5 shrink-0"
              style={{
                color: level === "critical" ? "var(--status-error)" : "var(--status-warning)",
              }}
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">{node.id}</span>
            <span className="text-muted-foreground">{node.location}</span>
            <span
              className="ml-auto tabular-nums font-semibold"
              style={{
                color: level === "critical" ? "var(--status-error)" : "var(--status-warning)",
              }}
            >
              {node.thickness.toFixed(1)}mm
              <span className="font-normal text-muted-foreground">
                &nbsp;/&nbsp;min {node.minThicknessTarget.toFixed(1)}mm
              </span>
            </span>
            <button
              type="button"
              aria-label={`Dismiss alert for ${node.id}`}
              onClick={() => setDismissed((s) => new Set([...s, node.id]))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
