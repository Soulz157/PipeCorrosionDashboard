export type Status = "normal" | "warning" | "error" | "offline"

export type NodeModel = {
  modelId: string
  predictedThickness: number
  degradationRate: number
  remainingLifeMonths: number
  confidence: number
}

export type SensorNode = {
  id: string
  modelId: string
  location: string
  status: Status
  /** Current measured wall thickness in mm */
  thickness: number
  /** Nominal (as-built) thickness in mm */
  nominalThickness: number
  /** Predicted thickness at horizon in mm (primary model) */
  predictedThickness: number
  /** Corrosion / degradation rate in mm per year (primary model) */
  degradationRate: number
  /** Estimated remaining life in months (primary model) */
  remainingLifeMonths: number
  /** Position along the 3D pipe network [x, y, z] */
  position: [number, number, number]
  /** 2D canvas position as percentage [x%, y%] of container */
  position2d: [number, number]
  /** Minimum allowable thickness in mm before alert */
  minThicknessTarget: number
  /** All models assigned to this node — multi-model nodes show per-channel detail in inspector */
  models: NodeModel[]
}

/** Pipe connection between two sensor node IDs */
export type PipeConnection = {
  from: string
  to: string
}

export const STATUS_META: Record<
  Status,
  { label: string; token: string; dot: string }
> = {
  normal: {
    label: "Normal",
    token: "var(--status-normal)",
    dot: "bg-[var(--status-normal)]",
  },
  warning: {
    label: "Warning",
    token: "var(--status-warning)",
    dot: "bg-[var(--status-warning)]",
  },
  error: {
    label: "Error",
    token: "var(--status-error)",
    dot: "bg-[var(--status-error)]",
  },
  offline: {
    label: "Offline",
    token: "var(--status-offline)",
    dot: "bg-[var(--status-offline)]",
  },
}

export const sensorNodes: SensorNode[] = [
  {
    id: "PN-01",
    modelId: "corr-xgb-v3",
    location: "Inlet Manifold A",
    status: "normal",
    thickness: 11.8,
    nominalThickness: 12.5,
    predictedThickness: 11.2,
    degradationRate: 0.18,
    remainingLifeMonths: 142,
    position: [-6, 0, 0],
    position2d: [12, 48],
    minThicknessTarget: 6.0,
    models: [
      { modelId: "corr-xgb-v3", predictedThickness: 11.2, degradationRate: 0.18, remainingLifeMonths: 142, confidence: 0.97 },
    ],
  },
  {
    id: "PN-02",
    modelId: "corr-xgb-v3",
    location: "Heat Exchanger Loop",
    status: "warning",
    thickness: 8.4,
    nominalThickness: 12.5,
    predictedThickness: 7.1,
    degradationRate: 0.62,
    remainingLifeMonths: 38,
    position: [-2, 0, 0],
    position2d: [32, 48],
    minThicknessTarget: 6.0,
    models: [
      { modelId: "corr-xgb-v3", predictedThickness: 7.1, degradationRate: 0.62, remainingLifeMonths: 38, confidence: 0.88 },
      { modelId: "corr-lstm-v2", predictedThickness: 7.4, degradationRate: 0.55, remainingLifeMonths: 44, confidence: 0.79 },
    ],
  },
  {
    id: "PN-03",
    modelId: "corr-lstm-v2",
    location: "Reactor Feed Line",
    status: "error",
    thickness: 5.1,
    nominalThickness: 12.5,
    predictedThickness: 3.4,
    degradationRate: 1.34,
    remainingLifeMonths: 9,
    position: [2, 0, 0],
    position2d: [52, 48],
    minThicknessTarget: 6.0,
    models: [
      { modelId: "corr-lstm-v2", predictedThickness: 3.4, degradationRate: 1.34, remainingLifeMonths: 9, confidence: 0.91 },
      { modelId: "corr-xgb-v3", predictedThickness: 4.1, degradationRate: 1.18, remainingLifeMonths: 13, confidence: 0.84 },
    ],
  },
  {
    id: "PN-04",
    modelId: "corr-xgb-v3",
    location: "Cooling Return Bend",
    status: "normal",
    thickness: 10.9,
    nominalThickness: 12.5,
    predictedThickness: 10.3,
    degradationRate: 0.24,
    remainingLifeMonths: 118,
    position: [6, 0, 0],
    position2d: [72, 48],
    minThicknessTarget: 6.0,
    models: [
      { modelId: "corr-xgb-v3", predictedThickness: 10.3, degradationRate: 0.24, remainingLifeMonths: 118, confidence: 0.95 },
    ],
  },
  {
    id: "PN-05",
    modelId: "corr-lstm-v2",
    location: "Outlet Riser North",
    status: "warning",
    thickness: 7.9,
    nominalThickness: 12.5,
    predictedThickness: 6.6,
    degradationRate: 0.71,
    remainingLifeMonths: 31,
    position: [6, 3, 0],
    position2d: [72, 22],
    minThicknessTarget: 6.0,
    models: [
      { modelId: "corr-lstm-v2", predictedThickness: 6.6, degradationRate: 0.71, remainingLifeMonths: 31, confidence: 0.82 },
      { modelId: "corr-xgb-v3", predictedThickness: 7.0, degradationRate: 0.65, remainingLifeMonths: 36, confidence: 0.89 },
    ],
  },
  {
    id: "PN-06",
    modelId: "corr-xgb-v3",
    location: "Drain Header B",
    status: "offline",
    thickness: 9.2,
    nominalThickness: 12.5,
    predictedThickness: 9.0,
    degradationRate: 0.0,
    remainingLifeMonths: 0,
    position: [2, -3, 0],
    position2d: [52, 74],
    minThicknessTarget: 6.0,
    models: [
      { modelId: "corr-xgb-v3", predictedThickness: 9.0, degradationRate: 0.0, remainingLifeMonths: 0, confidence: 0.0 },
    ],
  },
]

