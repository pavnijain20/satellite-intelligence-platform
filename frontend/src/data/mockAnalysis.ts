import type { AnalysisRecord, TimelineObservation } from "./types";
import { imagery, mockSearchResults } from "./mockSearchResults";

const timelineFor = (seed: number): TimelineObservation[] => {
  const base: TimelineObservation[] = [
    {
      id: "OBS-2024-11",
      date: "2024-11-08",
      sensor: "Sentinel-2 L2A",
      image: imagery.before,
      cloudCover: 6,
      quality: "good",
      changeFlag: false,
      note: "Baseline observation — agricultural land cover.",
    },
    {
      id: "OBS-2025-03",
      date: "2025-03-19",
      sensor: "Sentinel-2 L2A",
      image: imagery.before,
      cloudCover: 2,
      quality: "excellent",
      changeFlag: false,
      note: "No structural difference from baseline.",
    },
    {
      id: "OBS-2025-06",
      date: "2025-06-15",
      sensor: "Sentinel-2 L2A",
      image: imagery.before,
      cloudCover: 9,
      quality: "good",
      changeFlag: true,
      note: "Earliest supported observation of surface disturbance.",
    },
    {
      id: "OBS-2025-09",
      date: "2025-09-20",
      sensor: "Sentinel-2 L2A",
      image: imagery.after,
      cloudCover: 3,
      quality: "excellent",
      changeFlag: true,
      note: "Structural footprints clearly resolved.",
    },
    {
      id: "OBS-2026-01",
      date: "2026-01-12",
      sensor: "Sentinel-2 L2A",
      image: imagery.after,
      cloudCover: 1,
      quality: "excellent",
      changeFlag: true,
      note: "Change persists; footprint extended to the north-east.",
    },
  ];
  return base.map((o, i) => ({ ...o, id: `${o.id}-${seed}${i}` }));
};

