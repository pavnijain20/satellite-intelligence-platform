import { useState } from "react";
import { ChevronDown, FileStack } from "lucide-react";
import { Panel, PanelHeader } from "@/components/common/Panel";
import { cn } from "@/lib/utils";
import type { Provenance } from "@/data/types";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9.5rem_1fr] gap-3 border-b border-border px-4 py-2 last:border-0">
      <dt className="label-caps">{label}</dt>
      <dd className="break-words font-mono text-[11px] text-foreground">{value}</dd>
    </div>
  );
}

export function ProvenancePanel({ provenance }: { provenance: Provenance }) {
  const [open, setOpen] = useState(false);
  return (
    <Panel>
      <PanelHeader
        title="Provenance & source information"
        subtitle="Evidence chain for this investigation"
        icon={<FileStack className="h-4 w-4" />}
        actions={
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {open ? "Collapse" : "Expand"}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
        }
      />
      <dl className={cn("overflow-hidden transition-all", open ? "max-h-[60rem]" : "max-h-48")}>
        <Row label="Satellite / source" value={provenance.source} />
        <Row label="Sensor" value={provenance.sensor} />
        <Row label="Location" value={provenance.location} />
        <Row label="Coordinates" value={provenance.coordinates} />
        <Row label="Acquisition dates" value={provenance.acquisitionDates.join(" · ")} />
        <Row
          label="Image IDs"
          value={
            <ul className="space-y-0.5">
              {provenance.imageIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          }
        />
        <Row label="Data source" value={provenance.dataSource} />
        <Row label="Processing" value={provenance.processing} />
        <Row label="Model version" value={provenance.modelVersion} />
        <Row label="Analysis ID" value={provenance.analysisId} />
        <Row label="Processed at" value={provenance.processedAt} />
        <Row label="Licence" value={provenance.licence} />
      </dl>
      {!open && (
        <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          Expand for the full acquisition, processing and model record.
        </div>
      )}
    </Panel>
  );
}
