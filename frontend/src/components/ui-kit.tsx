import { Loader2, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

export function BigButton({
  children,
  type = "button",
  onClick,
  disabled,
  loading,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "soft" | "outline";
  className?: string;
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:brightness-110",
    soft: "bg-accent text-accent-foreground hover:brightness-105",
    outline: "border-2 border-primary text-primary bg-card hover:bg-muted",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl px-6 text-lg font-bold shadow-soft transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {loading ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Notice({ message, tone = "error" }: { message: string; tone?: "error" | "info" }) {
  if (!message) return null;
  const toneStyles =
    tone === "error"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-border bg-secondary text-secondary-foreground";
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-2xl border p-4 text-base ${toneStyles}`}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-lg font-bold">
        {label}
      </label>
      {hint ? <p className="text-base text-muted-foreground">{hint}</p> : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-base font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border-2 border-input bg-card px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground/70";

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-12 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
      <p className="text-lg font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
