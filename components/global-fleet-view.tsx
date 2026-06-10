"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  STATUS_META,
  companyFleetData,
  globalAlertCount,
  type CompanyFleetEntry,
  type MiniPipeNode,
  type Status,
} from "@/lib/mock-data";
import type { View } from "@/components/sidebar";

const STATUS_PRIORITY: Record<Status, number> = {
  error: 3,
  warning: 2,
  offline: 1,
  normal: 0,
};

function worstStatus(a: Status, b: Status): Status {
  return STATUS_PRIORITY[a] >= STATUS_PRIORITY[b] ? a : b;
}

const STATUS_ICON: Record<Status, typeof AlertCircle> = {
  error: AlertCircle,
  warning: AlertTriangle,
  normal: CheckCircle2,
  offline: WifiOff,
};

function MiniSchematic({
  nodes,
  connections,
}: Pick<CompanyFleetEntry, "nodes" | "connections">) {
  const nodeMap = new Map<string, MiniPipeNode>(nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox="0 0 160 60" className="h-14 w-full" aria-hidden="true">
      <rect width="160" height="60" rx="4" fill="var(--secondary)" />
      {connections.map((conn) => {
        const a = nodeMap.get(conn.from);
        const b = nodeMap.get(conn.to);
        if (!a || !b) return null;
        const ws = worstStatus(a.status, b.status);
        return (
          <line
            key={`${conn.from}-${conn.to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={STATUS_META[ws].token}
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
      {nodes.map((node) => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={5}
          fill={STATUS_META[node.status].token}
        />
      ))}
    </svg>
  );
}

function CompanyCard({
  company,
  onViewDashboard,
}: {
  company: CompanyFleetEntry;
  onViewDashboard: () => void;
}) {
  const StatusIcon = STATUS_ICON[company.overallStatus];
  return (
    <article className="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold text-primary">
            {company.logoInitials}
          </div>
          <span className="text-sm font-semibold leading-tight text-foreground">
            {company.name}
          </span>
        </div>
        <StatusIcon
          className="mt-0.5 size-5 shrink-0"
          style={{ color: STATUS_META[company.overallStatus].token }}
          aria-label={`Overall status: ${company.overallStatus}`}
        />
      </div>

      <MiniSchematic nodes={company.nodes} connections={company.connections} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Critical assets</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {company.criticalAssets}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Mean confidence</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {Math.round(company.meanConfidence * 100)}%
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-auto w-full justify-center text-xs"
        onClick={onViewDashboard}
      >
        View Dashboard →
      </Button>
    </article>
  );
}

export function GlobalFleetView({ onChange }: { onChange: (v: View) => void }) {
  const siteCount = companyFleetData.length;

  return (
    <div className="flex flex-col gap-6">
      {globalAlertCount > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-xs"
        >
          <AlertCircle
            className="size-4 shrink-0"
            style={{ color: "var(--status-error)" }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">
            <span
              className="font-semibold tabular-nums"
              style={{ color: "var(--status-error)" }}
            >
              {globalAlertCount}
            </span>{" "}
            critical alert{globalAlertCount !== 1 ? "s" : ""} across {siteCount}{" "}
            monitored sites — immediate inspection required
          </span>
        </div>
      )}

      <section aria-label="Company fleet overview">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {companyFleetData.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onViewDashboard={() => onChange("dashboard2")}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
