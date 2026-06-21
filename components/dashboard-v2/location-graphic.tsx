"use client";

// Level 3 · Component A — process-line location, P&ID style.
// Flat engineering schematic: tagged equipment symbols, process lines with flow
// arrows + valves, field instrument balloons, line numbers and a drawing frame.
// The selected asset is pinpointed by a pulsing red bounding box.

import {
  STATUS_META,
  type SensorNode,
  type Status,
  pipeConnections,
  sensorNodes,
} from "@/lib/mock-data";

type Kind = "manifold" | "exchanger" | "reactor" | "cooler" | "riser" | "drain";

type PidItem = {
  x: number;
  y: number;
  kind: Kind;
  equip: string;
  instr: string;
  line: string;
};

const RED = "var(--status-error)";
const LINE = "oklch(0.72 0.04 220)";

// Hand-laid P&ID coordinates (chain 01→02→03→04→05, branch 03→06).
const PID: Record<string, PidItem> = {
  "PN-01": { x: 100, y: 170, kind: "manifold", equip: "M-101", instr: "PI 101", line: '8"-P-1001' },
  "PN-02": { x: 280, y: 170, kind: "exchanger", equip: "E-102", instr: "TI 102", line: '8"-P-1002' },
  "PN-03": { x: 470, y: 170, kind: "reactor", equip: "R-103", instr: "FT 103", line: '8"-P-1003' },
  "PN-04": { x: 660, y: 170, kind: "cooler", equip: "C-104", instr: "TI 104", line: '8"-P-1004' },
  "PN-05": { x: 840, y: 80, kind: "riser", equip: "RV-105", instr: "PI 105", line: '6"-P-1005' },
  "PN-06": { x: 470, y: 300, kind: "drain", equip: "D-106", instr: "LT 106", line: '4"-D-1006' },
};

function pipePath(a: PidItem, b: PidItem): string {
  if (a.x === b.x || a.y === b.y) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  // Elbow: horizontal first, then vertical to the target.
  return `M ${a.x} ${a.y} L ${b.x} ${a.y} L ${b.x} ${b.y}`;
}

function flowArrow(a: PidItem, b: PidItem): { x: number; y: number; rot: number } {
  if (a.y === b.y) return { x: (a.x + b.x) / 2, y: a.y, rot: b.x > a.x ? 0 : 180 };
  if (a.x === b.x) return { x: a.x, y: (a.y + b.y) / 2, rot: b.y > a.y ? 90 : -90 };
  // Elbow → arrow on the vertical leg near the target.
  return { x: b.x, y: (a.y + b.y) / 2, rot: b.y > a.y ? 90 : -90 };
}

export function LocationGraphic({ node }: { node: SensorNode }) {
  return (
    <div
      className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[4px] border"
      style={{ borderColor: "oklch(1 0 0 / 10%)" }}
    >
      {/* Title strip */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 10%)", background: "oklch(0.13 0.006 240 / 90%)" }}
      >
        <span className="size-1.5 rounded-full" style={{ background: RED, boxShadow: `0 0 6px ${RED}` }} />
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-foreground">P&amp;ID</p>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">· {node.location}</span>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
          DWG PID-{node.id}
        </span>
      </div>

      {/* Schematic */}
      <div className="relative flex-1" style={{ background: "oklch(0.13 0.008 245)" }}>
        <svg
          viewBox="0 0 920 380"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          role="img"
          aria-label={`P&ID location of ${node.location}`}
        >
          <defs>
            <pattern id="pid-grid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M22 0H0V22" fill="none" stroke="oklch(0.6 0.05 220 / 9%)" strokeWidth="0.5" />
            </pattern>
            <filter id="pid-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* Drawing frame + grid */}
          <rect x="0" y="0" width="920" height="380" fill="url(#pid-grid)" />
          <rect x="12" y="12" width="896" height="356" fill="none" stroke="oklch(0.6 0.05 220 / 30%)" strokeWidth="1" />

          {/* Boundary stubs (process in / out / drain) */}
          <BoundaryStub x={40} y={170} dir="in" label="PROCESS IN" />
          <BoundaryStub x={880} y={80} dir="up" label="TO FLARE" />
          <BoundaryStub x={470} y={344} dir="down" label="TO DRAIN" />
          <line x1="40" y1="170" x2="100" y2="170" stroke={LINE} strokeWidth="2" />
          <line x1="840" y1="80" x2="880" y2="80" stroke={LINE} strokeWidth="2" />
          <line x1="470" y1="300" x2="470" y2="344" stroke={LINE} strokeWidth="2" />

          {/* Process lines */}
          {pipeConnections.map((c) => {
            const a = PID[c.from];
            const b = PID[c.to];
            if (!a || !b) return null;
            const touchesSel = c.from === node.id || c.to === node.id;
            const arr = flowArrow(a, b);
            const horizontal = a.y === b.y;
            return (
              <g key={`${c.from}-${c.to}`} opacity={touchesSel ? 1 : 0.5}>
                <path d={pipePath(a, b)} fill="none" stroke={LINE} strokeWidth={touchesSel ? 2.5 : 2} />
                {/* line number on horizontal runs */}
                {horizontal && (
                  <text
                    x={(a.x + b.x) / 2}
                    y={a.y - 9}
                    textAnchor="middle"
                    className="font-mono"
                    style={{ fontSize: 8, fill: "var(--muted-foreground)", letterSpacing: "0.05em" }}
                  >
                    {b.line}
                  </text>
                )}
                {/* gate valve at midpoint of horizontal runs */}
                {horizontal && <GateValve x={(a.x + b.x) / 2} y={a.y} />}
                {/* flow arrow */}
                <g transform={`translate(${arr.x} ${arr.y}) rotate(${arr.rot})`}>
                  <path d="M -5 -5 L 6 0 L -5 5 Z" fill={LINE} />
                </g>
              </g>
            );
          })}

          {/* Equipment nodes */}
          {sensorNodes.map((n) => {
            const item = PID[n.id];
            if (!item) return null;
            return <PidNode key={n.id} node={n} item={item} selected={n.id === node.id} />;
          })}
        </svg>
      </div>
    </div>
  );
}

