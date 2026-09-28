import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  mockNotifications,
  mockSystemStatus,
  type ConnectivityMode,
} from "@/data/mockSystemStatus";
import { mockHistory } from "@/data/mockHistory";
import type { AppNotification, HistoryRecord, ReviewDecision } from "@/data/types";
import {
  BACKEND_HEALTH_META,
  checkBackendHealth,
  USING_MOCK_DATA,
  type BackendHealth,
} from "@/services/api";

export interface ReviewState {
  decision: ReviewDecision;
  comment: string;
  category?: string;
  at: string;
}

interface AppContextValue {
  notifications: AppNotification[];
  pushNotification: (n: Omit<AppNotification, "id" | "time">) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;
  mode: ConnectivityMode;
  setMode: (m: ConnectivityMode) => void;
  lastSync: string;
  backendHealth: BackendHealth;
  reviews: Record<string, ReviewState>;
  saveReview: (id: string, r: ReviewState) => void;
  history: HistoryRecord[];
  lastQuery: string;
  setLastQuery: (q: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [mode, setMode] = useState<ConnectivityMode>(mockSystemStatus.mode);
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({});
  const [lastQuery, setLastQuery] = useState("");
  const [backendHealth, setBackendHealth] = useState<BackendHealth>(
    USING_MOCK_DATA ? BACKEND_HEALTH_META.demo : BACKEND_HEALTH_META.checking,
  );

  useEffect(() => {
    let active = true;
    checkBackendHealth().then((health) => {
      if (active) setBackendHealth(health);
    });
    return () => {
      active = false;
    };
  }, []);

  const pushNotification = useCallback((n: Omit<AppNotification, "id" | "time">) => {
    setNotifications((prev) => [{ ...n, id: `n${Date.now()}`, time: "just now" }, ...prev]);
  }, []);

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );
  const clearNotifications = useCallback(() => setNotifications([]), []);

  const saveReview = useCallback((id: string, r: ReviewState) => {
    setReviews((prev) => ({ ...prev, [id]: r }));
  }, []);

  const history = useMemo<HistoryRecord[]>(
    () => mockHistory.map((h) => (reviews[h.id] ? { ...h, decision: reviews[h.id]!.decision } : h)),
    [reviews],
  );

  const value = useMemo(
    () => ({
      notifications,
      pushNotification,
      markAllRead,
      clearNotifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      mode,
      setMode,
      lastSync: mockSystemStatus.lastSync,
      backendHealth,
      reviews,
      saveReview,
      history,
      lastQuery,
      setLastQuery,
    }),
    [
      notifications,
      pushNotification,
      markAllRead,
      clearNotifications,
      mode,
      backendHealth,
      reviews,
      saveReview,
      history,
      lastQuery,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
