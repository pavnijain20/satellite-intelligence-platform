import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/DashboardPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Satellite Intelligence Dashboard — Orbital Sentinel" },
      {
        name: "description",
        content:
          "Semantic retrieval and multi-temporal satellite change analysis workspace for geospatial analysts.",
      },
      { property: "og:title", content: "Satellite Intelligence Dashboard — Orbital Sentinel" },
      {
        property: "og:description",
        content:
          "Search satellite imagery in natural language, compare multi-temporal observations and review detected change.",
      },
    ],
  }),
  component: DashboardPage,
});