function PidNode({
  node,
  item,
  selected,
}: {
  node: SensorNode;
  item: PidItem;
  selected: boolean;
}) {
  const token = STATUS_META[node.status].token;
  const offline = node.status === "offline";
  const { x, y } = item;
  const dim = selected ? 1 : 0.5;

  // Bounding box around the whole tagged item.
  const boxX = x - 48;
  const boxY = y - 78;
  const boxW = 96;
  const boxH = 152;

  return (
    <g opacity={dim}>
      {/* Instrument balloon (field-mounted) */}
      <g>
        <line x1={x} y1={y - 30} x2={x} y2={y - 44} stroke={LINE} strokeWidth="1" />
        <circle cx={x} cy={y - 60} r="16" fill="oklch(0.16 0.008 245)" stroke={LINE} strokeWidth="1.25" />
        <line x1={x - 16} y1={y - 60} x2={x + 16} y2={y - 60} stroke={LINE} strokeWidth="1" />
        <text x={x} y={y - 63} textAnchor="middle" className="font-mono" style={{ fontSize: 8, fontWeight: 700, fill: "var(--foreground)" }}>
          {item.instr.split(" ")[0]}
        </text>
        <text x={x} y={y - 51} textAnchor="middle" className="font-mono" style={{ fontSize: 8, fill: "var(--muted-foreground)" }}>
          {item.instr.split(" ")[1]}
        </text>
      </g>

      {/* Equipment symbol */}
      <EquipmentSymbol kind={item.kind} x={x} y={y} token={token} offline={offline} />

      {/* Status dot */}
      <circle cx={x + 26} cy={y - 22} r="4.5" fill={token} opacity={offline ? 0.5 : 1} filter={offline ? undefined : "url(#pid-glow)"} />
      <circle cx={x + 26} cy={y - 22} r="4.5" fill={token} opacity={offline ? 0.5 : 1} />

      {/* Tags */}
      <text x={x} y={y + 50} textAnchor="middle" className="font-mono" style={{ fontSize: 10, fontWeight: 700, fill: "var(--foreground)", letterSpacing: "0.08em" }}>
        {item.equip}
      </text>
      <text x={x} y={y + 62} textAnchor="middle" className="font-mono" style={{ fontSize: 8.5, fill: selected ? RED : "var(--muted-foreground)", letterSpacing: "0.1em" }}>
        {node.id}
      </text>

      {/* Selection bounding box */}
      {selected && (
        <g>
          <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={4} fill="none" stroke={RED} strokeWidth="6" opacity="0.16" filter="url(#pid-glow)" />
          <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={4} fill="none" stroke={RED} strokeWidth="1.75" strokeDasharray="8 5">
            <animate attributeName="stroke-dashoffset" values="0;-26" dur="1.1s" repeatCount="indefinite" />
          </rect>
          {[
            [boxX, boxY, 1, 1],
            [boxX + boxW, boxY, -1, 1],
            [boxX, boxY + boxH, 1, -1],
            [boxX + boxW, boxY + boxH, -1, -1],
          ].map(([px, py, sx, sy], i) => (
            <path key={i} d={`M ${px} ${(py as number) + (sy as number) * 12} L ${px} ${py} L ${(px as number) + (sx as number) * 12} ${py}`} fill="none" stroke={RED} strokeWidth="2.5" />
          ))}
          <rect x={x - 40} y={boxY - 18} width={80} height={16} rx={2} fill={RED} />
          <text x={x} y={boxY - 6} textAnchor="middle" className="font-mono" style={{ fontSize: 9, fontWeight: 700, fill: "white", letterSpacing: "0.15em" }}>
            SELECTED
          </text>
        </g>
      )}
    </g>
  );
}

