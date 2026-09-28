import { CalendarCheck2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Panel, PanelHeader, DemoTag } from "@/components/common/Panel";
import { CheckBadge, Meter, Pill } from "@/components/common/Indicators";
import type { AnalysisRecord } from "@/data/types";

export function ConfidencePanel({ record }: { record: AnalysisRecord }) {
  return (
    <Panel>
      <PanelHeader
        title="Confidence & evidence"
        subtitle="Detection support reported by the analysis pipeline"
        icon={<ShieldCheck className="h-4 w-4" />}
        actions={<DemoTag />}
      />
      <div className="space-y-4 p-4">
        <div className="rounded-md border border-border bg-surface/70 p-3">
          <div className="flex items-baseline justify-between">
            <span className="label-caps">Overall confidence</span>
            <span className="font-mono text-2xl text-foreground">
              {Math.round(record.confidence * 100)}%
            </span>
          </div>
          <Meter
            value={record.confidence}
            tone={record.confidence > 0.75 ? "ok" : "warn"}
            showValue={false}
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Demo value. Confidence is produced by the backend change-detection model and is not
            computed in the browser.
          </p>
        </div>

        <ul className="space-y-2.5">
          {record.evidence.map((e) => (
            <li key={e.label} className="rounded-md border border-border bg-surface/50 p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">{e.label}</span>
                <CheckBadge status={e.status} />
              </div>
              <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">{e.detail}</p>
              <Meter value={e.score} />
            </li>
          ))}
        </ul>

        <div>
          <p className="label-caps mb-1.5 flex items-center gap-1.5">
            <CalendarCheck2 className="h-3 w-3" /> Supporting observations
          </p>
          <div className="flex flex-wrap gap-2">
            {record.supportingObservations.map((d) => (
              <Pill key={d} tone="info">
                {d}
              </Pill>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function WarningsPanel({ record }: { record: AnalysisRecord }) {
  const counts = record.warnings.reduce(
    (acc, w) => ({ ...acc, [w.status]: (acc[w.status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );
  return (
    <Panel>
      <PanelHeader
        title="Potential false-alarm factors"
        subtitle="Displayed for analyst judgement — not eliminated"
        icon={<ShieldAlert className="h-4 w-4" />}
        actions={
          <div className="flex gap-1.5">
            <Pill tone="ok">{counts["clear"] ?? 0} clear</Pill>
            <Pill tone="warn">{counts["review"] ?? 0} review</Pill>
            <Pill tone="alert">{counts["warning"] ?? 0} warning</Pill>
          </div>
        }
      />
      <ul className="divide-y divide-border">
        {record.warnings.map((w) => (
          <li key={w.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">{w.label}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{w.detail}</p>
            </div>
            <CheckBadge status={w.status} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
