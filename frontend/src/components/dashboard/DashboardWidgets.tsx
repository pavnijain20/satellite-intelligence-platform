import { Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, FolderSearch, ScanEye, ShieldQuestion } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, PanelHeader, DemoTag } from "@/components/common/Panel";
import { Pill, Meter } from "@/components/common/Indicators";
import { Button } from "@/components/common/Button";
import { mockStats } from "@/data/mockSystemStatus";
import { mockHistory } from "@/data/mockHistory";
import { categoryMeta } from "@/data/mockAnalysis";

const ICONS = [FolderSearch, ScanEye, ShieldQuestion, Activity];

export function StatsGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {mockStats.map((s, i) => {
        const Icon = ICONS[i]!;
        return (
          <Panel key={s.label} className="p-4">
            <div className="flex items-start justify-between">
              <span className="label-caps">{s.label}</span>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 font-mono text-3xl tracking-tight text-foreground">{s.value}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-ok" />
              {s.delta}
              <DemoTag className="ml-auto" />
            </p>
          </Panel>
        );
      })}
    </div>
  );
}

const trend = [
  { month: "Sep", detections: 18, reviewed: 12 },
  { month: "Oct", detections: 24, reviewed: 19 },
  { month: "Nov", detections: 21, reviewed: 20 },
  { month: "Dec", detections: 31, reviewed: 22 },
  { month: "Jan", detections: 38, reviewed: 27 },
  { month: "Feb", detections: 48, reviewed: 31 },
];

export function DetectionTrend() {
  return (
    <Panel>
      <PanelHeader
        title="Detection trend"
        subtitle="Changes detected vs analyst-reviewed"
        actions={<DemoTag />}
      />
      <div className="h-56 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gDet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-ok)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-ok)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="detections"
              stroke="var(--color-primary)"
              fill="url(#gDet)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="reviewed"
              stroke="var(--color-ok)"
              fill="url(#gRev)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function RecentInvestigations() {
  return (
    <Panel>
      <PanelHeader
        title="Recent investigations"
        subtitle="Latest change analyses across all areas of interest"
        actions={
          <Link to="/history">
            <Button size="sm" variant="ghost">
              View all
            </Button>
          </Link>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-left">
          <thead>
            <tr className="border-b border-border">
              {["Investigation", "Location", "Category", "Date", "Confidence", "Analyst", ""].map(
                (h) => (
                  <th key={h} scope="col" className="label-caps px-4 py-2 font-normal">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockHistory.slice(0, 5).map((h) => {
              const meta = categoryMeta[h.category]!;
              return (
                <tr key={h.id} className="transition-colors hover:bg-accent/30">
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{h.id}</td>
                  <td className="max-w-56 truncate px-4 py-2.5 text-xs text-foreground">
                    {h.location}
                  </td>
                  <td className="px-4 py-2.5">
                    <Pill tone={meta.tone as never}>
                      {meta.icon} {meta.label}
                    </Pill>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{h.date}</td>
                  <td className="w-32 px-4 py-2.5">
                    <Meter value={h.confidence} showValue />
                  </td>
                  <td className="px-4 py-2.5">
                    <Pill
                      tone={
                        h.decision === "confirmed"
                          ? "ok"
                          : h.decision === "rejected"
                            ? "alert"
                            : h.decision === "uncertain"
                              ? "warn"
                              : "muted"
                      }
                    >
                      {h.decision ?? "pending"}
                    </Pill>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link to="/analysis/$id" params={{ id: h.id }}>
                      <Button size="sm" variant="outline">
                        Open Analysis
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
