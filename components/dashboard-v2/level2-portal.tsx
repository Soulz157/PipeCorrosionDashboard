"use client";

// Level 2 — model-specific selection portal.
// Clean card grid: each card = one ML model for the asset, with an asset mockup
// image, high-level predictive metrics, and a glowing alert / online badge.
// Detailed per-asset measurements are intentionally excluded to reduce clutter.

import {
  STATUS_META,
  type NodeModel,
  type SensorNode,
  type Status,
} from "@/lib/mock-data";
import { ChevronRight } from "lucide-react";

/** High-level alert label per status (Error → "Alert"). */
const ALERT_LABEL: Record<Status, string> = {
  normal: "Normal",
  warning: "Warning",
  error: "Alert",
  offline: "Offline",
};

export function Level2Portal({
  node,
  onSelectModel,
}: {
  node: SensorNode;
  onSelectModel: (modelId: string) => void;
}) {
  const meta = STATUS_META[node.status];
  const online = node.status !== "offline";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-6">
      {/* Minimal header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">
            Level 02 · Model Portal
          </p>
          <h2 className="mt-1 font-mono text-xl font-bold tracking-tight text-foreground">
            {node.location}
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {node.id} · {node.models.length} model
            {node.models.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge token={meta.token} label={ALERT_LABEL[node.status]} />
          <OnlinePill online={online} />
        </div>
      </header>

      {/* Model card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {node.models.map((model) => (
          <ModelCard
            key={model.modelId}
            model={model}
            location={node.location}
            status={node.status}
            online={online}
            primary={model.modelId === node.modelId}
            onSelect={() => onSelectModel(model.modelId)}
          />
        ))}
      </div>
    </div>
  );
}

function ModelCard({
  model,
  location,
  status,
  online,
  primary,
  onSelect,
}: {
  model: NodeModel;
  location: string;
  status: Status;
  online: boolean;
  primary: boolean;
  onSelect: () => void;
}) {
  const token = STATUS_META[status].token;
  const rulYears = model.remainingLifeMonths > 0
    ? (model.remainingLifeMonths / 12).toFixed(1)
    : "—";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col overflow-hidden rounded-[5px] border text-left transition-all duration-150 hover:-translate-y-1"
      style={{
        borderColor: primary
          ? "color-mix(in oklch, var(--primary) 50%, transparent)"
          : "oklch(1 0 0 / 10%)",
        background: "oklch(0.15 0.006 240 / 80%)",
      }}
    >
      {/* ── Asset mockup image ─────────────────────────────── */}
      <div
        className="relative flex h-32 items-center justify-center overflow-hidden border-b"
        style={{
          borderColor: "oklch(1 0 0 / 8%)",
          background:
            "radial-gradient(120% 100% at 30% 10%, oklch(0.21 0.02 235 / 70%), oklch(0.12 0.006 240) 75%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 4%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 4%) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <AssetMock token={token} offline={!online} location={location} />

        {/* Status badge + online dot over image */}
        <div className="absolute right-2.5 top-2.5">
          <StatusBadge token={token} label={ALERT_LABEL[status]} compact />
        </div>
        <span
          className="absolute left-2.5 top-2.5 flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.15em]"
          style={{ color: online ? "var(--status-normal)" : "var(--status-offline)" }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{
              background: online ? "var(--status-normal)" : "var(--status-offline)",
              boxShadow: online ? "0 0 6px var(--status-normal)" : undefined,
            }}
          />
          {online ? "Online" : "Offline"}
        </span>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-bold tracking-tight text-foreground">
            {model.modelId}
          </span>
          {primary && (
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.15em]"
              style={{
                background: "color-mix(in oklch, var(--primary) 18%, transparent)",
                color: "var(--primary)",
              }}
            >
              Primary
            </span>
          )}
        </div>

        {/* High-level predictive metrics only */}
        <div className="flex flex-col gap-2">
          <Metric label="Corrosion Rate" value={model.degradationRate.toFixed(2)} unit="mm/y" />
          <Metric label="Remaining Thickness" value={`${model.predictedThickness}`} unit="mm" />
          <Metric
            label="Remaining Useful Life"
            value={rulYears}
            unit={rulYears === "—" ? "" : "year"}
            emphasis
            color={token}
          />
        </div>

        <span className="mt-auto flex items-center gap-1 pt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--primary)] opacity-70 transition-opacity group-hover:opacity-100">
          Open deep-dive
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

function Metric({
  label,
  value,
  unit,
  emphasis,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  emphasis?: boolean;
  color?: string;
}) {
  return (
    <div
      className={
        emphasis
          ? "flex items-center justify-between gap-2 border-t pt-2"
          : "flex items-center justify-between gap-2"
      }
      style={emphasis ? { borderColor: "oklch(1 0 0 / 8%)" } : undefined}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-mono tabular-nums ${emphasis ? "text-xl font-bold" : "text-sm font-semibold"}`}
        style={{
          color: emphasis ? color ?? "var(--foreground)" : "var(--foreground)",
          textShadow: emphasis && color ? `0 0 12px ${color}` : undefined,
        }}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

function StatusBadge({
  token,
  label,
  compact,
}: {
  token: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border font-mono font-bold uppercase tracking-[0.15em] ${
        compact ? "px-2 py-0.5 text-[8px]" : "px-2.5 py-1 text-[10px]"
      }`}
      style={{
        borderColor: `color-mix(in oklch, ${token} 45%, transparent)`,
        background: `color-mix(in oklch, ${token} 14%, transparent)`,
        color: token,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: token, boxShadow: `0 0 6px ${token}` }}
      />
      {label}
    </span>
  );
}

function OnlinePill({ online }: { online: boolean }) {
  const color = online ? "var(--status-normal)" : "var(--status-offline)";
  return (
    <span
      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em]"
      style={{
        borderColor: `color-mix(in oklch, ${color} 45%, transparent)`,
        background: `color-mix(in oklch, ${color} 12%, transparent)`,
        color,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: color, boxShadow: online ? `0 0 6px ${color}` : undefined }}
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}

/** Stylized asset mockup — heat exchanger for exchanger loops, else a pipe. */
function AssetMock({
  token,
  offline,
  location,
}: {
  token: string;
  offline: boolean;
  location: string;
}) {
  const isExchanger = /exchang/i.test(location);
  return (
    <svg viewBox="0 0 240 110" className="relative h-[88px] w-auto" aria-hidden="true">
      <defs>
        <linearGradient id="mock-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.48 0.01 240)" />
          <stop offset="45%" stopColor="oklch(0.72 0.01 240)" />
          <stop offset="58%" stopColor="oklch(0.58 0.01 240)" />
          <stop offset="100%" stopColor="oklch(0.3 0.01 240)" />
        </linearGradient>
        <filter id="mock-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Ground glow */}
      <ellipse cx="120" cy="96" rx="92" ry="9" fill={token} opacity={offline ? 0.12 : 0.32} filter="url(#mock-glow)" />

      {isExchanger ? (
        <g>
          {/* Shell */}
          <rect x="40" y="34" width="160" height="46" rx="23" fill="url(#mock-steel)" stroke="oklch(0.2 0.01 240)" strokeWidth="1.5" />
          {/* Tube bundle */}
          {[42, 50, 58, 64].map((y) => (
            <line key={y} x1="52" y1={y} x2="188" y2={y} stroke="oklch(0.3 0.01 240)" strokeWidth="1" opacity="0.7" />
          ))}
          {/* Bonnets */}
          <rect x="28" y="40" width="14" height="34" rx="3" fill="oklch(0.4 0.01 240)" stroke={token} strokeWidth="1.5" />
          <rect x="198" y="40" width="14" height="34" rx="3" fill="oklch(0.4 0.01 240)" stroke={token} strokeWidth="1.5" />
          {/* Nozzles */}
          <rect x="74" y="20" width="10" height="16" fill="oklch(0.36 0.01 240)" stroke="oklch(0.2 0.01 240)" strokeWidth="1" />
          <rect x="156" y="20" width="10" height="16" fill="oklch(0.36 0.01 240)" stroke="oklch(0.2 0.01 240)" strokeWidth="1" />
        </g>
      ) : (
        <g>
          {/* Pipe body */}
          <rect x="36" y="44" width="168" height="34" fill="url(#mock-steel)" stroke="oklch(0.2 0.01 240)" strokeWidth="1.5" />
          {/* End caps */}
          <ellipse cx="36" cy="61" rx="10" ry="17" fill="oklch(0.26 0.01 240)" stroke={token} strokeWidth="1.5" />
          <ellipse cx="36" cy="61" rx="5" ry="11" fill="oklch(0.12 0.006 240)" />
          <ellipse cx="204" cy="61" rx="10" ry="17" fill="oklch(0.36 0.01 240)" stroke={token} strokeWidth="1.75" />
          <ellipse cx="204" cy="61" rx="5" ry="11" fill="oklch(0.1 0.006 240)" />
          {/* Flanges */}
          <rect x="92" y="40" width="6" height="42" fill="oklch(0.42 0.01 240)" stroke="oklch(0.2 0.01 240)" strokeWidth="1" />
          <rect x="146" y="40" width="6" height="42" fill="oklch(0.42 0.01 240)" stroke="oklch(0.2 0.01 240)" strokeWidth="1" />
          {/* Corrosion sheen toward worn end */}
          {!offline &&
            [0, 1, 2, 3].map((i) => (
              <circle key={i} cx={150 + i * 12} cy={52 + (i % 3) * 9} r={1.4 + (i % 2)} fill={token} opacity={0.55} />
            ))}
        </g>
      )}
    </svg>
  );
}
