"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Globe2,
  LayoutDashboard,
  LineChart,
  LogOut,
  Network,
  ScrollText,
  X,
} from "lucide-react";
import { logout } from "@/lib/auth-store";

export type View =
  | "fleet"
  | "overview"
  | "forecast"
  | "logs"
  | "factory"
  | "streamlit"
  | "dashboard2";

const NAV: { id: View; label: string; icon: typeof Activity }[] = [
  { id: "fleet", label: "Global Fleet View", icon: Globe2 },
  { id: "dashboard2", label: "Overview & Factory", icon: Boxes },
  // { id: "overview", label: "Dashboard v.2", icon: LayoutDashboard },
  { id: "forecast", label: "Manual Forecast", icon: LineChart },
  { id: "logs", label: "Model Logs & Eval", icon: ScrollText },
  { id: "factory", label: "Factory Floor", icon: Network },
  { id: "streamlit", label: "ML Studio", icon: Cpu },
];

export function Sidebar({
  active,
  onChange,
  onLogout,
  collapsed = false,
  onToggle,
  onClose,
}: {
  active: View;
  onChange: (v: View) => void;
  onLogout: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}) {
  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-14" : "w-64",
      )}
    >
      {/* Mobile close button */}
      {onClose && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}

      {/* Logo + collapse toggle */}
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border py-4 transition-all duration-200",
          collapsed ? "flex-col gap-2 px-0 py-3" : "gap-3 px-4",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Activity className="size-5" aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
              PipeGuard
            </p>
            <p className="text-xs text-muted-foreground">Corrosion ML</p>
          </div>
        )}
        {onToggle && (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
            className={cn(
              "hidden md:flex shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-card/30 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed ? "size-8 w-full" : "size-8",
            )}
          >
            {collapsed ? (
              <ChevronRight className="size-3.5" aria-hidden="true" />
            ) : (
              <ChevronLeft className="size-3.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav
        className={cn(
          "flex flex-col gap-0.5 py-3",
          collapsed ? "px-1.5" : "px-2",
        )}
        aria-label="Primary"
      >
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              title={collapsed ? label : undefined}
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                id === "factory" && isActive && "ring-1 ring-primary/30",
              )}
            >
              <Icon
                className={cn("shrink-0", collapsed ? "size-5" : "size-4")}
                aria-hidden="true"
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom: status + logout */}
      <div
        className={cn(
          "mt-auto flex flex-col border-t border-sidebar-border",
          collapsed ? "gap-0 px-1.5 py-2" : "gap-2 px-2 py-3",
        )}
      >
        {/* Inference status */}
        {collapsed ? (
          <div
            className="flex h-10 items-center justify-center"
            title="Inference engine live"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-normal opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-status-normal" />
            </span>
          </div>
        ) : (
          <div className="rounded-md border border-sidebar-border bg-card/50 p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-normal opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-status-normal" />
              </span>
              <p className="text-xs font-medium text-sidebar-foreground">
                Inference engine live
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Streaming predictions every 30s
            </p>
          </div>
        )}

        {/* Logout */}
        <button
          type="button"
          title={collapsed ? "Sign out" : undefined}
          onClick={() => {
            logout();
            onLogout();
          }}
          className={cn(
            "flex items-center rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2",
          )}
        >
          <LogOut
            className={cn("shrink-0", collapsed ? "size-5" : "size-4")}
            aria-hidden="true"
          />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
