export type ChangeCategory =
  "construction" | "road" | "vegetation" | "water" | "activity" | "unknown";

export type ReviewDecision = "confirmed" | "rejected" | "uncertain" | null;

export type CheckStatus = "clear" | "review" | "warning";

export type AnalysisStatus = "queued" | "processing" | "complete" | "warning" | "failed";

export interface SearchResult {
  id: string;
  label: string;
  location: string;
  latitude: number;
  longitude: number;
  sensor: string;
  date: string;
  thumbnail: string;
  quality: "excellent" | "good" | "fair" | "poor";
  cloudCover: number;
  resolution: string;
  category: ChangeCategory;
  relevance: number;
  changeDetected: boolean;
  ranking: {
    semantic: number;
    spatial: number;
    temporal: number;
    sensor: number;
  };
}

export interface TimelineObservation {
  id: string;
  date: string;
  sensor: string;
  image: string;
  cloudCover: number;
  quality: SearchResult["quality"];
  changeFlag: boolean;
  note?: string;
}

export interface EvidenceItem {
  label: string;
  detail: string;
  score: number;
  status: CheckStatus;
}

export interface WarningItem {
  label: string;
  detail: string;
  status: CheckStatus;
}

export interface Provenance {
  source: string;
  sensor: string;
  acquisitionDates: string[];
  location: string;
  coordinates: string;
  imageIds: string[];
  dataSource: string;
  processing: string;
  modelVersion: string;
  analysisId: string;
  processedAt: string;
  licence: string;
}

export interface SimilarSite {
  id: string;
  location: string;
  category: ChangeCategory;
  similarity: number;
  date: string;
  thumbnail: string;
}

export interface AnalysisRecord {
  id: string;
  label: string;
  location: string;
  latitude: number;
  longitude: number;
  sensor: string;
  status: AnalysisStatus;
  category: ChangeCategory;
  analystCategory?: ChangeCategory;
  confidence: number;
  changeDetected: boolean;
  earliestSupportedDate: string;
  beforeImage: string;
  afterImage: string;
  beforeDate: string;
  afterDate: string;
  changeMaskRegions: { x: number; y: number; w: number; h: number }[];
  summary: string;
  evidence: EvidenceItem[];
  warnings: WarningItem[];
  supportingObservations: string[];
  uncertainty: string[];
  provenance: Provenance;
  timeline: TimelineObservation[];
  similar: SimilarSite[];
  review: {
    decision: ReviewDecision;
    comment: string;
    reviewedBy?: string;
    reviewedAt?: string;
    previous?: { decision: ReviewDecision; at: string };
  };
}

export interface HistoryRecord {
  id: string;
  location: string;
  date: string;
  category: ChangeCategory;
  confidence: number;
  decision: ReviewDecision;
  status: AnalysisStatus;
}

export interface AppNotification {
  id: string;
  kind: "success" | "error" | "info" | "warning";
  title: string;
  detail: string;
  time: string;
  read?: boolean;
}
