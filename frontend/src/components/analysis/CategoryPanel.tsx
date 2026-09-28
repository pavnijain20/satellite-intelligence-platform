import { Tags } from "lucide-react";
import { Panel, PanelHeader, DemoTag } from "@/components/common/Panel";
import { Pill } from "@/components/common/Indicators";
import { categoryMeta } from "@/data/mockAnalysis";
import { useApp } from "@/context/AppContext";
import type { AnalysisRecord } from "@/data/types";

export function CategoryPanel({ record }: { record: AnalysisRecord }) {
  const { reviews } = useApp();
  const adjusted = reviews[record.id]?.category;
  const ai = categoryMeta[record.category]!;

  return (
    <Panel>
      <PanelHeader
        title="Change category"
        icon={<Tags className="h-4 w-4" />}
        actions={<DemoTag />}
      />
      <div className="space-y-3 p-4">
        <div>
          <p className="label-caps mb-1.5">AI / backend classification</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{ai.icon}</span>
            <span className="text-sm font-medium text-foreground">{ai.label}</span>
            <Pill tone={record.changeDetected ? "change" : "muted"}>
              {record.changeDetected ? "Change detected" : "No change"}
            </Pill>
          </div>
        </div>
        {adjusted && adjusted !== record.category && (
          <div className="rounded-md border border-warn/40 bg-warn/5 p-2.5">
            <p className="label-caps mb-1">Analyst adjusted classification</p>
            <p className="text-sm text-foreground">
              {categoryMeta[adjusted]!.icon} {categoryMeta[adjusted]!.label}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
          {Object.entries(categoryMeta).map(([key, m]) => (
            <Pill key={key} tone={key === record.category ? (m.tone as never) : "muted"}>
              {m.icon} {m.label}
            </Pill>
          ))}
        </div>
      </div>
    </Panel>
  );
}
