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

/** Older 12-month window labels (months -23 .. -12 from now), for historical charts */
const HISTORICAL_MONTH_LABELS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(_now.getFullYear(), _now.getMonth() - (23 - i), 1)
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
})

/** Active (non-offline) nodes — the series rendered in the kiosk trend charts */
const ACTIVE_TREND_NODES = sensorNodes.filter((n) => n.status !== "offline")

/** Deterministic, seed-stable jitter in [-amp, amp] from an integer seed */
const wobble = (seed: number, amp: number) =>
  ((Math.sin(seed * 12.9898) * 43758.5453) % 1) * amp

/** Base real-time power draw (kW) per active node — heavier loops pull more */
const NODE_POWER_BASE: Record<string, number> = {
  "PN-01": 62,
  "PN-02": 104,
  "PN-03": 118,
  "PN-04": 71,
  "PN-05": 88,
}

/**
 * Per-node power consumption (kW) — real-time 12-month trailing.
 * Higher-degradation nodes trend upward over the window (more pump effort).
 */
export const perNodePowerConsumption: Array<Record<string, number | string>> =
  TREND_MONTH_LABELS.map((month, idx) => {
    const monthsBack = TREND_MONTH_LABELS.length - 1 - idx
    const point: Record<string, number | string> = { month }
    for (const node of ACTIVE_TREND_NODES) {
      const base = NODE_POWER_BASE[node.id] ?? 70
      const drift = node.degradationRate * 2.4 * (11 - monthsBack)
      point[node.id] = +Math.max(
        0,
        base + drift + wobble(idx + node.id.charCodeAt(4), 3.5),
      ).toFixed(1)
    }
    return point
  })

/**
 * Per-node wall thickness — historical (older 12-month window).
 * Pipe was thicker in the past, so values sit above the real-time series.
 */
export const perNodeThicknessTrendHistorical: Array<
  Record<string, number | string>
> = HISTORICAL_MONTH_LABELS.map((month, idx) => {
  const monthsBack = 12 + (HISTORICAL_MONTH_LABELS.length - 1 - idx)
  const point: Record<string, number | string> = { month }
  for (const node of ACTIVE_TREND_NODES) {
    point[node.id] = +Math.max(
      0,
      node.thickness + (node.degradationRate / 12) * monthsBack,
    ).toFixed(2)
  }
  return point
})

/**
 * Per-node power consumption (kW) — historical (older 12-month window).
 * Lower baseline load than today, with its own mild pattern.
 */
export const perNodePowerConsumptionHistorical: Array<
  Record<string, number | string>
