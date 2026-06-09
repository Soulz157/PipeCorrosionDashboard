"use client";

import { useState } from "react";
import { Activity, Eye, EyeOff, Lock, User } from "lucide-react";
import { login } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Small artificial delay to prevent instant feedback that reveals timing
    setTimeout(() => {
      const ok = login(username.trim(), password);
      setLoading(false);
      if (ok) {
        onSuccess();
      } else {
        setError("Invalid username or password.");
      }
    }, 400);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-xl border border-border bg-card shadow-lg">
            <Activity className="size-7 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              PipeGuard
            </h1>
            <p className="text-sm text-muted-foreground">
              Corrosion Prediction Dashboard
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xl">
          <h2 className="mb-5 text-sm font-semibold text-foreground">
            Sign in to continue
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="username"
                className="text-xs text-muted-foreground"
              >
                Username
              </Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="password"
                className="text-xs text-muted-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-(--status-error)/30 bg-(--status-error)/10 px-3 py-2 text-xs font-medium text-[var(--status-error)]"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 w-full font-medium"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Default credentials:{" "}
          <span className="font-mono text-foreground">admin</span> /{" "}
          <span className="font-mono text-foreground">pipeguard2024</span>
        </p>
      </div>
    </div>
  );
}
