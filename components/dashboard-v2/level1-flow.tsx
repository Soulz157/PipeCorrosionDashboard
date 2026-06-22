"use client";

// Level 1 — interactive isometric factory flow.
// System-wide pipe network projected onto a 2:1 iso plane; each asset is an
// extruded status pillar. Click a pillar to drill into its model portal (L2).

import { useMemo, useState } from "react";
import {
  STATUS_META,
  type SensorNode,
  type Status,
  fleetSummary,
  pipeConnections,
  sensorNodes,
  statusCounts,
} from "@/lib/mock-data";
import { ISO, depthKey, diamond, pillarFaces, projectIso } from "./iso";

const STATUS_RANK: Record<Status, number> = {
  offline: 0,
  normal: 1,
  warning: 2,
  error: 3,
};

const PILLAR_HEIGHT: Record<Status, number> = {
  error: 104,
  warning: 70,
  normal: 46,
  offline: 24,
};

const points = new Map<string, { x: number; y: number }>(
  sensorNodes.map((n) => [n.id, projectIso(n.position2d[0], n.position2d[1])]),
);

// Plane corners + iso grid for the blueprint ground.
const GRID = [0, 25, 50, 75, 100];
const planeCorners = [
  projectIso(0, 0),
  projectIso(100, 0),
  projectIso(100, 100),
  projectIso(0, 100),
]
  .map((p) => `${p.x},${p.y}`)
  .join(" ");

