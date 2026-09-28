import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/DashboardPage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Orbital Sentinel" },
      {
        name: "description",
        content:
          "Intelligence summary: active investigations, detected changes and pending analyst reviews.",
      },
      { property: "og:title", content: "Dashboard — Orbital Sentinel" },
      {
        property: "og:description",
        content:
          "Intelligence summary: active investigations, detected changes and pending analyst reviews.",
      },
    ],
  }),
  component: DashboardPage,
});
