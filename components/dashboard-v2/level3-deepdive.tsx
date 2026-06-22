"use client";

// Level 3 — technical asset deep-dive.
// Radically simplified: exactly two components in a split-screen workspace —
// (A) process-line location graphic, (B) embedded Streamlit RUL forecasting
// mockup. No CAD side-view, trend chart, scenario cards, or training box.

import { type NodeModel, type SensorNode } from "@/lib/mock-data";
import { LocationGraphic } from "./location-graphic";
import { StreamlitForecast } from "./streamlit-forecast";

export function Level3DeepDive({
  node,
  model,
  onOpenStreamlit,
}: {
  node: SensorNode;
  model: NodeModel;
  onOpenStreamlit?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">
            Level 03 · Asset Deep-Dive
          </p>
          <h2 className="mt-1 font-mono text-xl font-bold tracking-tight text-foreground">
            {node.location}
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          <span
            className="rounded-[3px] border px-2 py-1"
            style={{ borderColor: "var(--kiosk-hairline)", background: "var(--kiosk-panel)" }}
          >
            {node.id}
          </span>
          <span
            className="rounded-[3px] border px-2 py-1"
            style={{ borderColor: "var(--kiosk-hairline)", background: "var(--kiosk-panel)", color: "var(--primary)" }}
          >
            {model.modelId}
          </span>
        </div>
      </header>

      {/* Split workspace: location graphic | Streamlit forecasting mockup */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-2">
        <LocationGraphic node={node} />
        <StreamlitForecast node={node} model={model} onOpenStreamlit={onOpenStreamlit} />
      </div>
    </div>
  );
}
