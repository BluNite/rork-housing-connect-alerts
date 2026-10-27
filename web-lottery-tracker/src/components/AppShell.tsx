import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, ChevronDown, LogOut, Menu, Search, Sparkles, User as UserIcon } from "lucide-react";
import { useStore, effectiveDue } from "@/lib/store";
import { notificationsSupported } from "@/lib/reminders";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandMark } from "./BrandMark";
import { DedicationRibbon } from "@/pages/Privacy";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "My Alerts", icon: Bell, end: true },
  { to: "/browse", label: "Browse Lotteries", icon: Search, end: false },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, end: false },
  { to: "/account", label: "Account", icon: UserIcon, end: false },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { user } = useStore();
  const isPro = user?.plan === "pro";
  return (
    <div className="grad-deep flex h-full flex-col px-4 py-7 text-white">
      <Link to="/" onClick={onNavigate} className="flex items-start gap-3 px-2">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/95 shadow-sm">
          <BrandMark className="h-9 w-9" />
        </span>
        <div>
          <div className="text-[17px] font-bold leading-tight tracking-tight">Lottery Tracker</div>
          <div className="mt-1 text-xs leading-snug text-white/60">NYC affordable housing alerts</div>
        </div>
      </Link>
      <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => {
          const active = end ? pathname === to : pathname.startsWith(to) || (to === "/browse" && pathname.startsWith("/lottery"));
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors",
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {active && <span className="absolute -left-4 top-2 bottom-2 w-[3px] rounded-r bg-white/90" />}
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </NavLink>
          );
        })}
      </nav>
      {!isPro && (
        <Link
          to="/upgrade"
          onClick={onNavigate}
          className="mt-4 flex items-center gap-3 rounded-xl bg-white/15 px-3 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/25"
        >
          <Sparkles className="h-5 w-5" />
          Go ad-free with Pro
        </Link>
      )}
      <div className="mt-auto border-t border-white/15 pt-5">
        <p className="px-3 text-[11px] text-white/40">
          made with <span aria-label="blue heart">💙</span> by <span className="font-semibold text-white/60">bluNite</span>
        </p>
        <BackendStatus />
      </div>
    </div>
  );
}

type HealthState = "checking" | "up" | "down" | "absent";

/** Polls /healthz (served by the Docker nginx config) every 30 seconds. */
function useBackendHealth(): HealthState {
  const [state, setState] = useState<HealthState>("checking");
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const res = await fetch("/healthz", { cache: "no-store" });
        // 404 = this host doesn't run the health endpoint (e.g. Rork hosting);
        // hide the indicator rather than show a false alarm.
        if (res.status === 404) {
          if (alive) setState("absent");
          return;
        }
        if (alive) setState(res.ok ? "up" : "down");
      } catch {
        if (alive) setState("down");
      }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return state;
}

const HEALTH_COPY: Record<Exclude<HealthState, "absent">, { dot: string; label: string }> = {
  checking: { dot: "bg-white/40", label: "Checking status…" },
  up: { dot: "bg-emerald-400", label: "All systems normal" },
  down: { dot: "bg-red-400", label: "Connection issue" },
};

function BackendStatus() {
  const state = useBackendHealth();
  if (state === "absent") return null;
  const { dot, label } = HEALTH_COPY[state];
  return (
    <p className="mt-3 flex items-center gap-1.5 px-3 text-[11px] text-white/40" aria-live="polite">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot, state === "checking" && "animate-pulse")} aria-hidden />
      {label}
    </p>
  );
}

function UserMenu() {
  const { user, signOut } = useStore();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="grad-primary grid h-10 w-10 place-items-center rounded-full text-base font-semibold text-white shadow-sm">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-[15px] font-medium sm:inline">{user.name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="font-medium">{user.name}</div>
          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/account")}>
          <UserIcon className="mr-2 h-4 w-4" /> Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Fires browser notifications for alerts due within 24 hours. */
function useDueNotifications() {
  const { tasks, prefs, notified, markNotified } = useStore();
  useEffect(() => {
    if (!prefs.browserNotify || !notificationsSupported() || Notification.permission !== "granted") return;
    const check = () => {
      const soon = tasks.filter((t) => {
        if (t.done || notified.includes(t.id)) return false;
        const ms = new Date(effectiveDue(t)).getTime() - Date.now();
        return ms > 0 && ms < 86_400_000;
      });
      soon.forEach((t) => new Notification(t.title, { body: t.lotteryName ?? "Housing lottery reminder", icon: "/icon.png" }));
      if (soon.length) markNotified(soon.map((t) => t.id));
    };
    check();
    const id = setInterval(check, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [tasks, prefs.browserNotify, notified, markNotified]);
}

export function AppShell({ children, header }: { children: ReactNode; header?: ReactNode }) {
  const [open, setOpen] = useState(false);
  useDueNotifications();
  return (
    <div className="min-h-screen bg-background">
      <aside className="grad-deep fixed inset-y-0 left-0 hidden w-[260px] lg:block">
        <SidebarContent />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="grad-deep w-[280px] border-none p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-[260px]">
        <div className="mx-auto max-w-[1280px] px-5 pb-36 pt-6 sm:px-8 lg:pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <button
                onClick={() => setOpen(true)}
                className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-card lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">{header}</div>
            </div>
            <UserMenu />
          </div>
          <main className="mt-7">{children}</main>
        </div>
      </div>
      <DedicationRibbon />
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="font-display text-grad text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">{title}</h1>
      {subtitle && <p className="mt-1.5 text-base text-muted-foreground sm:text-lg">{subtitle}</p>}
    </div>
  );
}
