import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "aside" | "article";
}) {
  return (
    <Tag
      className={cn(
        "rounded-lg border border-border bg-panel/80 backdrop-blur-sm shadow-[0_1px_0_0_oklch(1_0_0/4%)_inset]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PanelHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-border px-4 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        {icon ? <span className="mt-0.5 shrink-0 text-primary">{icon}</span> : null}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      title="This value is demo data, not a backend result"
      className={cn(
        "rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-warn",
        className,
      )}
    >
      demo
    </span>
  );
}
