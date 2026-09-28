import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/pages/SearchPage";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" && search["q"] ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Semantic Search & Satellite Map — Orbital Sentinel" },
      {
        name: "description",
        content:
          "Natural-language and multimodal satellite retrieval with ranked results plotted on an interactive map.",
      },
      { property: "og:title", content: "Semantic Search & Satellite Map — Orbital Sentinel" },
      {
        property: "og:description",
        content:
          "Natural-language and multimodal satellite retrieval with ranked results plotted on an interactive map.",
      },
    ],
  }),
  component: SearchRoute,
});

function SearchRoute() {
  const { q } = Route.useSearch();
  return <SearchPage initialQuery={q ?? ""} />;
}
