import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bot,
  Eye,
  EyeOff,
  Layers3,
  MapPin,
  Satellite,
  SquareStack,
  TriangleAlert,
} from "lucide-react";
import { Panel, PanelHeader } from "@/components/common/Panel";
import { Button } from "@/components/common/Button";
import { AnalysisStatusBadge, Skeleton, StateBlock } from "@/components/common/Indicators";
import { ProcessingStatus } from "@/components/analysis/ProcessingStatus";
import { CompareViewer } from "@/components/comparison/CompareViewer";
import { Timeline } from "@/components/timeline/Timeline";
import { CategoryPanel } from "@/components/analysis/CategoryPanel";
import { ConfidencePanel, WarningsPanel } from "@/components/evidence/EvidencePanel";
import { WhyFlagged } from "@/components/evidence/WhyFlagged";
import { SimilarSites } from "@/components/analysis/SimilarSites";
import { ProvenancePanel } from "@/components/provenance/ProvenancePanel";
import { ReviewPanel } from "@/components/review/ReviewPanel";
import { InvestigationAssistant } from "@/components/assistant/InvestigationAssistant";
import { ExportMenu } from "@/components/analysis/ExportMenu";
import { MapPanel } from "@/components/map/MapPanel";
import { ImageViewer, ChangeMask } from "@/components/analysis/ImageViewer";
import { analyzeSite } from "@/services/api";
import { processingStages } from "@/data/mockAnalysis";
import { mockSearchResults } from "@/data/mockSearchResults";
import { useApp } from "@/context/AppContext";
import type { AnalysisRecord } from "@/data/types";
import { cn } from "@/lib/utils";

type Tab = "imagery" | "evidence" | "assistant" | "review";

const TABS: { key: Tab; label: string; Icon: typeof Eye }[] = [
  { key: "imagery", label: "Imagery & timeline", Icon: Layers3 },
  { key: "evidence", label: "Evidence & provenance", Icon: SquareStack },
  { key: "assistant", label: "AI investigation", Icon: Bot },
  { key: "review", label: "Analyst review", Icon: Eye },
];

