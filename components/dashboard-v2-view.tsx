"use client";

// Dashboard v2 — 3-level predictive-maintenance drill-down.
// Orchestrates: L1 isometric system flow → L2 model portal → L3 asset deep-dive.
// Holds the navigation state and a breadcrumb; each level is its own component.

import { useState } from "react";
import { sensorNodes } from "@/lib/mock-data";
import { Level1Flow } from "@/components/dashboard-v2/level1-flow";
import { Level2Portal } from "@/components/dashboard-v2/level2-portal";
import { Level3DeepDive } from "@/components/dashboard-v2/level3-deepdive";
import { ChevronRight, Home } from "lucide-react";
import { Header } from "./header";
import { Sidebar, type View } from "./sidebar";

type Level = 1 | 2 | 3;

const SCANLINE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(0deg,transparent,transparent 2px,var(--kiosk-grid) 2px,var(--kiosk-grid) 4px)",
};

const BAR_BG: React.CSSProperties = {
  background: "var(--kiosk-bg)",
  backdropFilter: "blur(14px)",
  ...SCANLINE,
};

export function DashboardV2View({
  onNavigateHome,
  onOpenStreamlit,
  onChangeView,
  onLogout,
}: {
  onNavigateHome?: () => void;
  onOpenStreamlit?: () => void;
  onChangeView?: (v: View) => void;
  onLogout?: () => void;
}) {
  const [level, setLevel] = useState<Level>(1);
  const [collapsed, setCollapsed] = useState(false);
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);

  const node = nodeId
    ? (sensorNodes.find((n) => n.id === nodeId) ?? null)
    : null;
  const model =
    node && modelId
      ? (node.models.find((m) => m.modelId === modelId) ?? null)
      : null;

  // Guard against inconsistent state (e.g. missing node/model).
  const effLevel: Level = level === 3 && model ? 3 : level >= 2 && node ? 2 : 1;

  const goSystem = () => {
    setLevel(1);
    setNodeId(null);
    setModelId(null);
  };
  const goNode = () => {
    setLevel(2);
    setModelId(null);
  };
  const selectNode = (id: string) => {
    setNodeId(id);
    setModelId(null);
    setLevel(2);
  };
  const selectModel = (id: string) => {
    setModelId(id);
    setLevel(3);
  };

  return (
    <div className="flex h-full w-full bg-background">
      {/* ── Sidebar (desktop) ──────────────────────────────────── */}
      <div className="hidden md:block">
        <Sidebar
          active="dashboard2"
          onChange={(v) => onChangeView?.(v)}
          onLogout={() => onLogout?.()}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
      </div>

      {/* ── Content column ─────────────────────────────────────── */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header view="dashboard2" onMobileMenuOpen={undefined} />
        {/* ── Breadcrumb / level bar ───────────────────────────── */}
        <header
        className="relative z-30 flex h-12 shrink-0 items-center gap-1 px-2"
        style={{
          borderBottom: "1px solid var(--kiosk-hairline)",
          ...BAR_BG,
        }}
      >
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="mr-1 flex items-center gap-2 rounded-[3px] px-3 py-1.5 transition-colors hover:bg-foreground/5"
            style={{ borderRight: "1px solid var(--kiosk-hairline)" }}
            aria-label="Return to fleet"
          >
            <Home
              className="size-3.5"
              style={{ color: "var(--muted-foreground)" }}
            />
            <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Fleet
            </span>
          </button>
        )}

        <Crumb label="System Flow" active={effLevel === 1} onClick={goSystem} />
        {node && (
          <>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            <Crumb
              label={node.location}
              active={effLevel === 2}
              onClick={goNode}
            />
          </>
        )}
        {node && model && (
          <>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            <Crumb
              label={model.modelId}
              active={effLevel === 3}
              onClick={() => setLevel(3)}
            />
          </>
        )}

        {/* Level indicator dots */}
        <div className="ml-auto flex items-center gap-1.5 pr-2">
          {[1, 2, 3].map((l) => (
            <span
              key={l}
              className="size-1.5 rounded-full transition-colors"
              style={{
                background:
                  effLevel === l
                    ? "var(--primary)"
                    : "var(--kiosk-hairline-strong)",
                boxShadow:
                  effLevel === l ? "0 0 6px var(--primary)" : undefined,
              }}
            />
          ))}
        </div>
      </header>

      {/* ── Level stage ────────────────────────────────────────── */}
      <main className="relative min-h-0 flex-1">
        <div
          key={effLevel}
          className="absolute inset-0 animate-in fade-in duration-300"
        >
          {effLevel === 1 && (
            <div className="h-full">
              <Level1Flow onSelectNode={selectNode} />
            </div>
          )}
          {effLevel === 2 && node && (
            <div className="kiosk-trend-scroll h-full overflow-y-auto">
              <Level2Portal node={node} onSelectModel={selectModel} />
            </div>
          )}
          {effLevel === 3 && node && model && (
            <div className="kiosk-trend-scroll h-full overflow-y-auto">
              <Level3DeepDive
                node={node}
                model={model}
                onOpenStreamlit={onOpenStreamlit}
              />
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}

function Crumb({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="max-w-[40vw] truncate rounded-[3px] px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-foreground/5"
      style={{
        color: active ? "var(--foreground)" : "var(--muted-foreground)",
      }}
    >
      {label}
    </button>
  );
}
