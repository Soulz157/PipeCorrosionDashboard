"use client";

import { useCallback, useRef, useState } from "react";
import {
  Edit2,
  Layers,
  Pencil,
  Plus,
  Settings,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  pipeConnections,
  sensorNodes,
  STATUS_META,
  type PipeConnection,
  type SensorNode,
  type Status,
  type NodeModel,
} from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------- Types ----------

type CanvasNode = Omit<SensorNode, "position">;
type CanvasState = {
  nodes: CanvasNode[];
  connections: PipeConnection[];
};

type BuildMode = "view" | "insert" | "edit" | "delete";

// ---------- Default node template ----------

function makeNewNode(x: number, y: number): CanvasNode {
  const id = `PN-${String(Math.floor(Math.random() * 900) + 100)}`;
  return {
    id,
    modelId: "corr-xgb-v3",
    location: "New Monitoring Point",
    status: "normal",
    thickness: 12.5,
    nominalThickness: 12.5,
    predictedThickness: 12.0,
    degradationRate: 0.2,
    remainingLifeMonths: 120,
    position2d: [x, y],
    minThicknessTarget: 6.0,
    models: [
      { modelId: "corr-xgb-v3", predictedThickness: 12.0, degradationRate: 0.2, remainingLifeMonths: 120, confidence: 0.90 },
    ],
  };
}

// ---------- Edit Form ----------

