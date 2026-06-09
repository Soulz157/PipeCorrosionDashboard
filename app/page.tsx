"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Sidebar, type View } from "@/components/sidebar"
import { OverviewView } from "@/components/overview-view"
import { ForecastView } from "@/components/forecast-view"
import { LogsView } from "@/components/logs-view"
import { FactoryFloorView } from "@/components/factory-floor-view"
import { StreamlitView } from "@/components/streamlit-view"
import { DashboardV2View } from "@/components/dashboard-v2-view"
import { LoginScreen } from "@/components/login-screen"
import { isAuthenticated } from "@/lib/auth-store"

export default function Page() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [view, setView] = useState<View>("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setAuthed(isAuthenticated())
  }, [])

  if (authed === null) return null

  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthed(true)} />
  }

  // Dashboard v.2 — full-screen kiosk mode, no sidebar or header
  if (view === "dashboard2") {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background">
        <DashboardV2View onNavigateHome={() => setView("overview")} />
      </div>
    )
  }

  return (
    <>
      {/* Mobile nav drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileNavOpen(false)}
        />
        {/* Drawer */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-64 transition-transform duration-200",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar
            active={view}
            onChange={(v) => {
              setView(v)
              setMobileNavOpen(false)
            }}
            onLogout={() => {
              setAuthed(false)
              setMobileNavOpen(false)
            }}
            onClose={() => setMobileNavOpen(false)}
          />
        </div>
      </div>

      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar
            active={view}
            onChange={setView}
            onLogout={() => setAuthed(false)}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            view={view}
            onMobileMenuOpen={() => setMobileNavOpen(true)}
          />

          <main
            className={cn(
              "flex-1",
              view === "factory"
                ? "overflow-hidden"
                : "overflow-y-auto p-4 md:p-6",
            )}
          >
            {view === "overview" && <OverviewView />}
            {view === "forecast" && <ForecastView />}
            {view === "logs" && <LogsView />}
            {view === "factory" && <FactoryFloorView />}
            {view === "streamlit" && <StreamlitView />}
          </main>
        </div>
      </div>
    </>
  )
}
