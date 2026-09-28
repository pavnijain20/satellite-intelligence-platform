import { useState } from "react";
import { Cog, Map as MapIcon, Monitor, Satellite, Server } from "lucide-react";
import { Panel, PanelHeader } from "@/components/common/Panel";
import { Dot, Pill } from "@/components/common/Indicators";
import { SystemStatusPanel } from "@/components/layout/SystemStatusPanel";
import { sensors } from "@/data/mockSystemStatus";
import { API_BASE_URL } from "@/services/api";
import { useApp } from "@/context/AppContext";

function Toggle({ label, hint, defaultOn }: { label: string; hint: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 last:border-0">
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((o) => !o)}
        className={`h-5 w-9 shrink-0 rounded-full border transition-colors ${
          on ? "border-primary bg-primary/30" : "border-border bg-secondary"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-foreground transition-transform ${
            on ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const { backendHealth } = useApp();
  const backendTone =
    backendHealth.state === "connected"
      ? "ok"
      : backendHealth.state === "unavailable"
        ? "alert"
        : backendHealth.state === "checking"
          ? "info"
          : "warn";

  return (
    <div className="mx-auto w-full max-w-[80rem] space-y-4 p-4 md:p-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Cog className="h-5 w-5 text-primary" /> Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deployment, sensor, map and display configuration for this workstation.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="System"
            subtitle="Backend, model and local data"
            icon={<Server className="h-4 w-4" />}
          />
          <div className="space-y-3 p-4">
            <div className="rounded-md border border-border bg-surface/60 p-3">
              <p className="label-caps mb-1">Backend connection</p>
              <p className="break-all font-mono text-xs text-foreground">
                {API_BASE_URL || "Not configured"}
              </p>
              <div className="mt-2">
                <Pill tone={backendTone}>{backendHealth.label}</Pill>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Set VITE_API_BASE_URL to the FastAPI service URL; every screen then reads live data
                through the same API layer.
              </p>
            </div>
            <SystemStatusPanel />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Sensors"
            subtitle="Available imagery sources"
            icon={<Satellite className="h-4 w-4" />}
          />
          <ul className="divide-y divide-border">
            {sensors.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-foreground">{s.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {s.resolution} · revisit {s.revisit}
                  </p>
                </div>
                <span className="flex items-center gap-2 font-mono text-[11px]">
                  <Dot tone={s.ok ? "ok" : "warn"} />
                  {s.ok ? "Indexed" : "Not indexed"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader
            title="Map"
            subtitle="Tile source and geospatial behaviour"
            icon={<MapIcon className="h-4 w-4" />}
          />
          <div>
            <div className="border-b border-border px-4 py-3">
              <p className="label-caps mb-1">Tile provider</p>
              <p className="font-mono text-xs text-foreground">
                {import.meta.env["VITE_MAP_TILE_URL"] ??
                  "https://tile.openstreetmap.org/{z}/{x}/{y}.png"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Override VITE_MAP_TILE_URL to point at an offline tile mirror.
              </p>
            </div>
            <Toggle
              label="Show area-of-interest boundary"
              hint="Dashed AOI rectangle on the search map"
              defaultOn
            />
            <Toggle
              label="Auto-centre on selected site"
              hint="Fly the map to the selected result"
              defaultOn
            />
            <Toggle label="Cluster dense markers" hint="Group nearby detections at low zoom" />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Display"
            subtitle="Interface preferences"
            icon={<Monitor className="h-4 w-4" />}
          />
          <div>
            <Toggle
              label="High information density"
              hint="Compact tables and tighter spacing"
              defaultOn
            />
            <Toggle label="Reduce motion" hint="Disable transitions and map fly animations" />
            <Toggle label="Always expand provenance" hint="Open the provenance record by default" />
            <Toggle
              label="Show demo-data badges"
              hint="Mark every mock value in the interface"
              defaultOn
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
