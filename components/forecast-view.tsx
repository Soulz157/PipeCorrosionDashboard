"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CRITICAL_THICKNESS = 4.0;
const MIN_THICKNESS = 6.0;
const MAX_HORIZON = 120;

type Forecast = {
  rate: number;
  thickness: number;
};

type Urgency = "safe" | "watch" | "monitor" | "high" | "critical";

function monthOffsetToLabel(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function getUrgency(min: number | null, crit: number | null): Urgency {
  if (min === 0 || crit === 0) return "critical";
  if (crit !== null && crit <= 6) return "critical";
  if (crit !== null && crit <= 12) return "high";
  if (min !== null && min <= 6) return "high";
  if (min !== null && min <= 12) return "monitor";
  if (min !== null && min <= 24) return "watch";
  return "safe";
}

const URGENCY_META: Record<
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

function buildCurve(rate: number, thickness: number) {
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
  const points = [];
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

function CurveTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">
        Thickness:{" "}
        <span className="font-medium text-popover-foreground">
          {payload[0].value} mm
        </span>
      </p>
    </div>
  );
}

export function ForecastView() {
  const [rate, setRate] = useState("0.6");
  const [thickness, setThickness] = useState("9.5");
  const [forecast, setForecast] = useState<Forecast | null>({
    rate: 0.6,
    thickness: 9.5,
  });

  const curve = useMemo(
    () => (forecast ? buildCurve(forecast.rate, forecast.thickness) : []),
    [forecast],
  );

  const monthsToMin = useMemo(() => {
    if (!forecast) return null;
    if (forecast.thickness <= MIN_THICKNESS) return 0;
    if (forecast.rate <= 0) return null;
    return Math.ceil(
      (forecast.thickness - MIN_THICKNESS) / (forecast.rate / 12),
    );
  }, [forecast]);

  const monthsToCritical = useMemo(() => {
    if (!forecast) return null;
    if (forecast.thickness <= CRITICAL_THICKNESS) return 0;
    if (forecast.rate <= 0) return null;
    return Math.ceil(
      (forecast.thickness - CRITICAL_THICKNESS) / (forecast.rate / 12),
    );
  }, [forecast]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForecast({
      rate: Number(rate) || 0,
      thickness: Number(thickness) || 0,
    });
  }

  const minBreachLabel = useMemo(
    () =>
      monthsToMin != null && monthsToMin > 0
        ? monthOffsetToLabel(monthsToMin)
        : null,
    [monthsToMin],
  );

  const criticalBreachLabel = useMemo(
    () =>
      monthsToCritical != null && monthsToCritical > 0
        ? monthOffsetToLabel(monthsToCritical)
        : null,
    [monthsToCritical],
  );

  const urgency = useMemo(
    () => (forecast ? getUrgency(monthsToMin, monthsToCritical) : null),
    [forecast, monthsToMin, monthsToCritical],
  );

  function formatMonths(m: number | null) {
    if (m === null) return "No breach";
    if (m === 0) return "Already breached";
    return `${m} month${m === 1 ? "" : "s"} · ${monthOffsetToLabel(m)}`;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Forecast inputs
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Enter measured parameters to project wall-thickness decay from today.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rate">Degradation rate (mm / year)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="thickness">Current thickness (mm)</Label>
            <Input
              id="thickness"
              type="number"
              step="0.1"
              min="0"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="mt-1 gap-2">
            <Zap className="size-4" aria-hidden="true" />
            Generate Forecast
          </Button>
        </form>

        {forecast && (
          <div className="mt-5 flex flex-col gap-2 rounded-md border border-border bg-secondary/50 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                Hits minimum ({MIN_THICKNESS} mm)
              </span>
              <span
                className="font-semibold tabular-nums"
                style={{
                  color:
                    monthsToMin === 0
                      ? "var(--status-error)"
                      : monthsToMin !== null
                        ? "var(--status-warning)"
                        : "var(--status-normal)",
                }}
              >
                {formatMonths(monthsToMin)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                Hits critical ({CRITICAL_THICKNESS} mm)
              </span>
              <span
                className="font-semibold tabular-nums"
                style={{
                  color:
                    monthsToCritical === null
                      ? "var(--status-normal)"
                      : "var(--status-error)",
                }}
              >
                {formatMonths(monthsToCritical)}
              </span>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Projected decay curve
            </h2>
            <p className="text-xs text-muted-foreground">
              Monthly projection from today until threshold breach
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="h-0.5 w-4"
                style={{ backgroundColor: "var(--status-error)" }}
              />
              Critical ({CRITICAL_THICKNESS}mm)
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="h-0.5 w-4"
                style={{
                  backgroundColor: "var(--status-warning)",
                  borderTop: "1px dashed var(--status-warning)",
                  background: "none",
                  borderTopStyle: "dashed",
                }}
              />
              Minimum ({MIN_THICKNESS}mm)
            </span>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={curve}
              margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                domain={[0, "dataMax + 1"]}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CurveTooltip />} />
              <ReferenceLine
                y={MIN_THICKNESS}
                stroke="var(--status-warning)"
                strokeDasharray="6 3"
                label={{
                  value: "min 6mm",
                  position: "insideTopRight",
                  fill: "var(--status-warning)",
                  fontSize: 9,
                }}
              />
              <ReferenceLine
                y={CRITICAL_THICKNESS}
                stroke="var(--status-error)"
                strokeDasharray="4 4"
                label={{
                  value: "critical 4mm",
                  position: "insideTopRight",
                  fill: "var(--status-error)",
                  fontSize: 9,
                }}
              />
              {minBreachLabel && (
                <ReferenceLine
                  x={minBreachLabel}
                  stroke="var(--status-warning)"
                  strokeDasharray="4 3"
                  label={{
                    value: "Inspect",
                    position: "insideTopLeft",
                    fill: "var(--status-warning)",
                    fontSize: 9,
                  }}
                />
              )}
              {criticalBreachLabel && (
                <ReferenceLine
                  x={criticalBreachLabel}
                  stroke="var(--status-error)"
                  strokeDasharray="4 3"
                  label={{
                    value: "Replace",
                    position: "insideTopLeft",
                    fill: "var(--status-error)",
                    fontSize: 9,
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="thickness"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {forecast && urgency && (
        <SummaryCard
          urgency={urgency}
          monthsToMin={monthsToMin}
          monthsToCritical={monthsToCritical}
        />
      )}
    </div>
  );
}

function SummaryCard({
  urgency,
  monthsToMin,
  monthsToCritical,
}: {
  urgency: Urgency;
  monthsToMin: number | null;
  monthsToCritical: number | null;
}) {
  const meta = URGENCY_META[urgency];

  function CountdownCell({
    months,
    label,
    color,
  }: {
    months: number | null;
    label: string;
    color: string;
  }) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {months === null ? (
          <p
            className="text-2xl font-semibold tabular-nums"
            style={{ color: "var(--status-normal)" }}
          >
            No breach
          </p>
        ) : months === 0 ? (
          <p
            className="text-2xl font-semibold tabular-nums"
            style={{ color: "var(--status-error)" }}
          >
            Breached
          </p>
        ) : (
          <>
            <p
              className="text-3xl font-semibold tabular-nums leading-none"
              style={{ color }}
            >
              {months}
            </p>
            <p className="text-xs text-muted-foreground">
              months · {monthOffsetToLabel(months)}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="p-5 lg:col-span-3">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Summary</h2>
          <p className="text-xs text-muted-foreground">
            Based on current degradation inputs
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: `color-mix(in oklch, ${meta.color} 15%, transparent)`,
            color: meta.color,
          }}
        >
          {meta.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <CountdownCell
          months={monthsToMin}
          label={`Time to minimum (${MIN_THICKNESS} mm)`}
          color="var(--status-warning)"
        />
        <CountdownCell
          months={monthsToCritical}
          label={`Time to critical (${CRITICAL_THICKNESS} mm)`}
          color="var(--status-error)"
        />

        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">
            Recommended action
          </p>
          <ul className="mt-1 flex flex-col gap-1.5">
            {meta.actions.map((action) => (
              <li
                key={action}
                className="flex items-start gap-2 text-xs text-foreground"
              >
                <span
                  className="mt-0.5 size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
