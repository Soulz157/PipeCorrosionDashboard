"use client";

// Level 3 · Component B — embedded Streamlit RUL forecasting mockup.
// Live forecasting engine: CR statistics, simulation parameters (turnaround +
// thickness limits), forecast thickness chart with 95% CI band, and a
// best/base/worst case summary. Styled like components/streamlit-view.tsx.

import { useMemo, useState } from "react";
import { type NodeModel, type SensorNode } from "@/lib/mock-data";
import {
  MAX_HORIZON,
  URGENCY_META,
  getUrgency,
  monthOffsetToLabel,
  monthsToThreshold,
} from "@/lib/forecast";
import { ExternalLink, Play } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STREAMLIT_URL = "http://localhost:8501";
const STREAMLIT_RED = "#ff4b4b";
const Z = 1.96; // 95% CI

export function StreamlitForecast({
  node,
  model,
  onOpenStreamlit,
}: {
  node: SensorNode;
  model: NodeModel;
  onOpenStreamlit?: () => void;
}) {
  const [cr, setCr] = useState(String(model.degradationRate || node.degradationRate));
  const [thk, setThk] = useState(String(node.thickness));
  const [minLimit, setMinLimit] = useState(String(node.minThicknessTarget));
  const [critLimit, setCritLimit] = useState("4.0");
  const [turnaround, setTurnaround] = useState("24");

  const CR = Number(cr) || 0;
  const t = Number(thk) || 0;
  const minL = Number(minLimit) || 0;
  const critL = Number(critLimit) || 0;
  const ta = Math.round(Number(turnaround) || 0);

  // Confidence-derived 95% band.
  const sigma = CR * (1 - model.confidence);
  const bestRate = Math.max(0, CR - Z * sigma); // slow corrosion → best
  const worstRate = CR + Z * sigma; // fast → worst
  const p95CR = worstRate;

  const rulBase = monthsToThreshold(t, CR, critL);
  const rulBest = monthsToThreshold(t, bestRate, critL);
  const rulWorst = monthsToThreshold(t, worstRate, critL);

  const horizon = useMemo(() => {
    const base = rulWorst ?? 36;
    return Math.min(Math.max(base + 6, 12), MAX_HORIZON);
  }, [rulWorst]);

  const data = useMemo(() => {
    const rows = [];
    for (let m = 0; m <= horizon; m++) {
      const base = Math.max(0, t - (CR / 12) * m);
      const upper = Math.max(0, t - (bestRate / 12) * m);
      const lower = Math.max(0, t - (worstRate / 12) * m);
      rows.push({ label: monthOffsetToLabel(m), base, ci: [lower, upper] as [number, number] });
    }
    return rows;
  }, [horizon, t, CR, bestRate, worstRate]);

  const taLabel = ta <= horizon ? monthOffsetToLabel(ta) : null;
  const thkAtTa = Math.max(0, t - (CR / 12) * ta);
  const survivesTa = thkAtTa > critL;

  const reset = () => {
    setCr(String(model.degradationRate || node.degradationRate));
    setThk(String(node.thickness));
    setMinLimit(String(node.minThicknessTarget));
    setCritLimit("4.0");
    setTurnaround("24");
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[4px] border"
      style={{ borderColor: "oklch(1 0 0 / 10%)" }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 10%)", background: "oklch(0.2 0.006 240)" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: "var(--status-error)", opacity: 0.7 }} />
            <span className="size-2.5 rounded-full" style={{ background: "var(--status-warning)", opacity: 0.7 }} />
            <span className="size-2.5 rounded-full" style={{ background: "var(--status-normal)", opacity: 0.7 }} />
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">{STREAMLIT_URL}</span>
        </div>
        <button
          type="button"
          onClick={() => (onOpenStreamlit ? onOpenStreamlit() : window.open(STREAMLIT_URL, "_blank", "noopener"))}
          className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ExternalLink className="size-3" /> Open
        </button>
      </div>

      {/* App body */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row" style={{ background: "oklch(0.17 0.005 240)" }}>
        {/* ── Sidebar — Simulation Parameters ────────────────── */}
        <aside
          className="shrink-0 p-4 lg:w-60"
          style={{ background: "oklch(0.21 0.006 240)", borderRight: "1px solid oklch(1 0 0 / 8%)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="size-6 rounded" style={{ background: `linear-gradient(135deg, ${STREAMLIT_RED}, #ff6b6b)` }} />
            <span className="font-mono text-xs font-bold text-foreground">PipeGuard RUL</span>
          </div>

          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Simulation Parameters
          </p>
          <div className="flex flex-col gap-2.5">
            <SInput label="Corrosion Rate · mm/yr" value={cr} step="0.01" onChange={setCr} />
            <SInput label="Current Thickness · mm" value={thk} step="0.1" onChange={setThk} />
            <SInput label="Min Limit · mm" value={minLimit} step="0.1" onChange={setMinLimit} />
            <SInput label="Critical Limit · mm" value={critLimit} step="0.1" onChange={setCritLimit} />
            <SInput label="Turnaround · months" value={turnaround} step="1" onChange={setTurnaround} />
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded py-1.5 font-mono text-[11px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: STREAMLIT_RED }}
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <Play className="size-3" /> Run Prediction
            </span>
          </button>

          {/* Turnaround survivability chip */}
          <div
            className="mt-3 rounded-[3px] border px-2.5 py-2"
            style={{
              borderColor: `color-mix(in oklch, ${survivesTa ? "var(--status-normal)" : "var(--status-error)"} 40%, transparent)`,
              background: `color-mix(in oklch, ${survivesTa ? "var(--status-normal)" : "var(--status-error)"} 10%, transparent)`,
            }}
          >
            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
              @ next turnaround ({ta}mo)
            </p>
            <p
              className="font-mono text-xs font-bold tabular-nums"
              style={{ color: survivesTa ? "var(--status-normal)" : "var(--status-error)" }}
            >
              {thkAtTa.toFixed(2)} mm · {survivesTa ? "SAFE" : "BREACH"}
            </p>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────── */}
        <div className="min-w-0 flex-1 overflow-auto p-4 lg:p-5">
          <h3 className="font-mono text-base font-bold tracking-tight text-foreground">
            RUL Forecasting Engine
          </h3>
          <p className="mb-4 font-mono text-[11px] text-muted-foreground">
            {node.id} · {model.modelId} · {horizon}-mo horizon · conf {Math.round(model.confidence * 100)}%
          </p>

          {/* CR Statistics */}
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            CR Statistics
          </p>
          <div className="mb-4 grid grid-cols-3 gap-2.5">
            <Stat label="Mean CR" value={CR.toFixed(3)} unit="mm/y" color="var(--chart-1)" />
            <Stat label="CR σ (1σ)" value={sigma.toFixed(3)} unit="mm/y" color="var(--chart-3)" />
            <Stat label="P95 CR" value={p95CR.toFixed(3)} unit="mm/y" color="var(--status-error)" />
          </div>

          {/* Forecast chart with 95% CI */}
          <div className="mb-4 rounded-[3px] border p-3" style={{ borderColor: "oklch(1 0 0 / 8%)", background: "oklch(0.15 0.006 240)" }}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[11px] font-medium text-muted-foreground">
                Forecast Thickness · 95% CI
              </p>
              <div className="flex gap-3 font-mono text-[8px] uppercase tracking-wider">
                <span className="flex items-center gap-1 text-[var(--chart-1)]">
                  <span className="h-px w-3 bg-current" /> base
                </span>
                <span className="flex items-center gap-1" style={{ color: "var(--primary)" }}>
                  <span className="h-2 w-3 rounded-sm" style={{ background: "color-mix(in oklch, var(--primary) 30%, transparent)" }} /> 95% CI
                </span>
              </div>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sf-ci" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="oklch(1 0 0 / 7%)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontFamily: "var(--font-mono)" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    domain={[0, "dataMax + 1"]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontFamily: "var(--font-mono)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ForecastTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="ci"
                    stroke="none"
                    fill="url(#sf-ci)"
                    isAnimationActive={false}
                    name="95% CI"
                  />
                  <Line
                    type="monotone"
                    dataKey="base"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name="base"
                  />
                  <ReferenceLine y={minL} stroke="var(--status-warning)" strokeDasharray="6 3" label={{ value: `min ${minL}`, position: "insideTopRight", fill: "var(--status-warning)", fontSize: 8 }} />
                  <ReferenceLine y={critL} stroke="var(--status-error)" strokeDasharray="4 4" label={{ value: `crit ${critL}`, position: "insideTopRight", fill: "var(--status-error)", fontSize: 8 }} />
                  {taLabel && (
                    <ReferenceLine x={taLabel} stroke="var(--primary)" strokeDasharray="3 3" label={{ value: "T/A", position: "insideTopLeft", fill: "var(--primary)", fontSize: 8 }} />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Best / Base / Worst summary */}
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Best / Base / Worst Case
          </p>
          <div className="overflow-hidden rounded-[3px] border" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
            <table className="w-full font-mono text-[11px]">
              <thead>
                <tr className="text-left text-muted-foreground" style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
                  <th className="px-3 py-2 font-medium">Case</th>
                  <th className="px-3 py-2 font-medium">CR</th>
                  <th className="px-3 py-2 font-medium">RUL</th>
                  <th className="px-3 py-2 font-medium">Breach</th>
                  <th className="px-3 py-2 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                <CaseRow label="Best" color="var(--status-normal)" rate={bestRate} rul={rulBest} t={t} minL={minL} critL={critL} />
                <CaseRow label="Base" color="var(--chart-1)" rate={CR} rul={rulBase} t={t} minL={minL} critL={critL} />
                <CaseRow label="Worst" color="var(--status-error)" rate={worstRate} rul={rulWorst} t={t} minL={minL} critL={critL} last />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseRow({
  label,
  color,
  rate,
  rul,
  t,
  minL,
  critL,
  last,
}: {
  label: string;
  color: string;
  rate: number;
  rul: number | null;
  t: number;
  minL: number;
  critL: number;
  last?: boolean;
}) {
  const urgency = getUrgency(monthsToThreshold(t, rate, minL), rul);
  const rulYears = rul === null ? "∞" : rul === 0 ? "0" : (rul / 12).toFixed(1);
  const breach = rul === null ? "—" : rul === 0 ? "now" : monthOffsetToLabel(rul);
  return (
    <tr style={last ? undefined : { borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
      <td className="px-3 py-2 font-bold" style={{ color }}>
        {label}
      </td>
      <td className="px-3 py-2 tabular-nums text-foreground">{rate.toFixed(3)}</td>
      <td className="px-3 py-2 tabular-nums text-foreground">
        {rulYears}
        {rul !== null && rul > 0 && <span className="ml-1 text-[9px] text-muted-foreground">yr</span>}
      </td>
      <td className="px-3 py-2 text-muted-foreground">{breach}</td>
      <td className="px-3 py-2">
        <span style={{ color: URGENCY_META[urgency].color }}>{URGENCY_META[urgency].label}</span>
      </td>
    </tr>
  );
}

function SInput({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: string;
  step: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <input
        type="number"
        step={step}
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border bg-[oklch(0.16_0.006_240)] px-2 py-1.5 font-mono text-xs font-bold tabular-nums text-foreground outline-none focus:border-[var(--primary)]"
        style={{ borderColor: "oklch(1 0 0 / 14%)" }}
      />
    </label>
  );
}

function Stat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="rounded-[3px] border p-2.5" style={{ borderColor: "oklch(1 0 0 / 8%)", background: "oklch(0.15 0.006 240)" }}>
      <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="font-mono text-base font-bold tabular-nums leading-tight" style={{ color }}>
        {value}
        <span className="ml-1 text-[8px] font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function ForecastTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const base = payload.find((p: any) => p.dataKey === "base")?.value;
  const ci = payload.find((p: any) => p.dataKey === "ci")?.value as [number, number] | undefined;
  return (
    <div className="border bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md" style={{ borderColor: "var(--border)", borderRadius: 2 }}>
      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      {base !== undefined && (
        <p className="font-mono text-[11px] font-bold tabular-nums" style={{ color: "var(--chart-1)" }}>
          {Number(base).toFixed(2)} mm
        </p>
      )}
      {ci && (
        <p className="font-mono text-[9px] tabular-nums text-muted-foreground">
          95% CI {Number(ci[0]).toFixed(2)}–{Number(ci[1]).toFixed(2)} mm
        </p>
      )}
    </div>
  );
}
