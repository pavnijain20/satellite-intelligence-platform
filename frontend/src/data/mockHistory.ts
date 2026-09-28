import type { HistoryRecord } from "./types";

/** DEMO DATA — replace with backend `getHistory()`. */
export const mockHistory: HistoryRecord[] = [
  {
    id: "SITE-003",
    location: "Nagpur Outer Ring Road, Maharashtra",
    date: "2026-02-18",
    category: "construction",
    confidence: 0.86,
    decision: null,
    status: "complete",
  },
  {
    id: "SITE-011",
    location: "NH-44 Corridor, Betul District",
    date: "2026-02-16",
    category: "road",
    confidence: 0.77,
    decision: "confirmed",
    status: "complete",
  },
  {
    id: "SITE-007",
    location: "Totladoh Reservoir, Pench Basin",
    date: "2026-02-14",
    category: "water",
    confidence: 0.72,
    decision: "uncertain",
    status: "warning",
  },
  {
    id: "SITE-019",
    location: "Butibori Industrial Belt, Nagpur",
    date: "2026-02-11",
    category: "activity",
    confidence: 0.65,
    decision: "rejected",
    status: "warning",
  },
  {
    id: "SITE-024",
    location: "Kanhan River Bank, Kamptee",
    date: "2026-02-09",
    category: "vegetation",
    confidence: 0.59,
    decision: "confirmed",
    status: "complete",
  },
  {
    id: "SITE-031",
    location: "Samruddhi Expressway Interchange",
    date: "2026-02-04",
    category: "construction",
    confidence: 0.55,
    decision: null,
    status: "queued",
  },
  {
    id: "SITE-042",
    location: "Wardha Canal Extension",
    date: "2026-01-29",
    category: "unknown",
    confidence: 0.31,
    decision: null,
    status: "failed",
  },
];

/** DEMO responses for the AI Investigation Assistant. */
export const mockAssistantReplies: { match: RegExp; reply: string }[] = [
  {
    match: /flag|why/i,
    reply:
      "**Why this site was flagged (demo response)**\n\nBi-temporal differencing between 15 Jun 2025 and 20 Sep 2025 shows a contiguous ~4.2 ha region where surface reflectance shifted from vegetated/soil signatures to built-surface signatures.\n\n• Persistence: present in 3 consecutive observations\n• Spatial consistency: stable region boundaries\n• Image quality: mean cloud cover 3.8%\n\nUncertainty remains around co-registration at the north-west boundary and seasonal reflectance differences.",
  },
  {
    match: /chang(ed|e) between|difference/i,
    reply:
      "Between the two selected observations (demo values): bare agricultural plots were graded, three rectangular foundations appeared, and an unpaved access track now connects the site to the existing road corridor. Vegetation index over the region dropped from 0.41 to 0.12.",
  },
  {
    match: /summar|evidence/i,
    reply:
      "**Evidence summary (demo)**\n\n1. Temporal persistence — 0.90\n2. Spatial consistency — 0.84\n3. Image quality — 0.92\n4. Multi-sensor agreement — 0.71 (review)\n\nSupporting observations: 2025-06-15, 2025-09-20, 2026-01-12. Overall demo confidence 0.86. These are mock values for demonstration and are not backend-derived.",
  },
  {
    match: /false alarm|uncertain|risk/i,
    reply:
      "**Potential false-alarm factors (demo)**\n\n• Image misalignment — review required (co-registration residual ≈ 0.6 px)\n• Seasonal variation — review required (dry vs post-monsoon acquisitions)\n• Cloud contamination — clear\n• Insufficient observations — clear\n\nThese factors are displayed, not eliminated: analyst judgement is still required.",
  },
  {
    match: /earliest|start|began/i,
    reply:
      "The earliest **supported** observation of change is 15 Jun 2025. Earlier scenes (08 Nov 2024, 19 Mar 2025) show no disturbance, so activity could have begun any time between 19 Mar 2025 and 15 Jun 2025. This is not an exact start date.",
  },
  {
    match: /similar/i,
    reply:
      "Four similar sites rank highest by embedding similarity (demo): SITE-011 (road, 0.81), SITE-007 (water, 0.75), SITE-019 (activity, 0.68), SITE-024 (vegetation, 0.61). Open the Similar Sites panel to inspect or plot them on the map.",
  },
  {
    match: /prepare|report|investigation summary/i,
    reply:
      "**Investigation summary draft (demo)**\n\nSITE-003 · Nagpur Outer Ring Road · Sentinel-2 L2A\nCategory: Construction · Demo confidence 0.86\nEarliest supported observation: 15 Jun 2025\nEvidence: persistent, spatially consistent change across 3 observations under good image quality.\nOpen risks: co-registration residual, seasonal variation.\nRecommended action: analyst confirmation, then export evidence report.",
  },
];

export const suggestedQuestions = [
  "Why was this site flagged?",
  "What changed between these observations?",
  "Summarize the evidence.",
  "What are the possible false alarms?",
  "What is the earliest supported change?",
  "Find similar sites.",
  "Prepare an investigation summary.",
];
