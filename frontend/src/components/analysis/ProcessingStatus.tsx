import { Check, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { processingStages } from "@/data/mockAnalysis";
import { Meter } from "@/components/common/Indicators";

export function ProcessingStatus({
  stage,
  failed,
}: {
  /** Index of the stage currently running; equals stages.length when complete. */
  stage: number;
  failed?: boolean;
}) {
  const pct = Math.min(1, stage / processingStages.length);
  return (
    <div className="space-y-3 p-4">
      <ol className="space-y-1.5">
        {processingStages.map((s, i) => {
          const done = i < stage;
          const active = i === stage && !failed;
          return (
            <li
              key={s}
              className={cn(
                "flex items-center gap-2.5 rounded px-2 py-1 text-xs transition-colors",
                done && "text-foreground",
                active && "bg-primary/10 text-primary",
                !done && !active && "text-muted-foreground",
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 text-ok" />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Circle className="h-3.5 w-3.5 opacity-40" />
              )}
              <span>{s}</span>
            </li>
          );
        })}
      </ol>
      <Meter
        value={pct}
        label={failed ? "Analysis failed" : pct === 1 ? "Complete" : "Processing"}
        tone={failed ? "warn" : pct === 1 ? "ok" : "info"}
      />
    </div>
  );
}
