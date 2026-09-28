import { Suspense, lazy, useEffect, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import type { SatelliteMapProps } from "./SatelliteMap";

const SatelliteMap = lazy(() => import("./SatelliteMap"));

function MapFallback() {
  return (
    <div className="grid-backdrop flex h-full w-full items-center justify-center bg-surface">
      <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading map tiles…
      </span>
    </div>
  );
}

export function MapLegend({ showSimilar }: { showSimilar?: boolean }) {
  const items = [
    { label: "Search result", color: "bg-primary" },
    { label: "Change detected", color: "bg-change" },
    { label: "Selected site", color: "bg-foreground" },
    { label: "AOI Boundary", color: "border border-foreground" },
  ];
  if (showSimilar) items.push({ label: "Similar site", color: "bg-success" });
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-md border border-border bg-popover/90 px-3 py-2 backdrop-blur">
      <p className="label-caps mb-1.5 flex items-center gap-1.5">
        <Layers className="h-3 w-3" /> Legend
      </p>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2 text-[11px] text-foreground">
            <span className={`h-2.5 w-2.5 rounded-full ${i.color}`} />
            {i.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Browser-only wrapper: Leaflet touches `window`, so it never renders on the server. */
export function MapPanel(props: SatelliteMapProps & { legend?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const { legend = true, ...mapProps } = props;

  // Map view state
  const [baseMap, setBaseMap] = useState("street"); // street | satellite | satelliteLabels
  const [showResults, setShowResults] = useState(true);
  const [showAOI, setShowAOI] = useState(true);
  const [showSimilar, setShowSimilar] = useState(false);

  // Detect if a satellite tile URL is configured
  const satelliteConfigured = Boolean(import.meta.env["VITE_MAP_TILE_URL"]);

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Controls overlay */}
      <div className="absolute top-2 right-2 z-[500] flex flex-col gap-1 rounded bg-popover/90 p-2 shadow-md backdrop-blur">
        <div className="flex items-center gap-1 text-xs">
          <span className="font-medium">Base</span>
          <button
            type="button"
            className={`px-1 ${baseMap === "street" ? "font-bold" : ""}`}
            onClick={() => setBaseMap("street")}
          >
            OSM
          </button>
          <button
            type="button"
            className={`px-1 ${baseMap === "satellite" ? "font-bold" : ""}`}
            onClick={() => setBaseMap("satellite")}
          >
            Sat
          </button>
          <button
            type="button"
            className={`px-1 ${baseMap === "satelliteLabels" ? "font-bold" : ""}`}
            onClick={() => setBaseMap("satelliteLabels")}
          >
            Sat+Lbl
          </button>
        </div>
        <div className="flex flex-col text-xs">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={showResults}
              onChange={(e) => setShowResults(e.target.checked)}
            />{" "}
            Results
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={showAOI}
              onChange={(e) => setShowAOI(e.target.checked)}
            />{" "}
            AOI
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={showSimilar}
              onChange={(e) => setShowSimilar(e.target.checked)}
            />{" "}
            Similar
          </label>
        </div>
      </div>

      {mounted ? (
        <Suspense fallback={<MapFallback />}>
          <SatelliteMap
            {...mapProps}
            baseMap={baseMap}
            showResults={showResults}
            showAOI={showAOI}
            showSimilar={showSimilar}
            satelliteConfigured={satelliteConfigured}
          />
        </Suspense>
      ) : (
        <MapFallback />
      )}
      {legend && mounted ? <MapLegend showSimilar={showSimilar} /> : null}
    </div>
  );
}
