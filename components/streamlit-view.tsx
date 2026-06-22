"use client"

import { Card } from "@/components/ui/card"
import {
  CheckCircle2,
  Clock,
  Cpu,
  ExternalLink,
  Play,
  RefreshCw,
} from "lucide-react"

const STREAMLIT_URL = "http://localhost:8501"

const TRAINING_RUNS = [
  { id: "run-0482", model: "corr-xgb-v3", status: "completed", duration: "4m 12s", rmse: 0.21, timestamp: "2026-06-08 09:30" },
  { id: "run-0481", model: "corr-lstm-v2", status: "completed", duration: "7m 45s", rmse: 0.23, timestamp: "2026-06-08 03:15" },
  { id: "run-0480", model: "corr-xgb-v3", status: "completed", duration: "4m 08s", rmse: 0.24, timestamp: "2026-06-07 21:00" },
  { id: "run-0479", model: "corr-lstm-v2", status: "completed", duration: "8m 01s", rmse: 0.26, timestamp: "2026-06-07 15:45" },
  { id: "run-0478", model: "corr-xgb-v3", status: "failed", duration: "1m 03s", rmse: null, timestamp: "2026-06-07 09:12" },
]

const MODEL_REGISTRY = [
  { id: "corr-xgb-v3", version: "v3.4.1", status: "production", rmse: 0.21, nodes: 5 },
  { id: "corr-lstm-v2", version: "v2.8.0", status: "production", rmse: 0.23, nodes: 2 },
  { id: "corr-xgb-v4", version: "v4.0.0-rc", status: "staging", rmse: 0.19, nodes: 0 },
]

