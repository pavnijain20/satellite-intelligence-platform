import { Link } from "@tanstack/react-router";
import { Copy, Map as MapIcon } from "lucide-react";
import { Panel, PanelHeader } from "@/components/common/Panel";
import { Meter, Pill } from "@/components/common/Indicators";
import { Button } from "@/components/common/Button";
import { categoryMeta } from "@/data/mockAnalysis";
import type { SimilarSite } from "@/data/types";

export function SimilarSites({ sites }: { sites: SimilarSite[] }) {
  return (
    <Panel>
      <PanelHeader
        title="Similar sites"
        subtitle="Nearest neighbours in the retrieval index (demo similarity)"
        icon={<Copy className="h-4 w-4" />}
        actions={
          <Link to="/search">
            <Button variant="outline" size="sm">
              <MapIcon className="h-3.5 w-3.5" /> View on map
            </Button>
          </Link>
        }
      />
      <ul className="grid gap-3 p-4 sm:grid-cols-2">
        {sites.map((s) => {
          const meta = categoryMeta[s.category]!;
          return (
            <li key={s.id} className="rounded-md border border-border bg-surface/60 p-2.5">
              <div className="flex gap-2.5">
                <img
                  src={s.thumbnail}
                  alt={`Thumbnail for ${s.id}`}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-primary">{s.id}</span>
                    <Pill tone={meta.tone as never}>
                      {meta.icon} {meta.label}
                    </Pill>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-foreground">{s.location}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{s.date}</p>
                </div>
              </div>
              <div className="mt-2 flex items-end gap-2">
                <div className="flex-1">
                  <Meter label="Similarity" value={s.similarity} />
                </div>
                <Link to="/analysis/$id" params={{ id: s.id }}>
                  <Button size="sm" variant="outline">
                    Open
                  </Button>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
