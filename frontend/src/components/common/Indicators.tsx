import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import type { AnalysisStatus, CheckStatus } from "@/data/types";

const toneMap = {
  ok: "border-ok/40 bg-ok/10 text-ok",
  warn: "border-warn/40 bg-warn/10 text-warn",
  alert: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-primary/40 bg-primary/10 text-primary",
  change: "border-change/40 bg-change/10 text-change",
  muted: "border-border bg-secondary text-muted-foreground",
} as const;

export type Tone = keyof typeof toneMap;

export function Pill({
  tone = "muted",
  children,
  className,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider",
        toneMap[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function Dot({ tone = "ok", pulse }: { tone?: Tone; pulse?: boolean }) {
  const bg =
    tone === "ok"
      ? "bg-ok"
      : tone === "warn"
        ? "bg-warn"
        : tone === "alert"
          ? "bg-destructive"
          : tone === "change"
            ? "bg-change"
            : "bg-primary";
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0">
      {pulse ? (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            bg,
          )}
        />
      ) : null}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", bg)} />
    </span>
  );
}

export function CheckBadge({ status }: { status: CheckStatus }) {
  const map = {
    clear: { tone: "ok" as Tone, label: "Clear", Icon: CheckCircle2 },
    review: { tone: "warn" as Tone, label: "Review required", Icon: CircleAlert },
    warning: { tone: "alert" as Tone, label: "Warning", Icon: AlertTriangle },
  };
  const { tone, label, Icon } = map[status];
  return (
    <Pill tone={tone} icon={<Icon className="h-3 w-3" aria-hidden />}>
      {label}
    </Pill>
  );
}

export function AnalysisStatusBadge({ status }: { status: AnalysisStatus }) {
  const map: Record<AnalysisStatus, { tone: Tone; label: string; spin?: boolean }> = {
    queued: { tone: "muted", label: "Queued" },
    processing: { tone: "info", label: "Processing", spin: true },
    complete: { tone: "ok", label: "Analysis complete" },
    warning: { tone: "warn", label: "Completed with warnings" },
    failed: { tone: "alert", label: "Analysis failed" },
  };
  const s = map[status];
  return (
    <Pill
      tone={s.tone}
      icon={
        s.spin ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <Dot tone={s.tone} />
      }
    >
      {s.label}
    </Pill>
  );
}

export function Meter({
  value,
  label,
  tone = "info",
  showValue = true,
}: {
  value: number;
  label?: string;
  tone?: Tone;
  showValue?: boolean;
}) {
  const pct = Math.round(value * 100);
  const bar =
    tone === "ok"
      ? "bg-ok"
      : tone === "warn"
        ? "bg-warn"
        : tone === "change"
          ? "bg-change"
          : "bg-primary";
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between gap-2">
          {label ? <span className="text-xs text-muted-foreground">{label}</span> : <span />}
          {showValue ? <span className="font-mono text-xs text-foreground">{pct}%</span> : null}
        </div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "value"}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-secondary/70", className)} />;
}

export function StateBlock({
  icon,
  title,
  detail,
  action,
  tone = "muted",
}: {
  icon?: ReactNode;
  title: string;
  detail?: string;
  action?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className={cn("rounded-full border p-3", toneMap[tone])}>{icon}</div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {detail ? <p className="max-w-sm text-xs text-muted-foreground">{detail}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
