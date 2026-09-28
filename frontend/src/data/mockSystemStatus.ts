import type { AppNotification } from "./types";

export type ConnectivityMode = "online" | "offline" | "local" | "syncing" | "limited";

export interface SystemStatus {
  mode: ConnectivityMode;
  components: { label: string; value: string; ok: boolean }[];
  lastSync: string;
}

/** DEMO DATA — replace with backend `getSystemStatus()`. */
export const mockSystemStatus: SystemStatus = {
  mode: "local",
  components: [
    { label: "AI Model", value: "Ready", ok: true },
    { label: "Satellite Index", value: "Ready", ok: true },
    { label: "Map Data", value: "Available", ok: true },
  ],
  lastSync: "10 min ago",
};

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    kind: "success",
    title: "Analysis completed",
    detail: "SITE-003 change analysis finished with 86% confidence.",
    time: "2 min ago",
  },
  {
    id: "n2",
    kind: "warning",
    title: "Review required",
    detail: "SITE-007 flagged seasonal variation — analyst review needed.",
    time: "26 min ago",
  },
  {
    id: "n3",
    kind: "info",
    title: "New results available",
    detail: "4 new observations ingested for the Nagpur AOI.",
    time: "1 h ago",
  },
  {
    id: "n4",
    kind: "error",
    title: "Analysis failed",
    detail: "SITE-042 temporal alignment failed — insufficient observations.",
    time: "3 h ago",
  },
];

export const mockStats = [
  { label: "Active Investigations", value: 12, delta: "+3 this week" },
  { label: "Changes Detected", value: 48, delta: "+11 this week" },
  { label: "Requires Review", value: 7, delta: "2 high priority" },
  { label: "Analyses Completed", value: 134, delta: "+19 this week" },
];

export const sensors = [
  { name: "Sentinel-2 L2A", resolution: "10 m", revisit: "5 days", ok: true },
  { name: "Sentinel-1 GRD (SAR)", resolution: "20 m", revisit: "6 days", ok: true },
  { name: "Landsat-9 OLI-2", resolution: "30 m", revisit: "16 days", ok: true },
  { name: "Resourcesat-2A LISS-III", resolution: "23.5 m", revisit: "24 days", ok: false },
];