export function StreamlitView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Connection banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
            <Cpu className="size-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">ML Studio — Streamlit</p>
            <p className="text-xs text-muted-foreground font-mono">{STREAMLIT_URL}</p>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--status-normal)] opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--status-normal)]" />
            </span>
            <span className="text-xs font-medium text-[var(--status-normal)]">Online</span>
          </div>
        </div>
        <a
          href={STREAMLIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 w-fit"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Open App
        </a>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Training run history */}
        <Card className="overflow-hidden p-0 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Training Runs</h2>
              <p className="text-xs text-muted-foreground">Recent model training history</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RefreshCw className="size-3" />
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Run ID</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">RMSE</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {TRAINING_RUNS.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-border/60 transition-colors hover:bg-secondary/40"
                  >
                    <td className="px-5 py-3 font-mono text-foreground">{run.id}</td>
                    <td className="px-5 py-3 font-mono text-foreground">{run.model}</td>
                    <td className="px-5 py-3">
                      <span
                        className="flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor:
                            run.status === "completed"
                              ? "color-mix(in oklch, var(--status-normal) 15%, transparent)"
                              : "color-mix(in oklch, var(--status-error) 15%, transparent)",
                          color:
                            run.status === "completed"
                              ? "var(--status-normal)"
                              : "var(--status-error)",
                        }}
                      >
                        {run.status === "completed" ? (
                          <CheckCircle2 className="size-3" aria-hidden="true" />
                        ) : (
                          <Clock className="size-3" aria-hidden="true" />
                        )}
                        {run.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono tabular-nums text-foreground">
                      {run.rmse !== null ? run.rmse.toFixed(2) : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{run.duration}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{run.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-5 py-3">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Play className="size-3" aria-hidden="true" />
              Trigger Training Run
            </button>
          </div>
        </Card>

        {/* Model registry */}
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Model Registry</h2>
          <div className="flex flex-col gap-3">
            {MODEL_REGISTRY.map((m) => (
              <div key={m.id} className="rounded-md border border-border bg-muted/20 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs font-semibold text-foreground">{m.id}</p>
                    <p className="text-[10px] text-muted-foreground">{m.version}</p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider"
                    style={{
                      backgroundColor:
                        m.status === "production"
                          ? "color-mix(in oklch, var(--status-normal) 15%, transparent)"
                          : "color-mix(in oklch, var(--status-warning) 15%, transparent)",
                      color:
                        m.status === "production"
                          ? "var(--status-normal)"
                          : "var(--status-warning)",
                    }}
                  >
                    {m.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                  <div>
                    <span className="text-muted-foreground">RMSE </span>
                    <span className="font-mono font-medium text-foreground">{m.rmse}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nodes </span>
                    <span className="font-mono font-medium text-foreground">{m.nodes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Streamlit app mockup embed */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[var(--status-error)]/70" />
              <span className="size-2.5 rounded-full bg-[var(--status-warning)]/70" />
              <span className="size-2.5 rounded-full bg-[var(--status-normal)]/70" />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{STREAMLIT_URL}</span>
          </div>
          <a
            href={STREAMLIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="size-3" />
            Open
          </a>
        </div>

        {/* Mock Streamlit interface */}
        <div className="flex min-h-[420px] bg-[oklch(0.18_0.005_240)]">
          {/* Streamlit sidebar */}
          <div className="w-56 shrink-0 border-r border-border/50 bg-[oklch(0.21_0.006_240)] p-4">
            <div className="mb-4 flex items-center gap-2">
              <div
                className="size-6 rounded"
                style={{ background: "linear-gradient(135deg, #dc2626, #e23a3a)" }}
              />
              <span className="text-xs font-bold text-foreground">PipeGuard ML</span>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wider">Model</p>
                <div className="rounded border border-border bg-muted/30 px-2 py-1.5 text-xs text-foreground">
                  corr-xgb-v3 ▾
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wider">Node</p>
                <div className="rounded border border-border bg-muted/30 px-2 py-1.5 text-xs text-foreground">
                  PN-03 — Reactor ▾
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wider">Horizon (months)</p>
                <div className="relative h-1.5 rounded-full bg-muted mt-2">
                  <div className="h-full w-2/3 rounded-full bg-primary" />
                  <div className="absolute top-1/2 left-2/3 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background" />
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
                  <span>6</span><span>24</span><span>48</span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wider">Features</p>
                {["Temperature", "Pressure", "Flow rate", "pH"].map((f) => (
                  <label key={f} className="flex items-center gap-1.5 py-0.5 text-[10px] text-foreground cursor-pointer">
                    <span className="size-3 rounded-sm border border-primary bg-primary/80 flex items-center justify-center text-[8px] text-primary-foreground">✓</span>
                    {f}
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: "#dc2626" }}
              >
                ▶ Run Prediction
              </button>
            </div>
          </div>

          {/* Streamlit main content */}
          <div className="flex-1 overflow-auto p-5">
            <h3 className="mb-1 text-base font-bold text-foreground">
              Corrosion Thickness Forecast
            </h3>
            <p className="mb-5 text-xs text-muted-foreground">
              Node PN-03 · corr-xgb-v3 · 24-month horizon
            </p>

            {/* Metric row */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              {[
                { label: "Current Thickness", value: "5.1 mm", sub: "hard sensor", color: "var(--chart-2)" },
                { label: "Predicted @ 24mo", value: "3.4 mm", sub: "below critical", color: "var(--status-error)" },
                { label: "Model RMSE", value: "0.21", sub: "within target", color: "var(--chart-1)" },
              ].map((m) => (
                <div key={m.label} className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-[9px] text-muted-foreground">{m.label}</p>
                  <p className="font-mono text-lg font-bold tabular-nums" style={{ color: m.color }}>
                    {m.value}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Mock chart area */}
            <div className="rounded-md border border-border bg-muted/20 p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Wall Thickness Projection (mm)
              </p>
              <div className="relative h-36">
                <svg viewBox="0 0 400 120" className="h-full w-full" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[20, 40, 60, 80, 100].map((y) => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="var(--border)" strokeWidth="0.5" />
                  ))}
                  {/* Min reference line at ~60% */}
                  <line x1="0" y1="72" x2="400" y2="72" stroke="var(--status-warning)" strokeWidth="1" strokeDasharray="6 3" />
                  {/* Critical line at ~85% */}
                  <line x1="0" y1="102" x2="400" y2="102" stroke="var(--status-error)" strokeWidth="1" strokeDasharray="4 3" />
                  {/* Decay curve */}
                  <path
                    d="M 0 30 C 80 35, 160 50, 240 72 S 360 100 400 108"
                    fill="none"
                    stroke="var(--chart-1)"
                    strokeWidth="2"
                  />
                  {/* Fill under curve */}
                  <path
                    d="M 0 30 C 80 35, 160 50, 240 72 S 360 100 400 108 L 400 120 L 0 120 Z"
                    fill="var(--chart-1)"
                    fillOpacity="0.08"
                  />
                </svg>
                <div className="absolute right-2 top-2 flex flex-col gap-1 text-[9px]">
                  <span className="flex items-center gap-1 text-[var(--status-warning)]">
                    <span className="inline-block h-px w-3 border-t border-dashed border-current" /> min 6mm
                  </span>
                  <span className="flex items-center gap-1 text-[var(--status-error)]">
                    <span className="inline-block h-px w-3 border-t border-dashed border-current" /> critical 4mm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