/** Default pipe connections between nodes */
export const pipeConnections: PipeConnection[] = [
  { from: "PN-01", to: "PN-02" },
  { from: "PN-02", to: "PN-03" },
  { from: "PN-03", to: "PN-04" },
  { from: "PN-04", to: "PN-05" },
  { from: "PN-03", to: "PN-06" },
]

/** Per-node wall thickness trend — 12-month trailing data derived from current readings */
const _now = new Date()
const TREND_MONTH_LABELS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(_now.getFullYear(), _now.getMonth() - (11 - i), 1)
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
})

export const perNodeThicknessTrend: Array<Record<string, number | string>> =
  TREND_MONTH_LABELS.map((month, idx) => {
    const monthsBack = TREND_MONTH_LABELS.length - 1 - idx
    const point: Record<string, number | string> = { month }
    for (const node of sensorNodes) {
      if (node.status !== "offline") {
        point[node.id] = +Math.max(
          0,
          node.thickness + (node.degradationRate / 12) * monthsBack,
        ).toFixed(2)
      }
    }
    return point
  })

export type StatusCount = { status: Status; count: number }

export const statusCounts: StatusCount[] = (
  ["normal", "warning", "error", "offline"] as Status[]
).map((status) => ({
  status,
  count: sensorNodes.filter((n) => n.status === status).length,
}))

export type LogEntry = {
  id: string
  timestamp: string
  modelId: string
  location: string
  status: Status
  message: string
}

