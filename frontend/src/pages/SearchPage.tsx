import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ListFilter,
  MapPinned,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";

import { SearchBar } from "@/components/search/SearchBar";
import { FilterBar } from "@/components/search/FilterBar";
import {
  ResultCard,
  ResultCardSkeleton,
} from "@/components/search/ResultCard";
import { MapPanel } from "@/components/map/MapPanel";
import { Panel, PanelHeader } from "@/components/common/Panel";
import { Button } from "@/components/common/Button";
import { StateBlock } from "@/components/common/Indicators";
import {
  searchSatelliteData,
  type SearchFilters,
} from "@/services/api";
import { useApp } from "@/context/AppContext";
import type { SearchResult } from "@/data/types";

export function SearchPage({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const navigate = useNavigate();
  const { setLastQuery, pushNotification } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [image, setImage] = useState<File | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");

  const [selected, setSelected] = useState<string | null>(null);

  const run = useCallback(
    async (
      q: string,
      f: SearchFilters,
      img: File | null,
    ) => {
      setStatus("loading");
      setSelected(null);
      setLastQuery(q);

      try {
        const res = await searchSatelliteData(q.trim(), f, img);

        setResults(res);
        setSelected(res[0]?.id ?? null);
        setStatus("done");

        if (res.length > 0) {
          const searchLabel =
            q.trim() ||
            "current filters";

          pushNotification({
            kind: "info",
            title: "Search completed",
            detail: `${res.length} candidate ${
              res.length === 1 ? "site" : "sites"
            } returned for ${searchLabel}.`,
          });
        }
      } catch {
        setResults([]);
        setSelected(null);
        setStatus("error");
      }
    },
    [pushNotification, setLastQuery],
  );

  /*
   * Run initial dashboard query once.
   */
  useEffect(() => {
    if (initialQuery.trim()) {
      setQuery(initialQuery);
      void run(initialQuery, {}, null);
    } else {
      setStatus("idle");
    }

    // Intentionally only reacts to initialQuery changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  /*
   * Search submission.
   */
  const handleSearch = useCallback(
    (value: string, img: File | null) => {
      const nextQuery = value.trim();

      setQuery(value);
      setImage(img);

      /*
       * Always run the search, even when the query is empty.
       * This allows FILTER-ONLY searches.
       */
      void run(nextQuery, filters, img);
    },
    [filters, run],
  );

  /*
   * Filter changes.
   *
   * Important:
   * Filters are allowed to work even when the search box is empty.
   */
  const handleFilterChange = useCallback(
    (nextFilters: SearchFilters) => {
      setFilters(nextFilters);

      /*
       * Do not keep stale results on screen.
       */
      setResults([]);
      setSelected(null);

      /*
       * Run using the current query + newly selected filters.
       * Empty query is valid and means "filter the complete dataset".
       */
      void run(query.trim(), nextFilters, image);
    },
    [image, query, run],
  );

  /*
   * Reset filters and immediately rerun.
   */
  const resetFilters = useCallback(() => {
    const emptyFilters: SearchFilters = {};

    setFilters(emptyFilters);

    /*
     * Re-run the current query without any filters.
     */
    void run(query.trim(), emptyFilters, image);
  }, [image, query, run]);

  /*
   * Clear the search completely.
   *
   * This is useful when the user wants to test filters independently.
   */
  const clearSearch = useCallback(() => {
    setQuery("");
    setImage(null);
    setFilters({});
    setResults([]);
    setSelected(null);
    setStatus("idle");
    setLastQuery("");
  }, [setLastQuery]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* SEARCH HEADER                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="space-y-3 border-b border-border p-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          loading={status === "loading"}
          image={image}
          onImageChange={setImage}
        />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </Button>

          <span className="font-mono text-[11px] text-muted-foreground">
            {status === "done"
              ? `${results.length} results`
              : status === "loading"
                ? "Searching…"
                : "Ready"}
          </span>

          {(query.trim() || Object.keys(filters).length > 0) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSearch}
            >
              Clear search
            </Button>
          )}
        </div>

        {showFilters && (
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
          />
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CONTENT                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(24rem,38%)_1fr]">
        {/* ---------------------------------------------------------------- */}
        {/* RESULTS                                                           */}
        {/* ---------------------------------------------------------------- */}

        <section
          className="min-h-0 overflow-y-auto border-b border-border p-3 lg:border-b-0 lg:border-r"
          aria-label="Search results"
        >
          <div className="mb-2 flex items-center gap-2">
            <ListFilter className="h-3.5 w-3.5 text-primary" />
            <span className="label-caps">
              Search results
            </span>
          </div>

          {/* Loading */}
          {status === "loading" && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <ResultCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Initial state */}
          {status === "idle" && (
            <StateBlock
              icon={<MapPinned className="h-5 w-5" />}
              title="Start with a natural-language query"
              detail="You can also open Filters and search using filters alone."
              tone="info"
            />
          )}

          {/* Error */}
          {status === "error" && (
            <StateBlock
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Search failed"
              detail="The retrieval service did not respond. Check the backend connection and try again."
              tone="alert"
              action={
                <Button
                  variant="outline"
                  onClick={() =>
                    void run(query.trim(), filters, image)
                  }
                >
                  Retry search
                </Button>
              }
            />
          )}

          {/* No results */}
          {status === "done" && results.length === 0 && (
            <StateBlock
              icon={<SearchX className="h-5 w-5" />}
              title="No results found"
              detail="Try removing one filter, widening the date range, or changing the search."
              tone="warn"
              action={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                  >
                    Reset filters
                  </Button>

                  <Button
                    variant="outline"
                    onClick={clearSearch}
                  >
                    Clear search
                  </Button>
                </div>
              }
            />
          )}

          {/* Results */}
          {status === "done" && results.length > 0 && (
            <ul className="space-y-3">
              {results.map((r) => (
                <li key={r.id}>
                  <ResultCard
                    result={r}
                    selected={selected === r.id}
                    onSelect={setSelected}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* MAP                                                               */}
        {/* ---------------------------------------------------------------- */}

        <section
          className="relative min-h-[22rem]"
          aria-label="Satellite map"
        >
          <MapPanel
            results={results}
            selectedId={selected}
            onSelect={setSelected}
            onOpen={(id) =>
              navigate({
                to: "/analysis/$id",
                params: { id },
              })
            }
          />

          {results.length === 0 && status !== "loading" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Panel className="pointer-events-auto max-w-sm">
                <PanelHeader
                  title="No sites plotted"
                  subtitle="Run a search or apply filters to populate the map"
                />
              </Panel>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}