export function Level1Flow({
  onSelectNode,
}: {
  onSelectNode: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const ordered = useMemo(
    () =>
      [...sensorNodes].sort(
        (a, b) =>
          depthKey(a.position2d[0], a.position2d[1]) -
          depthKey(b.position2d[0], b.position2d[1]),
      ),
    [],
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Atmospheric backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 8%, var(--kiosk-surface), transparent 60%), radial-gradient(100% 80% at 50% 110%, var(--kiosk-surface), transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,var(--kiosk-grid) 2px,var(--kiosk-grid) 4px)",
        }}
      />

      {/* ── KPI strip ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-3 p-4 md:p-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">
            Level 01 · System Flow
          </p>
          <h2 className="mt-1 font-mono text-lg font-bold tracking-tight text-foreground">
            Plant Pipe Network
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Click an asset to inspect its models
          </p>
        </div>

        <div className="flex flex-wrap items-stretch gap-2">
          <Kpi
            label="Models online"
            value={`${fleetSummary.modelsOnline}/${fleetSummary.totalModels}`}
          />
          <Kpi
            label="Avg rate"
            value={`${fleetSummary.avgDegradationRate.toFixed(2)}`}
            unit="mm/yr"
          />
          <Kpi
            label="Critical"
            value={`${fleetSummary.criticalAssets}`}
            accent="var(--status-error)"
          />
          <Kpi
            label="Mean conf."
            value={`${Math.round(fleetSummary.meanConfidence * 100)}%`}
          />
        </div>
      </div>

      {/* Status legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex flex-wrap gap-3">
        {statusCounts.map(({ status, count }) => {
          const meta = STATUS_META[status];
          return (
            <span
              key={status}
              className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider"
              style={{ color: count > 0 ? meta.token : "var(--muted-foreground)" }}
            >
              <span
                className="size-2 rounded-[2px]"
                style={{
                  backgroundColor: meta.token,
                  boxShadow: count > 0 ? `0 0 6px ${meta.token}` : undefined,
                  opacity: count > 0 ? 1 : 0.4,
                }}
              />
              {meta.label} · {count}
            </span>
          );
        })}
      </div>

      {/* ── Isometric scene ───────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${ISO.viewW} ${ISO.viewH}`}
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10 h-full w-full"
        role="group"
        aria-label="Isometric factory flow"
      >
        <defs>
          <filter id="l1-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="l1-plane" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="var(--kiosk-line)" />
            <stop offset="100%" stopColor="var(--kiosk-surface)" />
          </radialGradient>
        </defs>

        {/* Ground plane + grid */}
        <polygon
          points={planeCorners}
          fill="url(#l1-plane)"
          stroke="var(--kiosk-hairline)"
          strokeWidth={1}
        />
        {GRID.map((g) => {
          const a = projectIso(g, 0);
          const b = projectIso(g, 100);
          const c = projectIso(0, g);
          const d = projectIso(100, g);
          return (
            <g key={g} stroke="var(--kiosk-hairline-soft)" strokeWidth={1}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} />
            </g>
          );
        })}

        {/* Pipes */}
        {pipeConnections.map((conn) => {
          const from = sensorNodes.find((n) => n.id === conn.from);
          const to = sensorNodes.find((n) => n.id === conn.to);
          if (!from || !to) return null;
          const a = points.get(from.id)!;
          const b = points.get(to.id)!;
          const worst =
            STATUS_RANK[from.status] >= STATUS_RANK[to.status]
              ? from.status
              : to.status;
          const token = STATUS_META[worst].token;
          const dashed = from.status === "offline" || to.status === "offline";
          return (
            <g key={`${conn.from}-${conn.to}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={token}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={dashed ? 0.12 : 0.18}
                filter="url(#l1-glow)"
              />
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={token}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={dashed ? "6 6" : undefined}
                opacity={dashed ? 0.5 : 0.95}
              />
            </g>
          );
        })}

        {/* Pillars (painter's order, back to front) */}
        {ordered.map((node) => (
          <Pillar
            key={node.id}
            node={node}
            base={points.get(node.id)!}
            hovered={hovered === node.id}
            dimmed={hovered !== null && hovered !== node.id}
            onHover={() => setHovered(node.id)}
            onLeave={() => setHovered((h) => (h === node.id ? null : h))}
            onSelect={() => onSelectNode(node.id)}
          />
        ))}
      </svg>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-[3px] border px-3 py-1.5"
      style={{
        borderColor: "var(--kiosk-hairline)",
        background: "var(--kiosk-bg)",
        backdropFilter: "blur(10px)",
      }}
    >
      <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p
        className="font-mono text-sm font-bold tabular-nums leading-tight"
        style={{ color: accent ?? "var(--foreground)" }}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[9px] font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

function Pillar({
  node,
  base,
  hovered,
  dimmed,
  onHover,
  onLeave,
  onSelect,
}: {
  node: SensorNode;
  base: { x: number; y: number };
  hovered: boolean;
  dimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const meta = STATUS_META[node.status];
  const token = meta.token;
  const height = PILLAR_HEIGHT[node.status];
  const offline = node.status === "offline";
  const isError = node.status === "error";
  const faces = pillarFaces(base, height);

  return (
    <g
      transform={hovered ? "translate(0 -8)" : undefined}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      style={{
        cursor: "pointer",
        transition: "transform 140ms ease-out",
        opacity: dimmed ? 0.45 : 1,
      }}
    >
      {/* Footprint shadow */}
      <polygon
        points={diamond({ x: base.x, y: base.y + 4 }, ISO.tileW + 8, ISO.tileH + 4)}
        fill="var(--kiosk-scrim)"
      />
      {/* Base tile */}
      <polygon
        points={diamond(base)}
        fill="var(--kiosk-surface)"
        stroke={token}
        strokeWidth={1}
        opacity={offline ? 0.5 : 0.9}
      />
      {/* Column faces */}
      <polygon
        points={faces.left}
        fill={`color-mix(in oklch, ${token} 32%, var(--kiosk-bg))`}
        stroke={`color-mix(in oklch, ${token} 55%, transparent)`}
        strokeWidth={0.75}
        opacity={offline ? 0.5 : 1}
      />
      <polygon
        points={faces.right}
        fill={`color-mix(in oklch, ${token} 55%, var(--kiosk-bg))`}
        stroke={`color-mix(in oklch, ${token} 70%, transparent)`}
        strokeWidth={0.75}
        opacity={offline ? 0.5 : 1}
      />
      {/* Glow cap */}
      <polygon
        points={faces.cap}
        fill={token}
        opacity={offline ? 0.45 : 0.95}
        strokeDasharray={offline ? "4 3" : undefined}
        stroke={offline ? token : undefined}
        filter={offline ? undefined : "url(#l1-glow)"}
      />
      {/* Status orb on the cap */}
      <circle
        cx={base.x}
        cy={faces.topY}
        r={5}
        fill="white"
        opacity={offline ? 0.4 : 0.95}
      />
      {isError && (
        <circle cx={base.x} cy={faces.topY} r={5} fill="none" stroke={token} strokeWidth={2}>
          <animate
            attributeName="r"
            values="5;18;5"
            dur="1.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.9;0;0.9"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Node id label under the base */}
      <text
        x={base.x}
        y={base.y + ISO.tileH / 2 + 16}
        textAnchor="middle"
        className="font-mono"
        style={{
          fontSize: 11,
          fontWeight: 700,
          fill: hovered ? token : "var(--muted-foreground)",
          letterSpacing: "0.1em",
        }}
      >
        {node.id}
      </text>

      {/* Hover tooltip */}
      {hovered && <Tooltip node={node} cap={{ x: base.x, y: faces.topY }} />}
    </g>
  );
}

function Tooltip({
  node,
  cap,
}: {
  node: SensorNode;
  cap: { x: number; y: number };
}) {
  const meta = STATUS_META[node.status];
  const w = 188;
  const h = 92;
  // Keep the card inside the viewBox horizontally.
  const x = Math.min(Math.max(cap.x - w / 2, 8), ISO.viewW - w - 8);
  const y = Math.max(cap.y - h - 18, 8);
  const life =
    node.remainingLifeMonths > 0 ? `${node.remainingLifeMonths} mo` : "—";

  return (
    <g pointerEvents="none">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={3}
        fill="var(--kiosk-bg)"
        stroke={meta.token}
        strokeWidth={1}
      />
      <rect x={x} y={y} width={4} height={h} rx={1} fill={meta.token} />
      <text x={x + 14} y={y + 22} className="font-mono" style={{ fontSize: 12, fontWeight: 700, fill: "var(--foreground)" }}>
        {node.id} · {node.location}
      </text>
      <text x={x + 14} y={y + 40} className="font-mono" style={{ fontSize: 10, fill: meta.token, letterSpacing: "0.12em" }}>
        {meta.label.toUpperCase()}
      </text>
      <text x={x + 14} y={y + 60} className="font-mono" style={{ fontSize: 10, fill: "var(--muted-foreground)" }}>
        Wall thickness
      </text>
      <text x={x + w - 14} y={y + 60} textAnchor="end" className="font-mono" style={{ fontSize: 11, fontWeight: 700, fill: "var(--foreground)" }}>
        {node.thickness} mm
      </text>
      <text x={x + 14} y={y + 78} className="font-mono" style={{ fontSize: 10, fill: "var(--muted-foreground)" }}>
        Remaining life
      </text>
      <text x={x + w - 14} y={y + 78} textAnchor="end" className="font-mono" style={{ fontSize: 11, fontWeight: 700, fill: "var(--foreground)" }}>
        {life}
      </text>
    </g>
  );
}
