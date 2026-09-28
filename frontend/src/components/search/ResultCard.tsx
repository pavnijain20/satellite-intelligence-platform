import { Link } from "@tanstack/react-router";
import { ChevronDown, CloudSun, MapPin, Satellite } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { categoryMeta } from "@/data/mockAnalysis";
import type { SearchResult } from "@/data/types";
import { DemoTag } from "@/components/common/Panel";
import { Meter, Pill } from "@/components/common/Indicators";
import { Button } from "@/components/common/Button";

export function RankingBreakdown({ r }: { r: SearchResult }) {
  const rows = [
    { label: "Semantic relevance", value: r.ranking.semantic },
    { label: "Spatial match", value: r.ranking.spatial },
    { label: "Temporal relevance", value: r.ranking.temporal },
    { label: "Sensor match", value: r.ranking.sensor },
    {
      label: "Image quality",
      value:
        r.quality === "excellent"
          ? 1
          : r.quality === "good"
            ? 0.75
            : r.quality === "fair"
              ? 0.5
              : 0.25,
    },
    { label: "Cloud coverage", value: 1 - r.cloudCover / 100 },
    { label: "Change relevance", value: r.changeDetected ? 1 : 0 },
  ];
  return (
    <div className="space-y-2 rounded-md border border-border bg-surface/70 p-3">
      <p className="label-caps flex items-center gap-2">
        Ranking factors <DemoTag />
      </p>
      {rows.map((row) => (
        <Meter key={row.label} label={row.label} value={row.value} />
      ))}
      <p className="text-[11px] text-muted-foreground">
        Mock ranking components. Backend returns the retrieval scores that produced this ordering.
      </p>
    </div>
  );
}

export function ResultCard({
  result,
  selected,
  onSelect,
}: {
  result: SearchResult;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = categoryMeta[result.category]!;

  return (
    <article
      onClick={() => onSelect?.(result.id)}
      className={cn(
        "cursor-pointer rounded-lg border bg-panel/70 p-3 transition-colors",
        selected
          ? "border-primary/70 bg-accent/40 glow-primary"
          : "border-border hover:border-primary/40 hover:bg-accent/20",
      )}
    >
      <div className="flex gap-3">
        <img
          src={result.thumbnail}
          alt={`Satellite thumbnail for ${result.id}`}
          loading="lazy"
          width={96}
          height={96}
          className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary">{result.id}</span>
            <Pill tone={meta.tone as never}>
              {meta.icon} {meta.label}
            </Pill>
            {result.changeDetected && <Pill tone="change">Change</Pill>}
          </div>
          <h3 className="mt-1 truncate text-sm font-medium text-foreground">{result.location}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Satellite className="h-3 w-3" />
              {result.sensor}
            </span>
            <span>{result.date}</span>
            <span className="inline-flex items-center gap-1">
              <CloudSun className="h-3 w-3" />
              {result.cloudCover}% cloud
            </span>
            <span className="uppercase">
              {result.quality} · {result.resolution}
            </span>
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="min-w-32 flex-1">
              <Meter label="Confidence (demo)" value={result.relevance} />
              <DemoTag className="ml-1" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
              }}
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Ranking
              <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
            </button>
            <Link
              to="/analysis/$id"
              params={{ id: result.id }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="primary" size="sm">
                Open Analysis
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {open && (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <RankingBreakdown r={result} />
        </div>
      )}
    </article>
  );
}

export function ResultCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-panel/50 p-3">
      <div className="h-20 w-20 animate-pulse rounded-md bg-secondary/70" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 w-24 animate-pulse rounded bg-secondary/70" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-secondary/70" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary/70" />
        <div className="h-1.5 w-full animate-pulse rounded bg-secondary/70" />
      </div>
    </div>
  );
}
