import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Satellite } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterBar } from "@/components/search/FilterBar";
import {
  DetectionTrend,
  RecentInvestigations,
  StatsGrid,
} from "@/components/dashboard/DashboardWidgets";
import { Panel, PanelHeader } from "@/components/common/Panel";
import { SystemStatusPanel } from "@/components/layout/SystemStatusPanel";
import { DemoTag } from "@/components/common/Panel";
import { exampleQueries } from "@/data/mockSearchResults";
import type { SearchFilters } from "@/services/api";
import { useApp } from "@/context/AppContext";

export function DashboardPage() {
  const navigate = useNavigate();
  const { setLastQuery } = useApp();
  const [query, setQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});

  const run = (q: string) => {
    if (!q.trim()) return;
    setLastQuery(q.trim());
    navigate({ to: "/search", search: { q: q.trim() } });
  };

  return (
    <div className="mx-auto w-full max-w-[100rem] space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            <Satellite className="h-5 w-5 text-primary" />
            Satellite Intelligence Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Semantic Retrieval &amp; Multi-Temporal Change Analysis
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          SIH 2026 · PS SIH26227 · demo dataset
        </p>
      </header>

      {/* Example query chips */}
      <div className="flex flex-wrap gap-2">
        {exampleQueries.map((q) => (
          <button
            key={q}
            type="button"
            className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
            onClick={() => run(q)}
          >
            {q}
          </button>
        ))}
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={(v) => run(v)}
        image={image}
        onImageChange={setImage}
      />

      <FilterBar filters={filters} onChange={setFilters} />

      <StatsGrid />

      <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-4">
          <DetectionTrend />
          <RecentInvestigations />
        </div>
        <Panel className="h-fit">
          <PanelHeader title="System" subtitle="Local deployment health" />
          <div className="p-4">
            <SystemStatusPanel />
          </div>
        </Panel>
      </div>
    </div>
  );
}
