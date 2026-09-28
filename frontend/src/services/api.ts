import axios from "axios";
import { mockSearchResults } from "@/data/mockSearchResults";
import { mockAnalyses } from "@/data/mockAnalysis";
import { mockHistory, mockAssistantReplies } from "@/data/mockHistory";
import { mockSystemStatus } from "@/data/mockSystemStatus";
import type {
  AnalysisRecord,
  HistoryRecord,
  ReviewDecision,
  SearchResult,
  SimilarSite,
  TimelineObservation,
} from "@/data/types";

/**
 * Single API boundary.
 * UI components never call axios directly.
 *
 * Point VITE_API_BASE_URL at the FastAPI backend
 * to switch from mock/demo mode to live backend mode.
 */
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "";
export const USING_MOCK_DATA = API_BASE_URL === "";

export type BackendHealthState =
  | "demo"
  | "checking"
  | "connected"
  | "unavailable";

export interface BackendHealth {
  state: BackendHealthState;
  label: string;
}

export const BACKEND_HEALTH_META: Record<
  BackendHealthState,
  BackendHealth
> = {
  demo: {
    state: "demo",
    label: "Backend — Demo / Mock Data",
  },
  checking: {
    state: "checking",
    label: "Backend — Checking",
  },
  connected: {
    state: "connected",
    label: "Backend — Connected",
  },
  unavailable: {
    state: "unavailable",
    label: "Backend — Unavailable",
  },
};

