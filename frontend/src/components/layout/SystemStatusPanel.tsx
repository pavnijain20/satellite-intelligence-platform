import { useApp } from "@/context/AppContext";
import { mockSystemStatus, type ConnectivityMode } from "@/data/mockSystemStatus";
import { Dot, Pill, type Tone } from "@/components/common/Indicators";
import { cn } from "@/lib/utils";

export const modeMeta: Record<ConnectivityMode, { label: string; tone: Tone }> = {
  online: { label: "Online", tone: "ok" },
  local: { label: "Local Mode", tone: "ok" },
  syncing: { label: "Syncing", tone: "info" },
  limited: { label: "Limited Connectivity", tone: "warn" },
  offline: { label: "Offline", tone: "alert" },
};

export function SystemModeBadge({ compact }: { compact?: boolean }) {
  const { mode } = useApp();
  const meta = modeMeta[mode];
  return (
    <Pill tone={meta.tone} icon={<Dot tone={meta.tone} pulse={mode === "syncing"} />}>
      {compact ? meta.label.split(" ")[0] : meta.label}
    </Pill>
  );
}

export function SystemStatusPanel({ className }: { className?: string }) {
  const { mode, setMode, lastSync, backendHealth } = useApp();
  const backendTone: Tone =
    backendHealth.state === "connected"
      ? "ok"
      : backendHealth.state === "unavailable"
        ? "alert"
        : backendHealth.state === "checking"
          ? "info"
          : "warn";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="label-caps">System status</span>
        <SystemModeBadge />
      </div>
      <dl className="divide-y divide-border overflow-hidden rounded-md border border-border">
        {mockSystemStatus.components.map((c) => (
          <div key={c.label} className="flex items-center justify-between gap-3 px-3 py-2">
            <dt className="text-xs text-muted-foreground">{c.label}</dt>
            <dd className="flex items-center gap-2 font-mono text-xs text-foreground">
              <Dot tone={c.ok ? "ok" : "warn"} />
              {c.value}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <dt className="sr-only">Backend</dt>
          <dd className="flex items-center gap-2 font-mono text-xs text-foreground">
            <Dot tone={backendTone} pulse={backendHealth.state === "checking"} />
            {backendHealth.label}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <dt className="text-xs text-muted-foreground">Last Sync</dt>
          <dd className="font-mono text-xs text-foreground">{lastSync}</dd>
        </div>
      </dl>
      <label className="block">
        <span className="label-caps">Simulate connectivity</span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as ConnectivityMode)}
          className="mt-1 w-full rounded-md border border-input bg-surface px-2 py-1.5 text-xs text-foreground"
        >
          {Object.entries(modeMeta).map(([key, m]) => (
            <option key={key} value={key}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Offline operation is displayed only. Local caching and tile mirroring are wired through the
        API service for a later backend build.
      </p>
    </div>
  );
}
