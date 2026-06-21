// Wall-thickness decay simulation — single source of truth.
// Extracted from forecast-view.tsx so the Dashboard v2 deep-dive and the
// Forecast view share identical math.

export const CRITICAL_THICKNESS = 4.0;
export const MIN_THICKNESS = 6.0;
export const MAX_HORIZON = 120;

export type Urgency = "safe" | "watch" | "monitor" | "high" | "critical";

export type CurvePoint = { label: string; thickness: number };

/** Map a month offset from today to a short "Mon YY" label. */
export function monthOffsetToLabel(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/**
 * Months until `thickness` decays to `threshold` at `rate` (mm/year).
 * Returns 0 if already at/below threshold, null if it never breaches.
 */
export function monthsToThreshold(
  thickness: number,
  rate: number,
  threshold: number,
): number | null {
  if (thickness <= threshold) return 0;
  if (rate <= 0) return null;
  return Math.ceil((thickness - threshold) / (rate / 12));
}

export function getUrgency(min: number | null, crit: number | null): Urgency {
  if (min === 0 || crit === 0) return "critical";
  if (crit !== null && crit <= 6) return "critical";
  if (crit !== null && crit <= 12) return "high";
  if (min !== null && min <= 6) return "high";
  if (min !== null && min <= 12) return "monitor";
  if (min !== null && min <= 24) return "watch";
  return "safe";
}

export const URGENCY_META: Record<
  Urgency,
  { label: string; color: string; actions: string[] }
> = {
  safe: {
    label: "Safe",
    color: "var(--status-normal)",
    actions: [
      "No immediate action required.",
      "Continue standard monitoring at scheduled intervals.",
      "Review forecast if process conditions change.",
    ],
  },
  watch: {
    label: "Watch",
    color: "var(--chart-3)",
    actions: [
      "Include in next annual maintenance window.",
      "Verify degradation rate at next inspection.",
      "Update forecast inputs after field measurement.",
    ],
  },
  monitor: {
    label: "Monitor",
    color: "var(--status-warning)",
    actions: [
      "Increase inspection frequency to quarterly.",
      "Notify maintenance planner to schedule visit.",
      "Confirm degradation rate with ultrasonic reading.",
    ],
  },
  high: {
    label: "High Risk",
    color: "var(--status-warning)",
    actions: [
      "Schedule inspection within 30 days.",
      "Initiate procurement for pipe replacement section.",
      "Brief operations on reduced operating pressure if needed.",
    ],
  },
  critical: {
    label: "Critical",
    color: "var(--status-error)",
    actions: [
      "Immediate inspection required — do not delay.",
      "Begin emergency replacement procedure.",
      "Notify plant manager and HSE officer.",
    ],
  },
};

/** Project monthly wall-thickness decay from today until threshold breach. */
export function buildCurve(rate: number, thickness: number): CurvePoint[] {
  const monthlyRate = rate / 12;
  if (monthlyRate <= 0) {
    return Array.from({ length: 25 }, (_, m) => ({
      label: monthOffsetToLabel(m),
      thickness: Number(thickness.toFixed(2)),
    }));
  }
  const monthsToCritical =
    thickness <= CRITICAL_THICKNESS
      ? 0
      : Math.ceil((thickness - CRITICAL_THICKNESS) / monthlyRate);
  const horizon = Math.min(monthsToCritical + 6, MAX_HORIZON);
  const points: CurvePoint[] = [];
  for (let m = 0; m <= horizon; m++) {
    const value = Math.max(0, thickness - monthlyRate * m);
    points.push({
      label: monthOffsetToLabel(m),
      thickness: Number(value.toFixed(2)),
    });
    if (value <= 0) break;
  }
  return points;
}