export const http = axios.create({
  baseURL: API_BASE_URL || "/api",
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs the live request when a backend URL is configured,
 * otherwise uses mock/demo data.
 */
async function call<T>(
  live: () => Promise<T>,
  mock: () => Promise<T>,
): Promise<T> {
  if (USING_MOCK_DATA) {
    return mock();
  }

  try {
    return await live();
  } catch (error) {
    console.error(
      "[api] request failed, falling back to demo data",
      error,
    );

    return mock();
  }
}

/* -------------------------------------------------------------------------- */
/* SEARCH                                                                     */
/* -------------------------------------------------------------------------- */

export interface SearchFilters {
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  sensor?: string;
  satellite?: string;
  quality?: string;
  maxCloud?: number;
  resolution?: string;
  category?: string;
}

export async function searchSatelliteData(
  query: string,
  filters: SearchFilters = {},
  image?: File | null,
): Promise<SearchResult[]> {
  return call(
    async () => {
      const form = new FormData();

      form.append("query", query);
      form.append("filters", JSON.stringify(filters));

      if (image) {
        form.append("image", image);
      }

      const { data } = await http.post<SearchResult[]>(
        "/search",
        form,
      );

      return data;
    },

    async () => {
      await delay(900);

      if (/\bnoresult\b/i.test(query)) {
        return [];
      }

      if (/\bfail\b/i.test(query)) {
        throw new Error("Search service unavailable");
      }

      const q = query.toLowerCase();

      let results = [...mockSearchResults];

      if (q.includes("water")) {
        results = results.filter(
          (r) =>
            r.category === "water" ||
            r.category === "vegetation",
        );
      } else if (q.includes("road")) {
        results = results.filter(
          (r) =>
            r.category === "road" ||
            r.category === "construction",
        );
      } else if (
        q.includes("construction") ||
        q.includes("infrastructure")
      ) {
        results = results.filter(
          (r) =>
            r.category === "construction" ||
            r.category === "road",
        );
      }

      const normalized = (value: string) =>
        value.trim().toLowerCase().replace(/\s+/g, " ");

      if (filters.sensor && filters.sensor !== "any") {
        const sensor = normalized(filters.sensor);
        results = results.filter((r) =>
          normalized(r.sensor).includes(sensor),
        );
      }

      if (filters.satellite && filters.satellite !== "any") {
        const satellite = normalized(filters.satellite);
        results = results.filter((r) =>
          normalized(r.sensor).includes(satellite),
        );
      }

      if (filters.quality && filters.quality !== "any") {
        const quality = normalized(filters.quality);
        results = results.filter(
          (r) => normalized(r.quality) === quality,
        );
      }

      if (typeof filters.maxCloud === "number") {
        results = results.filter(
          (r) => r.cloudCover <= filters.maxCloud!,
        );
      }

      if (filters.resolution && filters.resolution !== "any") {
        const resolution = normalized(filters.resolution);
        results = results.filter(
          (r) => normalized(r.resolution) === resolution,
        );
      }

      if (filters.category && filters.category !== "any") {
        const category = normalized(filters.category);
        results = results.filter(
          (r) => normalized(r.category) === category,
        );
      }

      if (filters.dateFrom) {
        results = results.filter(
          (r) => r.date >= filters.dateFrom!,
        );
      }

      if (filters.dateTo) {
        results = results.filter(
          (r) => r.date <= filters.dateTo!,
        );
      }

      if (filters.location) {
        results = results.filter((r) =>
          r.location
            .toLowerCase()
            .includes(filters.location!.toLowerCase()),
        );
      }

      return results.sort(
        (a, b) => b.relevance - a.relevance,
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/* SEARCH RESULT                                                              */
/* -------------------------------------------------------------------------- */

export async function getResult(
  id: string,
): Promise<SearchResult | undefined> {
  return call(
    async () =>
      (
        await http.get<SearchResult>(
          `/results/${id}`,
        )
      ).data,

    async () => {
      await delay(200);

      return mockSearchResults.find(
        (r) => r.id === id,
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/* ANALYSIS                                                                   */
/* -------------------------------------------------------------------------- */

export async function analyzeSite(
  id: string,
): Promise<AnalysisRecord> {
  return call(
    async () =>
      (
        await http.post<AnalysisRecord>(
          `/analyze/${id}`,
        )
      ).data,

    async () => {
      await delay(600);

      const record = mockAnalyses[id];

      if (!record) {
        throw new Error(
          `No analysis available for ${id}`,
        );
      }

      return structuredClone(record);
    },
  );
}

/* -------------------------------------------------------------------------- */
/* TIMELINE                                                                   */
/* -------------------------------------------------------------------------- */

export async function getTimeline(
  id: string,
): Promise<TimelineObservation[]> {
  return call(
    async () =>
      (
        await http.get<TimelineObservation[]>(
          `/timeline/${id}`,
        )
      ).data,

    async () => {
      await delay(300);

      return mockAnalyses[id]?.timeline ?? [];
    },
  );
}

/* -------------------------------------------------------------------------- */
/* SIMILAR SITES                                                              */
/* -------------------------------------------------------------------------- */

export async function getSimilarSites(
  id: string,
): Promise<SimilarSite[]> {
  return call(
    async () =>
      (
        await http.get<SimilarSite[]>(
          `/similar/${id}`,
        )
      ).data,

    async () => {
      await delay(400);

      return mockAnalyses[id]?.similar ?? [];
    },
  );
}

/* -------------------------------------------------------------------------- */
/* ANALYST REVIEW                                                             */
/* -------------------------------------------------------------------------- */

export async function submitReview(
  id: string,
  payload: {
    decision: ReviewDecision;
    comment: string;
    category?: string;
  },
): Promise<{
  ok: true;
  at: string;
}> {
  return call(
    async () =>
      (
        await http.post(
          `/review/${id}`,
          payload,
        )
      ).data,

    async () => {
      await delay(700);

      return {
        ok: true as const,
        at: new Date().toISOString(),
      };
    },
  );
}

/* -------------------------------------------------------------------------- */
/* ANALYST FEEDBACK                                                           */
/* -------------------------------------------------------------------------- */

export async function submitFeedback(
  id: string,
  payload: {
    helpful: boolean;
    note?: string;
  },
): Promise<{
  ok: true;
}> {
  return call(
    async () =>
      (
        await http.post(
          `/feedback/${id}`,
          payload,
        )
      ).data,

    async () => {
      await delay(400);

      return {
        ok: true as const,
      };
    },
  );
}

/* -------------------------------------------------------------------------- */
/* HISTORY                                                                    */
/* -------------------------------------------------------------------------- */

export async function getHistory(): Promise<
  HistoryRecord[]
> {
  return call(
    async () =>
      (
        await http.get<HistoryRecord[]>(
          "/history",
        )
      ).data,

    async () => {
      await delay(500);

      return mockHistory;
    },
  );
}

/* -------------------------------------------------------------------------- */
/* EXPORT                                                                     */
/* -------------------------------------------------------------------------- */

export type ExportFormat =
  | "summary"
  | "evidence"
  | "images"
  | "json"
  | "csv"
  | "pdf";

export interface ExportResult {
  ok: true;
  filename: string;
  blob: Blob;
}

/**
 * Creates a browser Blob containing text.
 */
function createTextBlob(
  content: string,
  type = "text/plain;charset=utf-8",
): Blob {
  return new Blob(
    [content],
    {
      type,
    },
  );
}

/**
 * Creates a JSON export from the current mock analysis.
 */
function createJsonBlob(id: string): Blob {
  const analysis = mockAnalyses[id];

  const exportRecord = {
    exportedAt: new Date().toISOString(),
    siteId: id,
    analysis: analysis ?? null,
    source: "Sentinel Sight demo frontend",
  };

  return createTextBlob(
    JSON.stringify(
      exportRecord,
      null,
      2,
    ),
    "application/json;charset=utf-8",
  );
}

/**
 * Creates a CSV export from the current mock analysis.
 */
function createCsvBlob(id: string): Blob {
  const analysis = mockAnalyses[id];

  const rows = [
    ["Field", "Value"],
    ["Site ID", id],
    [
      "Exported At",
      new Date().toISOString(),
    ],
    [
      "Analysis Record",
      JSON.stringify(
        analysis ?? {},
      ),
    ],
  ];

  const csv = rows
    .map((row) =>
      row
        .map(
          (value) =>
            `"${String(value).replace(
              /"/g,
              '""',
            )}"`,
        )
        .join(","),
    )
    .join("\n");

  return createTextBlob(
    csv,
    "text/csv;charset=utf-8",
  );
}

/**
 * Creates a text-based investigation summary.
 */
function createSummaryBlob(id: string): Blob {
  const analysis = mockAnalyses[id];

  const content = [
    "SENTINEL SIGHT",
    "SATELLITE CHANGE INVESTIGATION",
    "",
    `Site ID: ${id}`,
    "",
    "INVESTIGATION SUMMARY",
    "=====================",
    "",
    JSON.stringify(
      analysis ?? {},
      null,
      2,
    ),
    "",
    `Generated: ${new Date().toLocaleString()}`,
  ].join("\n");

  return createTextBlob(content);
}

/**
 * Creates a text-based evidence report.
 */
function createEvidenceBlob(id: string): Blob {
  const analysis = mockAnalyses[id];

  const content = [
    "SENTINEL SIGHT",
    "EVIDENCE REPORT",
    "",
    `Site ID: ${id}`,
    "",
    "EVIDENCE AND PROVENANCE",
    "=======================",
    "",
    JSON.stringify(
      analysis ?? {},
      null,
      2,
    ),
    "",
    `Generated: ${new Date().toLocaleString()}`,
  ].join("\n");

  return createTextBlob(content);
}

/**
 * Creates a real PDF in the browser using jsPDF.
 */
async function createPdfBlob(
  id: string,
): Promise<Blob> {
  const { jsPDF } = await import(
    "jspdf"
  );

  const analysis = mockAnalyses[id];

  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text(
    "SENTINEL SIGHT",
    20,
    20,
  );

  pdf.setFontSize(14);
  pdf.text(
    "Satellite Change Investigation",
    20,
    32,
  );

  pdf.setFontSize(10);

  const content = [
    `Site ID: ${id}`,
    "",
    "Investigation record:",
    JSON.stringify(
      analysis ?? {},
      null,
      2,
    ),
    "",
    `Generated: ${new Date().toLocaleString()}`,
  ];

  let y = 45;

  for (const line of content) {
    const wrappedLines =
      pdf.splitTextToSize(
        line,
        170,
      );

    for (const wrappedLine of wrappedLines) {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(
        wrappedLine,
        20,
        y,
      );

      y += 6;
    }
  }

  return pdf.output("blob");
}

/**
 * Exports an investigation.
 *
 * When FastAPI is connected:
 *   /export/{id}
 * returns the actual file as a Blob.
 *
 * In demo mode:
 *   the frontend generates the file locally.
 */
export async function exportInvestigation(
  id: string,
  format: ExportFormat,
): Promise<ExportResult> {
  /* -------------------------- LIVE BACKEND MODE -------------------------- */

  if (!USING_MOCK_DATA) {
    const response = await http.post(
      `/export/${id}`,
      { format },
      {
        responseType: "blob",
      },
    );

    const contentDisposition =
      response.headers[
        "content-disposition"
      ];

    let filename = `${id}_${format}`;

    const match =
      contentDisposition?.match(
        /filename="?([^"]+)"?/i,
      );

    if (match?.[1]) {
      filename = match[1];
    } else {
      const extension =
        format === "json"
          ? "json"
          : format === "csv"
            ? "csv"
            : format === "pdf"
              ? "pdf"
              : "txt";

      filename = `${id}_${format}.${extension}`;
    }

    return {
      ok: true,
      filename,
      blob: response.data,
    };
  }

  /* ---------------------------- DEMO MODE ---------------------------- */

  await delay(700);

  let blob: Blob;
  let filename: string;

  switch (format) {
    case "json":
      blob = createJsonBlob(id);
      filename = `${id}_analysis.json`;
      break;

    case "csv":
      blob = createCsvBlob(id);
      filename = `${id}_observations.csv`;
      break;

    case "summary":
      blob = createSummaryBlob(id);
      filename = `${id}_investigation_summary.txt`;
      break;

    case "evidence":
      blob = createEvidenceBlob(id);
      filename = `${id}_evidence_report.txt`;
      break;

    case "pdf":
      blob = await createPdfBlob(id);
      filename = `${id}_investigation_report.pdf`;
      break;

    case "images":
      blob = createTextBlob(
        [
          "SENTINEL SIGHT IMAGE EXPORT",
          "",
          `Site ID: ${id}`,
          "",
          "Image export placeholder.",
          "Before/after/change-mask image assets will be exported here once the image pipeline is connected.",
        ].join("\n"),
      );

      filename = `${id}_images.txt`;
      break;
  }

  return {
    ok: true,
    filename,
    blob,
  };
}

/* -------------------------------------------------------------------------- */
/* SYSTEM STATUS                                                              */
/* -------------------------------------------------------------------------- */

export async function getSystemStatus() {
  return call(
    async () =>
      (
        await http.get(
          "/system/status",
        )
      ).data,

    async () => {
      await delay(250);

      return mockSystemStatus;
    },
  );
}

/**
 * Checks the configured backend without falling back
 * to demo data.
 */
export async function checkBackendHealth(): Promise<BackendHealth> {
  if (USING_MOCK_DATA) {
    return BACKEND_HEALTH_META.demo;
  }

  try {
    await http.get(
      "/system/status",
      {
        timeout: 5000,
      },
    );

    return BACKEND_HEALTH_META.connected;
  } catch {
    return BACKEND_HEALTH_META.unavailable;
  }
}

/* -------------------------------------------------------------------------- */
/* AI INVESTIGATION ASSISTANT                                                */
/* -------------------------------------------------------------------------- */

export async function askInvestigationAssistant(
  question: string,
  context: {
    siteId?: string;
  } = {},
): Promise<string> {
  return call(
    async () =>
      (
        await http.post<{
          answer: string;
        }>(
          "/assistant",
          {
            question,
            ...context,
          },
        )
      ).data.answer,

    async () => {
      await delay(1100);

      const hit =
        mockAssistantReplies.find(
          (r) =>
            r.match.test(
              question,
            ),
        );

      return (
        hit?.reply ??
        `Demo assistant: I don't have a mock answer for that yet${
          context.siteId
            ? ` on ${context.siteId}`
            : ""
        }. Once the FastAPI backend is connected, this question is forwarded to the investigation model along with the current site context.`
      );
    },
  );
}