function NodeEditForm({
  node,
  onSave,
  onCancel,
}: {
  node: CanvasNode;
  onSave: (updated: CanvasNode) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<CanvasNode>({ ...node });

  function field(
    label: string,
    key: keyof CanvasNode,
    type: "text" | "number" = "text",
  ) {
    return (
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input
          type={type}
          value={String(draft[key])}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              [key]:
                type === "number"
                  ? parseFloat(e.target.value) || 0
                  : e.target.value,
            }))
          }
          className="h-8 text-xs"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Edit Node</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {field("Location name", "location")}
      {field("Sensor ID", "id")}
      {field("Model ID", "modelId")}

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <select
          value={draft.status}
          onChange={(e) =>
            setDraft((d) => ({ ...d, status: e.target.value as Status }))
          }
          className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {(["normal", "warning", "error", "offline"] as Status[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
      </div>

      {field("Thickness (mm)", "thickness", "number")}
      {field("Min target thickness (mm)", "minThicknessTarget", "number")}
      {field("Nominal thickness (mm)", "nominalThickness", "number")}
      {field("Predicted thickness (mm)", "predictedThickness", "number")}
      {field("Degradation rate (mm/yr)", "degradationRate", "number")}
      {field("Remaining life (months)", "remainingLifeMonths", "number")}

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={() => onSave(draft)}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ---------- Node Inspector (view mode) ----------

const MODEL_CHANNEL_COLORS = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-2)",
] as const;

function NodeInspector({
  node,
  onClose,
}: {
  node: CanvasNode;
  onClose: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const models: NodeModel[] = node.models ?? [];
  const model = models[Math.min(activeIdx, models.length - 1)];

  const alertLevel =
    node.status !== "offline" && node.thickness <= node.minThicknessTarget
      ? "critical"
      : node.status !== "offline" &&
          node.thickness <= node.minThicknessTarget * 1.2
        ? "warning"
        : null;

  const deviation =
    node.status !== "offline" && model
      ? node.thickness - model.predictedThickness
      : null;

  const deviationColor =
    deviation === null
      ? "var(--muted-foreground)"
      : Math.abs(deviation) < 0.3
        ? "var(--status-normal)"
        : deviation > 0
          ? "var(--status-warning)"
          : "var(--status-error)";

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {node.location}
          </h3>
          <p className="font-mono text-[10px] text-muted-foreground">
            {node.id}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <StatusBadge status={node.status} />

      {/* Alert banner */}
      {alertLevel && (
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-xs font-medium",
            alertLevel === "critical"
              ? "border-[var(--status-error)]/40 bg-[var(--status-error)]/10 text-[var(--status-error)]"
              : "border-[var(--status-warning)]/40 bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
          )}
        >
          {alertLevel === "critical"
            ? `Below minimum! ${node.thickness.toFixed(1)}mm < ${node.minThicknessTarget}mm`
            : `Approaching minimum (${node.thickness.toFixed(1)}mm)`}
        </div>
      )}

      {/* Hard sensor readout */}
      <div className="rounded-md border border-border bg-muted/20 p-3">
        <p className="mb-2 text-[9px] uppercase tracking-widest text-muted-foreground">
          Hard Sensor
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Measured", `${node.thickness.toFixed(1)}`],
            ["Nominal", `${node.nominalThickness.toFixed(1)}`],
            ["Min", `${node.minThicknessTarget.toFixed(1)}`],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                {label}
              </p>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {val}
                <span className="text-[9px] font-normal text-muted-foreground">
                  {" "}mm
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Model channel tabs — only when multiple models */}
      {models.length > 1 && (
        <div className="flex gap-1">
          {models.map((m, i) => (
            <button
              key={m.modelId}
              type="button"
              onClick={() => setActiveIdx(i)}
              style={{
                borderColor:
                  i === activeIdx ? MODEL_CHANNEL_COLORS[i] : "transparent",
              }}
              className={cn(
                "flex flex-1 items-center gap-1.5 rounded-sm border px-2 py-1.5 text-[10px] font-medium transition-colors",
                i === activeIdx
                  ? "bg-muted/50 text-foreground"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
              )}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: MODEL_CHANNEL_COLORS[i],
                  opacity: i === activeIdx ? 1 : 0.35,
                }}
              />
              <span className="font-mono truncate">{m.modelId}</span>
            </button>
          ))}
        </div>
      )}

      {/* Per-model metrics */}
      {model && (
        <div className="rounded-md border border-border bg-muted/20 p-3">
          {/* Model ID label for single-model nodes */}
          {models.length === 1 && (
            <div className="mb-2.5 flex items-center gap-1.5">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: MODEL_CHANNEL_COLORS[0] }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {model.modelId}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Predicted
              </p>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {node.status !== "offline"
                  ? `${model.predictedThickness.toFixed(1)}`
                  : "—"}
                {node.status !== "offline" && (
                  <span className="text-[9px] font-normal text-muted-foreground">
                    {" "}mm
                  </span>
                )}
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Δ Deviation
              </p>
              <p
                className="font-mono text-sm font-semibold tabular-nums"
                style={{ color: deviationColor }}
              >
                {deviation !== null
                  ? `${deviation >= 0 ? "+" : ""}${deviation.toFixed(2)}`
                  : "—"}
                {deviation !== null && (
                  <span className="text-[9px] font-normal opacity-70">
                    {" "}mm
                  </span>
                )}
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Deg. Rate
              </p>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {model.degradationRate.toFixed(2)}
                <span className="text-[9px] font-normal text-muted-foreground">
                  {" "}mm/yr
                </span>
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Life Left
              </p>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {node.status !== "offline"
                  ? `${model.remainingLifeMonths}`
                  : "—"}
                {node.status !== "offline" && (
                  <span className="text-[9px] font-normal text-muted-foreground">
                    {" "}mo
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Confidence bar */}
          {node.status !== "offline" && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  Confidence
                </p>
                <p className="font-mono text-[10px] font-medium tabular-nums text-foreground">
                  {Math.round(model.confidence * 100)}%
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${model.confidence * 100}%`,
                    backgroundColor: MODEL_CHANNEL_COLORS[
                      Math.min(activeIdx, MODEL_CHANNEL_COLORS.length - 1)
                    ],
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Main Component ----------

export function FactoryCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CanvasState>({
    nodes: sensorNodes.map(({ position: _p, ...n }) => n),
    connections: pipeConnections,
  });
  const [buildMode, setBuildMode] = useState<BuildMode>("view");
  const [selected, setSelected] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<CanvasNode | null>(null);
  const [zoom, setZoom] = useState(1);
  // Pending connection: waiting for second node click
  const [pendingConnect, setPendingConnect] = useState<string | null>(null);

  const selectedNode = state.nodes.find((n) => n.id === selected) ?? null;

  // Compute percent position relative to container
  function getClickPercent(
    e: React.MouseEvent<HTMLDivElement>,
  ): [number, number] {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return [Math.max(3, Math.min(97, x)), Math.max(3, Math.min(97, y))];
  }

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("[data-node]")) return;
      if (buildMode === "insert") {
        const [x, y] = getClickPercent(e);
        const newNode = makeNewNode(Math.round(x), Math.round(y));
        setState((s) => ({ ...s, nodes: [...s.nodes, newNode] }));
        setEditingNode(newNode);
        setBuildMode("edit");
        setSelected(newNode.id);
      } else {
        setSelected(null);
      }
    },
    [buildMode],
  );

  function handleNodeClick(node: CanvasNode, e: React.MouseEvent) {
    e.stopPropagation();
    if (buildMode === "delete") {
      setState((s) => ({
        nodes: s.nodes.filter((n) => n.id !== node.id),
        connections: s.connections.filter(
          (c) => c.from !== node.id && c.to !== node.id,
        ),
      }));
      if (selected === node.id) setSelected(null);
      return;
    }
    if (buildMode === "edit") {
      setEditingNode({ ...node });
      setSelected(node.id);
      return;
    }
    // View mode — toggle inspector
    setSelected((prev) => (prev === node.id ? null : node.id));
  }

  function handleSaveEdit(updated: CanvasNode) {
    setState((s) => ({
      ...s,
      nodes: s.nodes.map((n) => (n.id === editingNode?.id ? updated : n)),
      connections: s.connections.map((c) => ({
        from: c.from === editingNode?.id ? updated.id : c.from,
        to: c.to === editingNode?.id ? updated.id : c.to,
      })),
    }));
    setSelected(updated.id);
    setEditingNode(null);
    setBuildMode("view");
  }

  const nodeMap = Object.fromEntries(state.nodes.map((n) => [n.id, n]));

  return (
    <div className="flex h-full flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-card/80 px-4 py-2 backdrop-blur">
        <Layers
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="text-xs font-medium text-muted-foreground">
          Factory Floor
        </span>

        <div className="ml-auto flex items-center gap-1">
          {/* Mode buttons */}
          {(
            [
              { mode: "view" as BuildMode, icon: Layers, label: "View" },
              { mode: "insert" as BuildMode, icon: Plus, label: "Insert node" },
              { mode: "edit" as BuildMode, icon: Pencil, label: "Edit node" },
              {
                mode: "delete" as BuildMode,
                icon: Trash2,
                label: "Delete node",
              },
            ] as const
          ).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={buildMode === mode}
              onClick={() => {
                setBuildMode(mode);
                setSelected(null);
                setEditingNode(null);
                setPendingConnect(null);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                buildMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                mode === "delete" &&
                  buildMode === "delete" &&
                  "bg-status-error text-white",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}

          <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

          {/* Zoom */}
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ZoomOut className="size-3.5" aria-hidden="true" />
          </button>
          <span className="min-w-[3ch] text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ZoomIn className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Build mode hint bar */}
      {buildMode !== "view" && (
        <div
          className={cn(
            "border-b px-4 py-1.5 text-xs font-medium",
            buildMode === "insert" &&
              "border-(--status-warning)/30 bg-(--status-warning)/10 text-status-warning",
            buildMode === "edit" &&
              "border-primary/30 bg-primary/10 text-primary",
            buildMode === "delete" &&
              "border-(--status-error)/30 bg-(--status-error)/10 text-status-error",
          )}
        >
          {buildMode === "insert" &&
            "Click anywhere on the canvas to place a new monitoring node."}
          {buildMode === "edit" && "Click a node to edit its properties."}
          {buildMode === "delete" && "Click a node to permanently remove it."}
        </div>
      )}

      {/* Canvas + Side panel */}
      <div className="flex min-h-0 flex-1">
        {/* Canvas */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div
            className="absolute inset-0 overflow-auto"
            style={{ cursor: buildMode === "insert" ? "crosshair" : "default" }}
          >
            <div
              ref={containerRef}
              className="relative origin-top-left"
              style={{
                width: `${100 / zoom}%`,
                height: `${100 / zoom}%`,
                minHeight: "360px",
                transform: `scale(${zoom})`,
                transformOrigin: "0 0",
              }}
              onClick={handleCanvasClick}
            >
              {/* Background image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/factory-floor.png"
                alt="Factory floor plan"
                className="absolute inset-0 h-full w-full object-cover opacity-30 select-none"
                draggable={false}
              />

              {/* SVG pipe connections */}
              <svg
                className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
                style={{ zIndex: 1 }}
                aria-hidden="true"
              >
                {state.connections.map((c) => {
                  const a = nodeMap[c.from];
                  const b = nodeMap[c.to];
                  if (!a || !b) return null;
                  const [x1, y1] = a.position2d;
                  const [x2, y2] = b.position2d;
                  // Pick pipe color based on worse status
                  const worst =
                    a.status === "error" || b.status === "error"
                      ? "error"
                      : a.status === "warning" || b.status === "warning"
                        ? "warning"
                        : a.status === "offline" || b.status === "offline"
                          ? "offline"
                          : "normal";
                  return (
                    <g key={`${c.from}-${c.to}`}>
                      {/* Glow shadow */}
                      <line
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke={STATUS_META[worst].token}
                        strokeWidth="8"
                        strokeOpacity="0.12"
                        strokeLinecap="round"
                      />
                      {/* Main pipe */}
                      <line
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke={STATUS_META[worst].token}
                        strokeWidth="2.5"
                        strokeOpacity="0.7"
                        strokeLinecap="round"
                        strokeDasharray={
                          worst === "offline" ? "6 4" : undefined
                        }
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Sensor nodes */}
              {state.nodes.map((node) => {
                const [px, py] = node.position2d;
                const isSelected = selected === node.id;
                const isEditing = editingNode?.id === node.id;
                const color = STATUS_META[node.status].token;

                const alertLevel =
                  node.status !== "offline" &&
                  node.thickness <= node.minThicknessTarget
                    ? "critical"
                    : node.status !== "offline" &&
                        node.thickness <= node.minThicknessTarget * 1.2
                      ? "warning"
                      : null;

                return (
                  <div
                    key={node.id}
                    data-node="true"
                    style={{
                      position: "absolute",
                      left: `${px}%`,
                      top: `${py}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isSelected ? 10 : 2,
                    }}
                    onClick={(e) => handleNodeClick(node, e)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.location} — ${STATUS_META[node.status].label}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleNodeClick(node, e as any);
                    }}
                    className={cn(
                      "group flex flex-col items-center gap-0.5 cursor-pointer",
                      buildMode === "delete" && "hover:opacity-60",
                    )}
                  >
                    {/* Floating data tag above node */}
                    {node.status !== "offline" && (
                      <div
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap pb-1"
                        style={{ bottom: "100%", zIndex: 3 }}
                        aria-hidden="true"
                      >
                        <div
                          className="flex flex-col gap-px rounded border px-1.5 py-1 text-[8.5px] backdrop-blur-sm"
                          style={{
                            backgroundColor: "oklch(0.98 0.006 195 / 0.94)",
                            borderColor: `color-mix(in oklch, ${color} 28%, transparent)`,
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">M</span>
                            <span className="font-mono font-semibold tabular-nums text-foreground">
                              {node.thickness.toFixed(1)}
                              <span className="font-normal text-muted-foreground">mm</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">P</span>
                            <span className="font-mono font-semibold tabular-nums" style={{ color }}>
                              {(node.models[0]?.predictedThickness ?? 0).toFixed(1)}
                              <span className="font-normal opacity-70">mm</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">∂</span>
                            <span className="font-mono font-semibold tabular-nums text-foreground">
                              {node.degradationRate.toFixed(2)}
                              <span className="font-normal text-muted-foreground">/yr</span>
                            </span>
                          </div>
                        </div>
                        <div
                          className="mx-auto mt-0.5 size-1 rounded-full"
                          style={{ backgroundColor: `color-mix(in oklch, ${color} 55%, transparent)` }}
                        />
                      </div>
                    )}

                    {/* Pulse ring for alerts */}
                    {(alertLevel || node.status === "error") && (
                      <span
                        className="absolute size-10 animate-ping rounded-full opacity-30"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                    )}

                    {/* Node circle */}
                    <div
                      className={cn(
                        "relative flex size-9 items-center justify-center rounded-full border-2 shadow-lg transition-transform duration-150",
                        isSelected || isEditing
                          ? "scale-125 ring-2 ring-foreground/20 ring-offset-1 ring-offset-black/50"
                          : "group-hover:scale-110",
                        buildMode === "delete" && "border-status-error",
                      )}
                      style={{
                        borderColor: color,
                        backgroundColor: `color-mix(in oklch, ${color} 20%, oklch(1 0 0))`,
                        boxShadow: `0 0 12px color-mix(in oklch, ${color} 40%, transparent)`,
                      }}
                    >
                      {buildMode === "delete" ? (
                        <Trash2
                          className="size-3.5 text-status-error"
                          aria-hidden="true"
                        />
                      ) : buildMode === "edit" ? (
                        <Edit2
                          className="size-3.5"
                          style={{ color }}
                          aria-hidden="true"
                        />
                      ) : (
                        <Settings
                          className="size-3.5"
                          style={{ color }}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div
                      className="max-w-[100px] rounded px-1.5 py-0.5 text-center text-[10px] font-medium leading-tight"
                      style={{
                        backgroundColor: "oklch(0.985 0.006 195 / 0.9)",
                        color,
                        border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`,
                      }}
                    >
                      <div className="truncate">{node.id}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side panel: inspector or edit form */}
        {(selectedNode || editingNode) && (
          <aside
            className="flex w-64 shrink-0 flex-col gap-0 overflow-y-auto border-l border-border bg-card"
            aria-label="Node detail panel"
          >
            <div className="p-4">
              {editingNode ? (
                <NodeEditForm
                  node={editingNode}
                  onSave={handleSaveEdit}
                  onCancel={() => {
                    setEditingNode(null);
                    setBuildMode("view");
                  }}
                />
              ) : selectedNode ? (
                <NodeInspector
                  node={selectedNode}
                  onClose={() => setSelected(null)}
                />
              ) : null}
            </div>
          </aside>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-card/60 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Status:
        </span>
        {(["normal", "warning", "error", "offline"] as const).map((s) => (
          <span
            key={s}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: STATUS_META[s].token }}
              aria-hidden="true"
            />
            {STATUS_META[s].label}
          </span>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {state.nodes.length} nodes · {state.connections.length} connections
        </span>
      </div>
    </div>
  );
}
