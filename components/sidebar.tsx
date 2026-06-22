"use client";
import { cn } from "@/lib/utils";
import {
  Activity,
  Boxes,
  ChevronLeft,
  ChevronRight,
  LineChart,
  LogOut,
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
  { id: "dashboard2", label: "Overview & Factory", icon: Boxes },
  { id: "forecast", label: "Manual Forecast", icon: LineChart },
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
          className={cn(
            "absolute right-3 top-3 flex size-7 items-center justify-center rounded-md md:hidden",
            // ── ใช้ sidebar-foreground/60 แทน muted-foreground ──
            "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}

      {/* ── Logo + collapse toggle ── */}
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border py-4 transition-all duration-200",
          collapsed ? "flex-col gap-2 px-0 py-3" : "gap-3 px-4",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground ring-2 ring-sidebar-primary/40">
          <Activity className="size-5" aria-hidden="true" />
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
              PipeGuard
            </p>
            <p className="text-xs text-sidebar-foreground/50">Corrosion ML</p>
          </div>
        )}

        {onToggle && (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
            className={cn(
              "hidden md:flex shrink-0 items-center justify-center rounded-md border border-sidebar-border transition-colors",
              "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground",
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

      {/* ── Nav ── */}
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
                  ? // Active — Teal pill บน Indigo sidebar
                    "bg-sidebar-primary/20 text-sidebar-primary ring-1 ring-sidebar-primary/40"
                  : // Inactive — อ่านได้ แต่ไม่ compete กับ active
                    "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 transition-colors",
                  collapsed ? "size-5" : "size-4",
                  // Icon active จะใช้ sidebar-primary (Teal) แทน white เพื่อ contrast
                  isActive ? "text-sidebar-primary" : "",
                )}
                aria-hidden="true"
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto flex flex-col border-t border-sidebar-border",
          collapsed ? "gap-0 px-1.5 py-2" : "gap-2 px-2 py-3",
        )}
      >
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
          <div className="rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-normal opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-status-normal" />
              </span>
              <p className="text-xs font-medium text-sidebar-foreground">
                Inference engine live
              </p>
            </div>
            <p className="mt-1 text-xs text-sidebar-foreground/50">
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
            "flex items-center rounded-md text-sm font-medium transition-colors",
            "text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground",
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