/** DEMO DATA — every score below is a mock value, not a backend result. */
export const mockAnalyses: Record<string, AnalysisRecord> = Object.fromEntries(
  mockSearchResults.map((r) => {
    const isPrimary = r.id === "SITE-003";
    const record: AnalysisRecord = {
      id: r.id,
      label: r.label,
      location: r.location,
      latitude: r.latitude,
      longitude: r.longitude,
      sensor: r.sensor,
      status: r.id === "SITE-019" ? "warning" : "complete",
      category: r.category,
      confidence: isPrimary ? 0.86 : Math.round(r.relevance * 92) / 100,
      changeDetected: r.changeDetected,
      earliestSupportedDate: "2025-06-15",
      beforeImage:
        r.category === "water"
          ? imagery.water
          : r.category === "road"
            ? imagery.road
            : imagery.before,
      afterImage:
        r.category === "water"
          ? imagery.water
          : r.category === "road"
            ? imagery.road
            : imagery.after,
      beforeDate: "2025-06-15",
      afterDate: r.date,
      changeMaskRegions: [
        { x: 34, y: 22, w: 38, h: 30 },
        { x: 40, y: 54, w: 28, h: 22 },
        { x: 30, y: 62, w: 12, h: 14 },
      ],
      summary:
        r.category === "construction"
          ? "Persistent structural change detected — new building footprints and graded plots adjacent to an existing road corridor."
          : r.category === "road"
            ? "Linear surface change consistent with new road earthworks across previously vegetated land."
            : r.category === "water"
              ? "Reduction in surface water extent with exposed shoreline sediment."
              : "Surface reflectance change of undetermined type; further observations required.",
      evidence: [
        {
          label: "Temporal persistence",
          detail: "Change is present in 3 consecutive observations (Jun 2025 – Jan 2026).",
          score: 0.9,
          status: "clear",
        },
        {
          label: "Spatial consistency",
          detail: "Detected region is contiguous (≈ 4.2 ha) with stable boundaries.",
          score: 0.84,
          status: "clear",
        },
        {
          label: "Image quality",
          detail: "Mean cloud cover 3.8%; all scenes L2A surface-reflectance corrected.",
          score: 0.92,
          status: "clear",
        },
        {
          label: "Multi-sensor agreement",
          detail: "Sentinel-1 backscatter increase supports the optical detection.",
          score: 0.71,
          status: "review",
        },
      ],
      warnings: [
        {
          label: "Cloud contamination",
          detail: "Max 9% cloud over the AOI in the used scenes.",
          status: "clear",
        },
        {
          label: "Image misalignment",
          detail: "Co-registration residual ≈ 0.6 px — minor uncertainty at region edges.",
          status: "review",
        },
        {
          label: "Seasonal variation",
          detail: "Dry-season / monsoon reflectance differences cannot be fully excluded.",
          status: "review",
        },
        {
          label: "Temporary surface change",
          detail: "No evidence of a short-lived surface event.",
          status: "clear",
        },
        {
          label: "Poor image quality",
          detail: "All input scenes pass the quality threshold.",
          status: "clear",
        },
        {
          label: "Insufficient observations",
          detail: "5 usable observations across 15 months.",
          status: "clear",
        },
        {
          label: "Spatial inconsistency",
          detail:
            r.id === "SITE-019"
              ? "Detected region is fragmented across scenes."
              : "Region geometry stable across observations.",
          status: r.id === "SITE-019" ? "warning" : "clear",
        },
      ],
      supportingObservations: ["2025-06-15", "2025-09-20", "2026-01-12"],
      uncertainty: [
        "Image alignment uncertainty at the north-west boundary of the region.",
        "Seasonal variation between dry and post-monsoon acquisitions.",
        "Possible temporary material stockpiles included in the change mask.",
      ],
      provenance: {
        source: "Copernicus Sentinel-2",
        sensor: r.sensor,
        acquisitionDates: ["2024-11-08", "2025-03-19", "2025-06-15", "2025-09-20", "2026-01-12"],
        location: r.location,
        coordinates: `${r.latitude.toFixed(4)}° N, ${r.longitude.toFixed(4)}° E`,
        imageIds: [
          "S2B_MSIL2A_20250615T052649_N0511_R105_T44QMF",
          "S2A_MSIL2A_20250920T052651_N0511_R105_T44QMF",
          "S2A_MSIL2A_20260112T052649_N0511_R105_T44QMF",
        ],
        dataSource: "Local STAC catalogue mirror (offline capable)",
        processing: "Sen2Cor L2A · cloud mask · co-registration · bi-temporal differencing",
        modelVersion: "sih-change-net v0.4.2 (demo)",
        analysisId: `ANL-${r.id.replace("SITE-", "")}-2026-0417`,
        processedAt: "2026-02-18T09:41:22Z",
        licence: "Copernicus open data — free and open licence",
      },
      timeline: timelineFor(r.id.length),
      similar: mockSearchResults
        .filter((s) => s.id !== r.id)
        .slice(0, 4)
        .map((s) => ({
          id: s.id,
          location: s.location,
          category: s.category,
          similarity: Math.round((s.relevance - 0.03) * 100) / 100,
          date: s.date,
          thumbnail: s.thumbnail,
        })),
      review: { decision: null, comment: "" },
    };
    return [r.id, record];
  }),
);

export const processingStages = [
  "Retrieving satellite observations",
  "Preprocessing",
  "Temporal alignment",
  "Running change detection",
  "Evaluating false alarms",
  "Generating evidence",
  "Finalizing analysis",
];

export const categoryMeta: Record<string, { label: string; icon: string; tone: string }> = {
  construction: { label: "Construction", icon: "🏗️", tone: "change" },
  road: { label: "Road", icon: "🛣️", tone: "warn" },
  vegetation: { label: "Vegetation", icon: "🌱", tone: "ok" },
  water: { label: "Water", icon: "💧", tone: "info" },
  activity: { label: "Activity", icon: "⚡", tone: "warn" },
  unknown: { label: "Unknown", icon: "❓", tone: "muted" },
};