export const logEntries: LogEntry[] = [
  {
    id: "L-1043",
    timestamp: "2026-06-08 09:42:17",
    modelId: "corr-lstm-v2",
    location: "Reactor Feed Line",
    status: "error",
    message: "Predicted thickness below critical threshold (3.4mm < 4.0mm).",
  },
  {
    id: "L-1042",
    timestamp: "2026-06-08 09:41:55",
    modelId: "corr-xgb-v3",
    location: "Heat Exchanger Loop",
    status: "warning",
    message: "Degradation rate increased 18% over trailing 7-day window.",
  },
  {
    id: "L-1041",
    timestamp: "2026-06-08 09:40:12",
    modelId: "corr-xgb-v3",
    location: "Inlet Manifold A",
    status: "normal",
    message: "Inference complete. Confidence 0.97. No anomaly detected.",
  },
  {
    id: "L-1040",
    timestamp: "2026-06-08 09:38:03",
    modelId: "corr-xgb-v3",
    location: "Drain Header B",
    status: "offline",
    message: "Sensor heartbeat lost. Falling back to last known reading.",
  },
  {
    id: "L-1039",
    timestamp: "2026-06-08 09:35:48",
    modelId: "corr-lstm-v2",
    location: "Outlet Riser North",
    status: "warning",
    message: "Forecast horizon extended to 36mo. Remaining life 31mo.",
  },
  {
    id: "L-1038",
    timestamp: "2026-06-08 09:33:21",
    modelId: "corr-xgb-v3",
    location: "Cooling Return Bend",
    status: "normal",
    message: "Inference complete. Confidence 0.95. No anomaly detected.",
  },
  {
    id: "L-1037",
    timestamp: "2026-06-08 09:30:09",
    modelId: "corr-lstm-v2",
    location: "Reactor Feed Line",
    status: "error",
    message: "Model drift detected: residual MAE exceeded control limit.",
  },
  {
    id: "L-1036",
    timestamp: "2026-06-08 09:27:44",
    modelId: "corr-xgb-v3",
    location: "Inlet Manifold A",
    status: "normal",
    message: "Scheduled retrain checkpoint saved (epoch 240).",
  },
]

export type MetricPoint = {
  date: string
  rmse: number
  mae: number
}

export const evaluationMetrics: MetricPoint[] = (() => {
  const raw = [
    { rmse: 0.42, mae: 0.31 },
    { rmse: 0.39, mae: 0.29 },
    { rmse: 0.40, mae: 0.30 },
    { rmse: 0.35, mae: 0.26 },
    { rmse: 0.31, mae: 0.23 },
    { rmse: 0.28, mae: 0.21 },
    { rmse: 0.30, mae: 0.22 },
    { rmse: 0.26, mae: 0.19 },
    { rmse: 0.24, mae: 0.18 },
    { rmse: 0.25, mae: 0.19 },
    { rmse: 0.22, mae: 0.17 },
    { rmse: 0.21, mae: 0.16 },
  ]
  const base = new Date()
  return raw.map((v, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() - (11 - i), 1)
    return { date: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), ...v }
  })
})()

/** Aggregated fleet thickness trend (months back from now) */
export type ThicknessTrendPoint = {
  month: string
  inlet: number
  exchanger: number
  reactor: number
}

export const thicknessTrend: ThicknessTrendPoint[] = [
  { month: "-11mo", inlet: 12.4, exchanger: 10.9, reactor: 9.8 },
  { month: "-10mo", inlet: 12.3, exchanger: 10.6, reactor: 9.2 },
  { month: "-9mo", inlet: 12.3, exchanger: 10.3, reactor: 8.5 },
  { month: "-8mo", inlet: 12.2, exchanger: 10.0, reactor: 7.9 },
  { month: "-7mo", inlet: 12.2, exchanger: 9.7, reactor: 7.2 },
  { month: "-6mo", inlet: 12.1, exchanger: 9.4, reactor: 6.7 },
  { month: "-5mo", inlet: 12.1, exchanger: 9.1, reactor: 6.2 },
  { month: "-4mo", inlet: 12.0, exchanger: 8.9, reactor: 5.8 },
  { month: "-3mo", inlet: 12.0, exchanger: 8.7, reactor: 5.5 },
  { month: "-2mo", inlet: 11.9, exchanger: 8.6, reactor: 5.3 },
  { month: "-1mo", inlet: 11.9, exchanger: 8.5, reactor: 5.2 },
  { month: "now", inlet: 11.8, exchanger: 8.4, reactor: 5.1 },
]

export const fleetSummary = {
  modelsOnline: sensorNodes.filter((n) => n.status !== "offline").length,
  totalModels: sensorNodes.length,
  avgDegradationRate:
    sensorNodes.reduce((s, n) => s + n.degradationRate, 0) /
    sensorNodes.length,
  criticalAssets: sensorNodes.filter((n) => n.status === "error").length,
  meanConfidence: 0.96,
}
