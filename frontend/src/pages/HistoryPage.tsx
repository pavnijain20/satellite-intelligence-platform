import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Search } from "lucide-react";
import { Panel, PanelHeader } from "@/components/common/Panel";
import { Button } from "@/components/common/Button";
import {
  AnalysisStatusBadge,
  Meter,
  Pill,
  Skeleton,
  StateBlock,
} from "@/components/common/Indicators";
import { categoryMeta } from "@/data/mockAnalysis";
import { getHistory } from "@/services/api";
import { useApp } from "@/context/AppContext";
import type { HistoryRecord } from "@/data/types";

export function HistoryPage() {
  const { reviews } = useApp();
  const [rows, setRows] = useState<HistoryRecord[] | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("any");
  const [status, setStatus] = useState("any");
  const [from, setFrom] = useState("");

  useEffect(() => {
    let alive = true;
    getHistory().then((r) => alive && setRows(r));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows
      .map((r) => (reviews[r.id] ? { ...r, decision: reviews[r.id]!.decision } : r))
      .filter(
        (r) =>
          (!q ||
            r.id.toLowerCase().includes(q.toLowerCase()) ||
            r.location.toLowerCase().includes(q.toLowerCase())) &&
          (category === "any" || r.category === category) &&
          (status === "any" || r.status === status) &&
          (!from || r.date >= from),
      );
  }, [rows, q, category, status, from, reviews]);

  const field = "h-9 rounded-md border border-input bg-surface px-2 text-xs text-foreground";

  return (
    <div className="mx-auto w-full max-w-[100rem] space-y-4 p-4 md:p-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Clock className="h-5 w-5 text-primary" /> Analysis history
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every completed, queued and failed change analysis in this workspace.
        </p>
      </header>

      <Panel>
        <PanelHeader
          title="Investigation records"
          subtitle={`${filtered.length} record${filtered.length === 1 ? "" : "s"}`}
        />
        <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative">
            <span className="sr-only">Search history</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ID or location"
              className={`${field} w-full pl-8`}
            />
          </label>
          <label>
            <span className="sr-only">From date</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={`${field} w-full`}
            />
          </label>
          <label>
            <span className="sr-only">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${field} w-full`}
            >
              <option value="any">All categories</option>
              {Object.entries(categoryMeta).map(([k, m]) => (
                <option key={k} value={k}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${field} w-full`}
            >
              <option value="any">All statuses</option>
              <option value="complete">Complete</option>
              <option value="warning">Warning</option>
              <option value="queued">Queued</option>
              <option value="failed">Failed</option>
            </select>
          </label>
        </div>

        {!rows && (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {rows && filtered.length === 0 && (
          <StateBlock
            icon={<Search className="h-5 w-5" />}
            title="No matching records"
            detail="Adjust the filters above."
            tone="warn"
          />
        )}

        {rows && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "ID",
                    "Location",
                    "Date",
                    "Category",
                    "Confidence",
                    "Analyst decision",
                    "Status",
                    "",
                  ].map((h) => (
                    <th key={h} scope="col" className="label-caps px-4 py-2 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const meta = categoryMeta[r.category]!;
                  return (
                    <tr key={r.id} className="hover:bg-accent/30">
                      <td className="px-4 py-2.5 font-mono text-xs text-primary">{r.id}</td>
                      <td className="max-w-56 truncate px-4 py-2.5 text-xs">{r.location}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {r.date}
                      </td>
                      <td className="px-4 py-2.5">
                        <Pill tone={meta.tone as never}>
                          {meta.icon} {meta.label}
                        </Pill>
                      </td>
                      <td className="w-32 px-4 py-2.5">
                        <Meter value={r.confidence} />
                      </td>
                      <td className="px-4 py-2.5">
                        <Pill
                          tone={
                            r.decision === "confirmed"
                              ? "ok"
                              : r.decision === "rejected"
                                ? "alert"
                                : r.decision === "uncertain"
                                  ? "warn"
                                  : "muted"
                          }
                        >
                          {r.decision ?? "pending"}
                        </Pill>
                      </td>
                      <td className="px-4 py-2.5">
                        <AnalysisStatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Link to="/analysis/$id" params={{ id: r.id }}>
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
        )}
      </Panel>
    </div>
  );
}
