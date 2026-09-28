import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/SettingsPage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Orbital Sentinel" },
      {
        name: "description",
        content: "Backend connection, sensor index, map tile source and display preferences.",
      },
      { property: "og:title", content: "Settings — Orbital Sentinel" },
      {
        property: "og:description",
        content: "Backend connection, sensor index, map tile source and display preferences.",
      },
    ],
  }),
  component: SettingsPage,
});
