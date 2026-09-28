import { createFileRoute } from "@tanstack/react-router";
import { AnalysisPage } from "@/pages/AnalysisPage";

export const Route = createFileRoute("/analysis/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} Change Investigation — Orbital Sentinel` },
      {
        name: "description",
        content:
          "Before/after satellite comparison, change detection overlay, evidence, false-alarm factors and analyst review.",
      },
      { property: "og:title", content: `${params.id} Change Investigation — Orbital Sentinel` },
      {
        property: "og:description",
        content:
          "Before/after satellite comparison, change detection overlay, evidence and analyst review.",
      },
    ],
  }),
  component: AnalysisRoute,
});

function AnalysisRoute() {
  const { id } = Route.useParams();
  return <AnalysisPage id={id} />;
}
