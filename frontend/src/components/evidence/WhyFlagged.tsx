import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Radar,
} from "lucide-react";
import type { AnalysisRecord } from "@/data/types";
import { Pill } from "@/components/common/Indicators";
import { DemoTag } from "@/components/common/Panel";

export function WhyFlagged({ record }: { record: AnalysisRecord }) {
  const falseAlarmFactors = [
    {
      label: "Cloud contamination",
      status: "Low",
      detail: "Minimal cloud interference in the supporting observations.",
    },
    {
      label: "Seasonal variation",
      status: "Low",
      detail: "Observed change is not fully explained by expected seasonal variation.",
    },
    {
      label: "Image registration",
      status: "Low",
      detail: "Image alignment is sufficiently consistent for comparison.",
    },
    {
      label: "Sensor differences",
      status: "Review",
      detail: "Differences between sensors may affect visual comparison.",
    },
    {
      label: "Temporal inconsistency",
      status: "Low",
      detail: "The change is supported across multiple observations.",
    },
  ];

  return (
    <section
      aria-labelledby="why-flagged-title"
      className="relative overflow-hidden rounded-lg border border-primary/40 bg-gradient-to-br from-primary/10 via-panel to-panel"
    >
      <div className="scanline pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      {/* Header */}
      <header className="relative flex items-center justify-between gap-3 border-b border-primary/25 px-4 py-3">
        <h2
          id="why-flagged-title"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <Lightbulb className="h-4 w-4 text-primary" />
          Why was this flagged?
        </h2>

        <DemoTag />
      </header>

      <div className="relative grid gap-4 p-4 lg:grid-cols-2">
        {/* Detected Change */}
        <div className="lg:col-span-2 rounded-md border border-border bg-background/40 p-3">
          <p className="label-caps mb-1 flex items-center gap-1.5">
            <Radar className="h-3 w-3" />
            Detected change
          </p>

          <p className="text-sm leading-relaxed text-foreground">{record.summary}</p>
        </div>

        {/* Evidence */}
        <div className="rounded-md border border-border bg-background/40 p-3">
          <p className="label-caps mb-2">Evidence</p>

          <ul className="space-y-1.5">
            {record.evidence.map((e) => (
              <li key={e.label} className="flex items-start gap-2 text-xs text-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ok" />

                <span>
                  <span className="font-medium">{e.label}:</span>{" "}
                  <span className="text-muted-foreground">{e.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Possible Uncertainty */}
        <div className="rounded-md border border-border bg-background/40 p-3">
          <p className="label-caps mb-2 flex items-center gap-1.5">
            <HelpCircle className="h-3 w-3" />
            Possible uncertainty
          </p>

          <ul className="space-y-1.5">
            {record.uncertainty.map((u) => (
              <li key={u} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warn" />
                {u}
              </li>
            ))}
          </ul>
        </div>

        {/* Potential False-Alarm Factors */}
        <div className="lg:col-span-2 rounded-md border border-warn/35 bg-warn/5 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="label-caps flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-warn" />
              Potential false-alarm factors
            </p>

            <DemoTag />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {falseAlarmFactors.map((factor) => (
              <div
                key={factor.label}
                className="rounded-md border border-border bg-background/40 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">{factor.label}</span>

                  {factor.status === "Review" ? (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warn" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-ok" />
                  )}
                </div>

                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {factor.status}
                </p>

                <p className="text-[11px] leading-relaxed text-muted-foreground">{factor.detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            These factors indicate conditions that may affect change-detection reliability. They
            should be considered during analyst review.
          </p>
        </div>

        {/* Earliest Supported Observation */}
        <div className="lg:col-span-2 flex flex-wrap items-center gap-3 rounded-md border border-warn/35 bg-warn/5 p-3">
          <p className="label-caps flex items-center gap-1.5">
            <CalendarRange className="h-3 w-3" />
            Earliest supported observation
          </p>

          <span className="font-mono text-lg text-warn">{record.earliestSupportedDate}</span>

          <div className="flex flex-wrap gap-1.5">
            {record.supportingObservations.map((d) => (
              <Pill key={d} tone="muted">
                {d}
              </Pill>
            ))}
          </div>

          <p className="w-full text-[11px] text-muted-foreground">
            This is the first observation that supports the change — activity may have begun at any
            point since the previous clear observation.
          </p>
        </div>
      </div>
    </section>
  );
}
