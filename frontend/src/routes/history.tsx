import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/pages/HistoryPage";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Analysis History — Orbital Sentinel" },
      {
        name: "description",
        content: "Completed, queued and failed satellite change analyses with analyst decisions.",
      },
      { property: "og:title", content: "Analysis History — Orbital Sentinel" },
      {
        property: "og:description",
        content: "Completed, queued and failed satellite change analyses with analyst decisions.",
      },
    ],
  }),
  component: HistoryPage,
});