> = HISTORICAL_MONTH_LABELS.map((month, idx) => {
  const point: Record<string, number | string> = { month }
  for (const node of ACTIVE_TREND_NODES) {
    const base = (NODE_POWER_BASE[node.id] ?? 70) * 0.86
    const drift = node.degradationRate * 1.5 * idx
    point[node.id] = +Math.max(
      0,
      base + drift + wobble(idx * 2 + node.id.charCodeAt(4), 4.2),
    ).toFixed(1)
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

// ── Global Fleet View ─────────────────────────────────────────────────────

export type MiniPipeNode = {
  id: string
  status: Status
  x: number
  y: number
}

export type MiniPipeConnection = {
  from: string
  to: string
}

export type CompanyFleetEntry = {
  id: string
  name: string
  logoInitials: string
  overallStatus: Status
  alertCount: number
  criticalAssets: number
  meanConfidence: number
  nodes: MiniPipeNode[]
  connections: MiniPipeConnection[]
}

export const companyFleetData: CompanyFleetEntry[] = [
  {
    id: "astra",
    name: "Astra Chemical",
    logoInitials: "AC",
    overallStatus: "error",
    alertCount: 2,
    criticalAssets: 2,
    meanConfidence: 0.87,
    nodes: [
      { id: "ac1", status: "normal", x: 20, y: 30 },
      { id: "ac2", status: "error", x: 60, y: 30 },
      { id: "ac3", status: "error", x: 100, y: 30 },
      { id: "ac4", status: "warning", x: 140, y: 30 },
      { id: "ac5", status: "normal", x: 100, y: 50 },
    ],
    connections: [
      { from: "ac1", to: "ac2" },
      { from: "ac2", to: "ac3" },
      { from: "ac3", to: "ac4" },
      { from: "ac3", to: "ac5" },
    ],
  },
  {
    id: "borealis",
    name: "Borealis Steel",
    logoInitials: "BS",
    overallStatus: "warning",
    alertCount: 0,
    criticalAssets: 0,
    meanConfidence: 0.91,
    nodes: [
      { id: "bs1", status: "normal", x: 20, y: 30 },
      { id: "bs2", status: "warning", x: 60, y: 30 },
      { id: "bs3", status: "normal", x: 100, y: 30 },
      { id: "bs4", status: "warning", x: 140, y: 30 },
    ],
    connections: [
      { from: "bs1", to: "bs2" },
      { from: "bs2", to: "bs3" },
      { from: "bs3", to: "bs4" },
    ],
  },
  {
    id: "novatek",
    name: "Novatek Refinery",
    logoInitials: "NR",
    overallStatus: "normal",
    alertCount: 0,
    criticalAssets: 0,
    meanConfidence: 0.96,
    nodes: [
      { id: "nr1", status: "normal", x: 20, y: 30 },
      { id: "nr2", status: "normal", x: 60, y: 30 },
      { id: "nr3", status: "normal", x: 100, y: 30 },
      { id: "nr4", status: "normal", x: 140, y: 30 },
    ],
    connections: [
      { from: "nr1", to: "nr2" },
      { from: "nr2", to: "nr3" },
      { from: "nr3", to: "nr4" },
    ],
  },
  {
    id: "meridian",
    name: "Meridian Petro",
    logoInitials: "MP",
    overallStatus: "error",
    alertCount: 3,
    criticalAssets: 3,
    meanConfidence: 0.79,
    nodes: [
      { id: "mp1", status: "error", x: 20, y: 30 },
      { id: "mp2", status: "error", x: 65, y: 30 },
      { id: "mp3", status: "warning", x: 65, y: 12 },
      { id: "mp4", status: "error", x: 110, y: 30 },
      { id: "mp5", status: "normal", x: 145, y: 30 },
    ],
    connections: [
      { from: "mp1", to: "mp2" },
      { from: "mp2", to: "mp3" },
      { from: "mp2", to: "mp4" },
      { from: "mp4", to: "mp5" },
    ],
  },
  {
    id: "cascade",
    name: "Cascade Industrial",
    logoInitials: "CI",
    overallStatus: "error",
    alertCount: 1,
    criticalAssets: 1,
    meanConfidence: 0.84,
    nodes: [
      { id: "ci1", status: "normal", x: 20, y: 30 },
      { id: "ci2", status: "error", x: 60, y: 30 },
      { id: "ci3", status: "warning", x: 100, y: 30 },
      { id: "ci4", status: "offline", x: 140, y: 30 },
    ],
    connections: [
      { from: "ci1", to: "ci2" },
      { from: "ci2", to: "ci3" },
      { from: "ci3", to: "ci4" },
    ],
  },
  {
    id: "zenith",
    name: "Zenith Plastics",
    logoInitials: "ZP",
    overallStatus: "warning",
    alertCount: 0,
    criticalAssets: 0,
    meanConfidence: 0.94,
    nodes: [
      { id: "zp1", status: "normal", x: 30, y: 30 },
      { id: "zp2", status: "warning", x: 80, y: 30 },
      { id: "zp3", status: "normal", x: 130, y: 30 },
    ],
    connections: [
      { from: "zp1", to: "zp2" },
      { from: "zp2", to: "zp3" },
    ],
  },
  {
    id: "rhein",
    name: "Rhein Process",
    logoInitials: "RP",
    overallStatus: "error",
    alertCount: 1,
    criticalAssets: 1,
    meanConfidence: 0.88,
    nodes: [
      { id: "rp1", status: "normal", x: 20, y: 30 },
      { id: "rp2", status: "normal", x: 60, y: 30 },
      { id: "rp3", status: "error", x: 100, y: 30 },
      { id: "rp4", status: "warning", x: 140, y: 30 },
      { id: "rp5", status: "normal", x: 120, y: 12 },
    ],
    connections: [
      { from: "rp1", to: "rp2" },
      { from: "rp2", to: "rp3" },
      { from: "rp3", to: "rp4" },
      { from: "rp3", to: "rp5" },
    ],
  },
  {
    id: "pacific",
    name: "Pacific Midstream",
    logoInitials: "PM",
    overallStatus: "normal",
    alertCount: 0,
    criticalAssets: 0,
    meanConfidence: 0.97,
    nodes: [
      { id: "pm1", status: "normal", x: 30, y: 30 },
      { id: "pm2", status: "normal", x: 80, y: 30 },
      { id: "pm3", status: "normal", x: 130, y: 30 },
    ],
    connections: [
      { from: "pm1", to: "pm2" },
      { from: "pm2", to: "pm3" },
    ],
  },
]

export const globalAlertCount = companyFleetData.reduce(
  (sum, c) => sum + c.alertCount,
  0,
)
