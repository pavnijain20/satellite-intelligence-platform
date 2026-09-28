import { CalendarClock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineObservation } from "@/data/types";
import { Pill } from "@/components/common/Indicators";

export function Timeline({
  observations,
  selectedId,
  onSelect,
  earliestSupportedDate,
}: {
  observations: TimelineObservation[];
  selectedId: string;
  onSelect: (id: string) => void;
  earliestSupportedDate: string;
}) {
  const selected = observations.find((o) => o.id === selectedId) ?? observations[0];
  const firstChangeIndex = observations.findIndex((o) => o.changeFlag);

  return (
    <div className="space-y-4 p-4">
      <div className="relative pt-6">
        <div className="absolute left-0 right-0 top-12 h-px bg-border" />
        {firstChangeIndex >= 0 && (
          <div
            className="absolute top-12 h-px bg-change"
            style={{
              left: `${(firstChangeIndex / (observations.length - 1)) * 100}%`,
              right: "0%",
            }}
          />
        )}
        <ol className="relative flex items-start justify-between">
          {observations.map((o) => {
            const active = o.id === selected?.id;
            const isEarliest = o.date === earliestSupportedDate;
            return (
              <li key={o.id} className="flex w-0 flex-1 flex-col items-center">
                {isEarliest && (
                  <span className="mb-1 inline-flex items-center gap-1 whitespace-nowrap rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-warn">
                    <Flag className="h-2.5 w-2.5" /> earliest
                  </span>
                )}
                <button
                  onClick={() => onSelect(o.id)}
                  aria-current={active ? "true" : undefined}
                  aria-label={`Observation ${o.date}${o.changeFlag ? ", change flagged" : ""}`}
                  className={cn(
                    "relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                    o.changeFlag ? "border-change" : "border-primary",
                    active ? "scale-125 bg-foreground" : "bg-background hover:scale-110",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      o.changeFlag ? "bg-change" : "bg-primary",
                      active && "bg-background",
                    )}
                  />
                </button>
                <span
                  className={cn(
                    "mt-2 text-center font-mono text-[10px] leading-tight",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {o.date}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {selected && (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface/70 p-3 sm:flex-row">
          <img
            src={selected.image}
            alt={`Observation ${selected.date}`}
            loading="lazy"
            className="h-28 w-full rounded border border-border object-cover sm:w-40"
          />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="info" icon={<CalendarClock className="h-3 w-3" />}>
                {selected.date}
              </Pill>
              {selected.changeFlag ? (
                <Pill tone="change">Change flagged</Pill>
              ) : (
                <Pill tone="muted">No change</Pill>
              )}
              {selected.date === earliestSupportedDate && (
                <Pill tone="warn">Earliest supported observation</Pill>
              )}
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">
              {selected.sensor} · {selected.cloudCover}% cloud · quality {selected.quality}
            </p>
            {selected.note ? (
              <p className="text-xs leading-relaxed text-foreground">{selected.note}</p>
            ) : null}
          </div>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">
        The highlighted segment marks the period in which change was first supported by imagery —
        not a verified activity start date.
      </p>
    </div>
  );
}