export function AnalysisPage({ id }: { id: string }) {
  const { pushNotification } = useApp();
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [tab, setTab] = useState<Tab>("imagery");
  const [maskVisible, setMaskVisible] = useState(true);
  const [maskOpacity, setMaskOpacity] = useState(0.45);
  const [obsId, setObsId] = useState<string>("");

  useEffect(() => {
    let alive = true;
    setRecord(null);
    setError(null);
    setStage(0);
    analyzeSite(id)
      .then((r) => {
        if (!alive) return;
        setRecord(r);
        setObsId(r.timeline[r.timeline.length - 1]?.id ?? "");
      })
      .catch(() => alive && setError(`No analysis is available for ${id}.`));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!record) return;
    if (stage >= processingStages.length) return;
    const t = setTimeout(() => {
      setStage((s) => {
        const next = s + 1;
        if (next === processingStages.length)
          pushNotification({
            kind: "success",
            title: "Analysis completed",
            detail: `${record.id} change analysis finished.`,
          });
        return next;
      });
    }, 650);
    return () => clearTimeout(t);
  }, [record, stage, pushNotification]);

  const mapResults = useMemo(
    () =>
      mockSearchResults.filter((r) => r.id === id || record?.similar.some((s) => s.id === r.id)),
    [id, record],
  );

  if (error) {
    return (
      <div className="p-6">
        <StateBlock
          icon={<TriangleAlert className="h-5 w-5" />}
          title="Analysis unavailable"
          detail={error}
          tone="alert"
          action={
            <Link to="/search">
              <Button variant="outline">Back to search</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    );
  }

  const selectedObs = record.timeline.find((o) => o.id === obsId) ?? record.timeline[0]!;
  const processing = stage < processingStages.length;

  return (
    <div className="mx-auto w-full max-w-[110rem] space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to search
          </Link>
          <h1 className="mt-1.5 flex flex-wrap items-center gap-3 text-xl font-semibold tracking-tight md:text-2xl">
            <span className="font-mono text-primary">{record.id}</span>
            <span>Satellite Change Investigation</span>
            <AnalysisStatusBadge status={processing ? "processing" : record.status} />
          </h1>
          <dl className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> {record.location}
            </span>
            <span>
              {record.latitude.toFixed(4)}° N, {record.longitude.toFixed(4)}° E
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Satellite className="h-3 w-3" /> {record.sensor}
            </span>
            <span>
              Acquisitions: {record.beforeDate} → {record.afterDate}
            </span>
          </dl>
        </div>
        <ExportMenu siteId={record.id} />
      </div>

      <nav
        className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-panel/60 p-1"
        aria-label="Analysis sections"
      >
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-current={tab === key ? "true" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors",
              tab === key
                ? "bg-accent text-foreground shadow-[inset_0_-2px_0_0_var(--color-primary)]"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </nav>

      {processing && (
        <Panel>
          <PanelHeader
            title="Processing analysis"
            subtitle="Pipeline stages reported by the backend"
          />
          <ProcessingStatus stage={stage} />
        </Panel>
      )}

      {tab === "imagery" && (
        <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            <Panel>
              <PanelHeader
                title="Satellite imagery"
                subtitle="Zoom, pan and fullscreen supported on every view"
                actions={
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={maskVisible ? "primary" : "outline"}
                      onClick={() => setMaskVisible((v) => !v)}
                      aria-pressed={maskVisible}
                    >
                      {maskVisible ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                      Change overlay
                    </Button>
                  </div>
                }
              />
              <div className="space-y-3 p-4">
                <label className="flex items-center gap-3">
                  <span className="label-caps whitespace-nowrap">Overlay opacity</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(maskOpacity * 100)}
                    onChange={(e) => setMaskOpacity(Number(e.target.value) / 100)}
                    disabled={!maskVisible}
                    className="w-48 accent-[var(--color-change)]"
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    {Math.round(maskOpacity * 100)}%
                  </span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    Regions shown in orange are backend-provided change masks (demo).
                  </span>
                </label>
                <CompareViewer
                  beforeSrc={record.beforeImage}
                  afterSrc={record.afterImage}
                  beforeDate={record.beforeDate}
                  afterDate={record.afterDate}
                  sensor={record.sensor}
                  location={record.location}
                  beforeId={record.provenance.imageIds[0] ?? "—"}
                  afterId={record.provenance.imageIds[1] ?? "—"}
                  maskRegions={record.changeMaskRegions}
                  maskVisible={maskVisible}
                  maskOpacity={maskOpacity}
                />
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Multi-temporal timeline"
                subtitle="Select an observation to inspect it"
              />
              <Timeline
                observations={record.timeline}
                selectedId={selectedObs.id}
                onSelect={setObsId}
                earliestSupportedDate={record.earliestSupportedDate}
              />
            </Panel>

            <Panel>
              <PanelHeader title={`Selected observation · ${selectedObs.date}`} />
              <div className="p-4">
                <ImageViewer
                  src={selectedObs.image}
                  alt={`Observation ${selectedObs.date}`}
                  className="aspect-[16/9]"
                  overlay={
                    selectedObs.changeFlag ? (
                      <ChangeMask
                        regions={record.changeMaskRegions}
                        opacity={maskOpacity}
                        visible={maskVisible}
                      />
                    ) : null
                  }
                  meta={{
                    sensor: selectedObs.sensor,
                    date: selectedObs.date,
                    location: record.location,
                    imageId: selectedObs.id,
                  }}
                />
              </div>
            </Panel>
          </div>

          <div className="space-y-4">
            <CategoryPanel record={record} />
            <Panel className="overflow-hidden">
              <PanelHeader title="Site location" subtitle="Investigation and similar sites" />
              <div className="h-64">
                <MapPanel results={mapResults} selectedId={record.id} legend={false} aoi={false} />
              </div>
            </Panel>
            <WarningsPanel record={record} />
          </div>
        </div>
      )}

      {tab === "evidence" && (
        <div className="space-y-4">
          <WhyFlagged record={record} />
          <div className="grid gap-4 lg:grid-cols-2">
            <ConfidencePanel record={record} />
            <div className="space-y-4">
              <WarningsPanel record={record} />
              <ProvenancePanel provenance={record.provenance} />
            </div>
          </div>
          <SimilarSites sites={record.similar} />
        </div>
      )}

      {tab === "assistant" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
          <InvestigationAssistant siteId={record.id} />
          <div className="space-y-4">
            <ConfidencePanel record={record} />
            <SimilarSites sites={record.similar.slice(0, 2)} />
          </div>
        </div>
      )}

      {tab === "review" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            <ReviewPanel record={record} />
            <WhyFlagged record={record} />
          </div>
          <div className="space-y-4">
            <CategoryPanel record={record} />
            <ProvenancePanel provenance={record.provenance} />
          </div>
        </div>
      )}
    </div>
  );
}