function EquipmentSymbol({
  kind,
  x,
  y,
  token,
  offline,
}: {
  kind: Kind;
  x: number;
  y: number;
  token: string;
  offline: boolean;
}) {
  const stroke = token;
  const fill = "oklch(0.18 0.008 245)";
  const sw = 1.75;
  const op = offline ? 0.55 : 1;

  switch (kind) {
    case "manifold":
      return (
        <g opacity={op}>
          {/* Header bar with stubs */}
          <rect x={x - 8} y={y - 26} width={16} height={52} rx={3} fill={fill} stroke={stroke} strokeWidth={sw} />
          {[-16, 0, 16].map((dy) => (
            <line key={dy} x1={x + 8} y1={y + dy} x2={x + 22} y2={y + dy} stroke={stroke} strokeWidth="1.5" />
          ))}
        </g>
      );
    case "exchanger":
      return (
        <g opacity={op}>
          {/* Shell & tube */}
          <rect x={x - 30} y={y - 16} width={60} height={32} rx={16} fill={fill} stroke={stroke} strokeWidth={sw} />
          <path d={`M ${x - 24} ${y} L ${x - 12} ${y - 9} L ${x} ${y + 9} L ${x + 12} ${y - 9} L ${x + 24} ${y}`} fill="none" stroke={stroke} strokeWidth="1.25" opacity="0.8" />
          <line x1={x - 14} y1={y - 16} x2={x - 14} y2={y - 26} stroke={stroke} strokeWidth="1.5" />
          <line x1={x + 14} y1={y - 16} x2={x + 14} y2={y - 26} stroke={stroke} strokeWidth="1.5" />
        </g>
      );
    case "reactor":
      return (
        <g opacity={op}>
          {/* Vertical vessel */}
          <rect x={x - 18} y={y - 26} width={36} height={52} rx={18} fill={fill} stroke={stroke} strokeWidth={sw} />
          <line x1={x - 18} y1={y - 6} x2={x + 18} y2={y - 6} stroke={stroke} strokeWidth="1" opacity="0.5" />
          <line x1={x - 18} y1={y + 8} x2={x + 18} y2={y + 8} stroke={stroke} strokeWidth="1" opacity="0.5" />
        </g>
      );
    case "cooler":
      return (
        <g opacity={op}>
          {/* Cooler box with cross */}
          <rect x={x - 26} y={y - 18} width={52} height={36} rx={3} fill={fill} stroke={stroke} strokeWidth={sw} />
          <line x1={x - 26} y1={y - 18} x2={x + 26} y2={y + 18} stroke={stroke} strokeWidth="1.25" opacity="0.7" />
          <line x1={x + 26} y1={y - 18} x2={x - 26} y2={y + 18} stroke={stroke} strokeWidth="1.25" opacity="0.7" />
        </g>
      );
    case "riser":
      return (
        <g opacity={op}>
          {/* Vertical riser with up chevrons */}
          <rect x={x - 11} y={y - 26} width={22} height={52} rx={4} fill={fill} stroke={stroke} strokeWidth={sw} />
          {[6, -2, -10].map((dy) => (
            <path key={dy} d={`M ${x - 6} ${y + dy} L ${x} ${y + dy - 7} L ${x + 6} ${y + dy}`} fill="none" stroke={stroke} strokeWidth="1.5" />
          ))}
        </g>
      );
    case "drain":
      return (
        <g opacity={op}>
          {/* Funnel / drain */}
          <path d={`M ${x - 22} ${y - 16} L ${x + 22} ${y - 16} L ${x + 7} ${y + 12} L ${x - 7} ${y + 12} Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
          <line x1={x} y1={y + 12} x2={x} y2={y + 24} stroke={stroke} strokeWidth="2" />
        </g>
      );
  }
}

function GateValve({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M ${x - 8} ${y - 7} L ${x + 8} ${y + 7} L ${x + 8} ${y - 7} L ${x - 8} ${y + 7} Z`} fill="oklch(0.18 0.008 245)" stroke={LINE} strokeWidth="1.5" />
    </g>
  );
}

function BoundaryStub({
  x,
  y,
  dir,
  label,
}: {
  x: number;
  y: number;
  dir: "in" | "up" | "down";
  label: string;
}) {
  // Pennant flag marking an off-page connector.
  const flag =
    dir === "in"
      ? `M ${x} ${y - 12} L ${x + 26} ${y - 12} L ${x + 34} ${y} L ${x + 26} ${y + 12} L ${x} ${y + 12} Z`
      : dir === "up"
        ? `M ${x - 12} ${y} L ${x - 12} ${y - 26} L ${x} ${y - 34} L ${x + 12} ${y - 26} L ${x + 12} ${y} Z`
        : `M ${x - 12} ${y} L ${x - 12} ${y + 26} L ${x} ${y + 34} L ${x + 12} ${y + 26} L ${x + 12} ${y} Z`;
  const tx = dir === "in" ? x + 17 : x;
  const ty = dir === "in" ? y + 3 : dir === "up" ? y - 18 : y + 20;
  return (
    <g>
      <path d={flag} fill="oklch(0.16 0.008 245)" stroke={LINE} strokeWidth="1.25" />
      <text x={tx} y={ty} textAnchor="middle" className="font-mono" style={{ fontSize: 6.5, fontWeight: 700, fill: "var(--muted-foreground)", letterSpacing: "0.05em" }}>
        {label}
      </text>
    </g>
  );
}
