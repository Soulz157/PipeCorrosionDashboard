"use client";

import { Bell, Menu, Search } from "lucide-react";
import { fleetSummary, sensorNodes } from "@/lib/mock-data";

const TITLES: Record<string, { title: string; sub: string }> = {
  overview: {
    title: "Overview & Factory",
    sub: "Fleet status, KPIs, wall-thickness trends and 2.5D pipe network map",
  },
  forecast: {
    title: "Manual Forecast",
    sub: "Run an ad-hoc thickness decay prediction from custom inputs",
  },
  logs: {
    title: "Model Logs & Evaluation",
    sub: "Execution history and accuracy metrics for deployed models",
  },
  factory: {
    title: "Factory Floor",
    sub: "Full-screen 2.5D pipe network with live monitoring nodes",
  },
  dashboard2: {
    title: "Dashboard",
    sub: "Full-screen factory floor with live status HUD and thickness trend overlay",
  },
  streamlit: {
    title: "ML Studio",
    sub: "Streamlit training interface — model runs, registry and live prediction",
  },
};

export function Header({
  view,
  onMobileMenuOpen,
}: {
  view: string;
  onMobileMenuOpen?: () => void;
}) {
  const meta = TITLES[view] ?? TITLES.overview;

  const alertCount = sensorNodes.filter(
    (n) => n.status !== "offline" && n.thickness <= n.minThicknessTarget * 1.2,
  ).length;

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onMobileMenuOpen && (
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={onMobileMenuOpen}
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <Menu className="size-4" aria-hidden="true" />
          </button>
        )}
        <div>
          <h1 className="text-pretty text-xl font-semibold tracking-tight text-foreground">
            {meta.title}
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            {meta.sub}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 sm:flex">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search assets..."
            className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search assets"
          />
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
          <span className="size-2 rounded-full bg-status-normal" />
          <span className="text-sm font-medium text-foreground">
            {fleetSummary.modelsOnline}/{fleetSummary.totalModels}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            models online
          </span>
        </div>

        <button
          type="button"
          aria-label={`Notifications — ${alertCount} active alert${alertCount !== 1 ? "s" : ""}`}
          className="relative flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-4" aria-hidden="true" />
          {alertCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: "var(--status-error)" }}
              aria-hidden="true"
            >
              {alertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
