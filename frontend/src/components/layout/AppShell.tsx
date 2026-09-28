import { Link, linkOptions, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  Clock,
  LayoutDashboard,
  Menu,
  Radar,
  Satellite,
  Search,
  Settings,
  UserRound,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  CircleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { SystemModeBadge, SystemStatusPanel } from "./SystemStatusPanel";
import { Button } from "@/components/common/Button";

const NAV = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    match: "/",
    link: linkOptions({ to: "/" }),
  },
  { label: "Search", icon: Search, match: "/search", link: linkOptions({ to: "/search" }) },
  {
    label: "Analysis",
    icon: Satellite,
    match: "/analysis",
    link: linkOptions({ to: "/analysis/$id", params: { id: "SITE-003" } }),
  },
  { label: "History", icon: Clock, match: "/history", link: linkOptions({ to: "/history" }) },
  { label: "Settings", icon: Settings, match: "/settings", link: linkOptions({ to: "/settings" }) },
];

function NotificationIcon({ kind }: { kind: string }) {
  const map = {
    success: <CheckCircle2 className="h-4 w-4 text-ok" />,
    warning: <AlertTriangle className="h-4 w-4 text-warn" />,
    error: <CircleAlert className="h-4 w-4 text-destructive" />,
    info: <Info className="h-4 w-4 text-primary" />,
  } as Record<string, ReactNode>;
  return <>{map[kind] ?? map["info"]}</>;
}

function NotificationsMenu() {
  const { notifications, unreadCount, markAllRead, clearNotifications } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-change px-1 font-mono text-[10px] text-background">
            {unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] overflow-hidden rounded-lg border border-border bg-popover shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="label-caps">Alerts</span>
            <button
              onClick={clearNotifications}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-3 py-8 text-center text-xs text-muted-foreground">
                No notifications
              </li>
            )}
            {notifications.map((n) => (
              <li key={n.id} className="flex gap-2.5 px-3 py-2.5 hover:bg-accent/40">
                <span className="mt-0.5">
                  <NotificationIcon kind={n.kind} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {n.detail}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="System status"
        className="rounded-full transition-opacity hover:opacity-80"
      >
        <SystemModeBadge />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-3 shadow-2xl">
          <SystemStatusPanel />
        </div>
      )}
    </div>
  );
}

function GlobalSearch() {
  const navigate = useNavigate();
  const { setLastQuery } = useApp();
  const [value, setValue] = useState("");
  return (
    <form
      className="relative hidden flex-1 md:block"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        setLastQuery(value.trim());
        navigate({ to: "/search", search: { q: value.trim() } });
      }}
      role="search"
    >
      <label htmlFor="global-search" className="sr-only">
        Global satellite search
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id="global-search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search satellite imagery using natural language…"
        className="h-9 w-full rounded-md border border-input bg-surface/80 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50"
      />
    </form>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Main">
      {NAV.map((item) => {
        const active = item.exact ? pathname === "/" : pathname.startsWith(item.match);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            {...item.link}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent text-foreground shadow-[inset_2px_0_0_0_var(--color-primary)]"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className={cn("h-4 w-4", active && "text-primary")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-3 backdrop-blur-md md:px-4">
        <button
          className="rounded-md p-2 text-muted-foreground hover:text-foreground lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
            <Radar className="h-4 w-4" />
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold leading-tight tracking-tight">
              ORBITAL SENTINEL
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              SIH26227 · Change Intelligence
            </span>
          </span>
        </Link>
        <div className="mx-2 hidden h-6 w-px bg-border md:block" />
        <GlobalSearch />
        <div className="ml-auto flex items-center gap-2">
          <StatusMenu />
          <NotificationsMenu />
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1">
            <UserRound className="h-4 w-4 text-primary" />
            <span className="hidden text-xs sm:block">
              <span className="block leading-tight">A. Verma</span>
              <span className="block font-mono text-[10px] text-muted-foreground">GEO-ANALYST</span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
          <SidebarNav />
          <div className="border-t border-sidebar-border p-3">
            <SystemStatusPanel />
          </div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-sidebar">
              <div className="flex h-14 items-center justify-between border-b border-border px-3">
                <span className="label-caps">Navigation</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
              <div className="border-t border-sidebar-border p-3">
                <SystemStatusPanel />
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
