import {
  CalendarDays,
  CloudSun,
  Image as ImageIcon,
  MapPin,
  Ruler,
  Satellite,
  Tags,
  RotateCcw,
} from "lucide-react";
import type { SearchFilters } from "@/services/api";
import { Button } from "@/components/common/Button";

const field =
  "h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground focus:border-primary/60";

export function FilterBar({
  filters,
  onChange,
}: {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
}) {
  const set = (patch: Partial<SearchFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="rounded-lg border border-border bg-panel/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="label-caps">Filters</span>
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <label className="space-y-1">
          <span className="label-caps flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Location
          </span>
          <input
            className={field}
            placeholder="Any area"
            value={filters.location ?? ""}
            onChange={(e) => set({ location: e.target.value || undefined })}
          />
        </label>

        <label className="space-y-1">
          <span className="label-caps flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> From
          </span>
          <input
            type="date"
            className={field}
            value={filters.dateFrom ?? ""}
            onChange={(e) => set({ dateFrom: e.target.value || undefined })}
          />
        </label>

        <label className="space-y-1">
          <span className="label-caps flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> To
          </span>
          <input
            type="date"
            className={field}
            value={filters.dateTo ?? ""}
            onChange={(e) => set({ dateTo: e.target.value || undefined })}
          />
        </label>

        <label className="space-y-1">
          <span className="label-caps flex items-center gap-1">
            <Satellite className="h-3 w-3" /> Sensor
          </span>
          <select
            className={field}
            value={filters.sensor ?? "any"}
            onChange={(e) => set({ sensor: e.target.value })}
          >
            <option value="any">Any sensor</option>
            <option value="Sentinel-2 L2A">Sentinel-2 L2A</option>
            <option value="Sentinel-1 GRD">Sentinel-1 GRD</option>
            <option value="Landsat-9 OLI-2">Landsat-9 OLI-2</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="label-caps flex items-center gap-1">
            <Satellite className="h-3 w-3" /> Satellite
          </span>
          <select
            className={field}
            value={filters.satellite ?? "any"}
            onChange={(e) => set({ satellite: e.target.value })}
          >
            <option value="any">Any satellite</option>
            <option value="Sentinel-2">Sentinel-2</option>
            <option value="Sentinel-1">Sentinel-1</option>
            <option value="Landsat-9">Landsat-9</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="label-caps flex items-center gap-1">
            <ImageIcon className="h-3 w-3" /> Quality
          </span>
          <select
            className={field}
            value={filters.quality ?? "any"}
            onChange={(e) => set({ quality: e.target.value })}
          >
            <option value="any">Any quality</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="label-caps flex items-center gap-1">
            <Ruler className="h-3 w-3" /> Resolution
          </span>
          <select
            className={field}
            value={filters.resolution ?? "any"}
            onChange={(e) => set({ resolution: e.target.value })}
          >
            <option value="any">Any resolution</option>
            <option value="10 m">10 m</option>
            <option value="20 m">20 m</option>
            <option value="30 m">30 m</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="label-caps flex items-center gap-1">
            <Tags className="h-3 w-3" /> Category
          </span>
          <select
            className={field}
            value={filters.category ?? "any"}
            onChange={(e) => set({ category: e.target.value })}
          >
            <option value="any">Any category</option>
            <option value="construction">Construction</option>
            <option value="road">Road</option>
            <option value="water">Water</option>
            <option value="vegetation">Vegetation</option>
            <option value="activity">Activity</option>
          </select>
        </label>
      </div>

      <label className="mt-3 block">
        <span className="label-caps flex items-center gap-1">
          <CloudSun className="h-3 w-3" /> Max cloud coverage — {filters.maxCloud ?? 100}%
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.maxCloud ?? 100}
          onChange={(e) => set({ maxCloud: Number(e.target.value) })}
          className="mt-2 w-full accent-[var(--color-primary)]"
        />
      </label>
    </div>
  );
}
