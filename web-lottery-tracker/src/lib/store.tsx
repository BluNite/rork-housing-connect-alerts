import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import type { Lottery } from "./lotteries";
import { DAY } from "./dates";
import { supabase } from "./supabase";
import type { Database } from "@/integrations/supabase/types";

export type AppStatus = "saved" | "applied" | "waiting" | "result";
export type Plan = "free" | "pro";
export const STATUS_LABEL: Record<AppStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  waiting: "Waiting for results",
  result: "Result received",
};

export interface Task {
  id: string;
  lotteryId: string | null;
  lotteryName?: string;
  borough?: string;
  title: string;
  due: string;
  done: boolean;
  snoozedUntil?: string;
  createdAt: string;
}

export interface SavedLottery {
  lotteryId: string;
  name: string;
  borough: string;
  end: string | null;
  status: AppStatus;
  savedAt: string;
}

export interface Prefs {
  browserNotify: boolean;
  remindDaysBefore: number;
}

interface UserData {
  tasks: Task[];
  saved: Record<string, SavedLottery>;
  prefs: Prefs;
  notified: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  createdAt: string;
  /** ISO date the account is scheduled for permanent deletion, or null. */
  deletionAt: string | null;
}

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type SavedRow = Database["public"]["Tables"]["saved_lotteries"]["Row"];

const emptyData = (): UserData => ({
  tasks: [],
  saved: {},
  prefs: { browserNotify: false, remindDaysBefore: 3 },
  notified: [],
});

/** Clamp user-supplied text before it reaches the database (privacy + abuse limits). */
const clampText = (s: string, max: number) => s.trim().slice(0, max);

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** The date a task is actually due, honouring snooze. */
export const effectiveDue = (t: Task) =>
  t.snoozedUntil && new Date(t.snoozedUntil) > new Date(t.due) ? t.snoozedUntil : t.due;

/** Application deadlines close at 11:59 PM on the listed end date. */
function defaultTasks(l: Lottery, remindDaysBefore: number): Task[] {
  const now = Date.now();
  const createdAt = new Date().toISOString();
  const base = { lotteryId: l.id, lotteryName: l.name, borough: l.borough, done: false, createdAt };
  if (!l.end || new Date(l.end).getTime() < now) {
    return [
      { ...base, id: uid(), title: "Check application status on Housing Connect", due: new Date(now + 3 * DAY).toISOString() },
    ];
  }
  const end = new Date(l.end).getTime();
  const clamp = (t: number) => new Date(Math.max(now + 60 * 60 * 1000, Math.min(t, end))).toISOString();
  return [
    { ...base, id: uid(), title: "Check income eligibility", due: clamp(end - (remindDaysBefore + 2) * DAY) },
    { ...base, id: uid(), title: "Gather documents", due: clamp(end - remindDaysBefore * DAY) },
    { ...base, id: uid(), title: "Submit application", due: new Date(end).toISOString() },
  ];
}

const fromTask = (r: TaskRow): Task => ({
  id: r.id,
  lotteryId: r.lottery_id,
  lotteryName: r.lottery_name ?? undefined,
  borough: r.borough ?? undefined,
  title: r.title,
  due: r.due,
  done: r.done,
  snoozedUntil: r.snoozed_until ?? undefined,
  createdAt: r.created_at,
});

const toTask = (t: Task, userId: string) => ({
  id: t.id,
  user_id: userId,
  lottery_id: t.lotteryId,
  lottery_name: t.lotteryName ?? null,
  borough: t.borough ?? null,
  title: t.title,
  due: t.due,
  done: t.done,
  snoozed_until: t.snoozedUntil ?? null,
  created_at: t.createdAt,
});

const fromSaved = (r: SavedRow): SavedLottery => ({
  lotteryId: r.lottery_id,
  name: r.name,
  borough: r.borough ?? "",
  end: r.end_date,
  status: (r.status as AppStatus) ?? "saved",
  savedAt: r.saved_at,
});

const toSaved = (s: SavedLottery, userId: string) => ({
  user_id: userId,
  lottery_id: s.lotteryId,
  name: s.name,
  borough: s.borough,
  end_date: s.end,
  status: s.status,
  saved_at: s.savedAt,
});

/** Run a write in the background; surface failures without blocking the UI. */
function sync(label: string, op: PromiseLike<{ error: { message: string } | null }>) {
  Promise.resolve(op).then(
    ({ error }) => {
      if (error) {
        console.error(`[sync] ${label}`, error);
        toast.error("Couldn't sync that change", { description: error.message });
      }
    },
    (err: unknown) => {
      console.error(`[sync] ${label}`, err);
      toast.error("Couldn't sync that change", { description: "Check your connection and try again." });
    },
  );
}

/** One-time import of data saved by the earlier browser-only version. */
async function importLegacy(userId: string, email: string) {
  const key = `ltn:data:${email.toLowerCase()}`;
  const raw = localStorage.getItem(key);
  if (!raw) return false;
  try {
    const legacy = JSON.parse(raw) as Partial<UserData>;
    const saved = Object.values(legacy.saved ?? {});
    const tasks = legacy.tasks ?? [];
    if (saved.length) await supabase.from("saved_lotteries").upsert(saved.map((s) => toSaved(s, userId)));
    if (tasks.length) await supabase.from("tasks").upsert(tasks.map((t) => toTask(t, userId)));
    if (legacy.prefs) {
      await supabase
        .from("profiles")
        .update({ browser_notify: legacy.prefs.browserNotify, remind_days_before: legacy.prefs.remindDaysBefore })
        .eq("id", userId);
    }
    localStorage.removeItem(key);
    return saved.length + tasks.length > 0;
  } catch (err) {
    console.error("[sync] legacy import", err);
    return false;
  }
}

interface Store {
  user: User | null;
  ready: boolean;
  loading: boolean;
  refresh: () => void;
  signOut: () => void;
  updateProfile: (name: string) => void;
  tasks: Task[];
  saved: Record<string, SavedLottery>;
  prefs: Prefs;
  isSaved: (id: string) => boolean;
  saveLottery: (l: Lottery) => void;
  unsaveLottery: (id: string) => void;
  setStatus: (id: string, status: AppStatus) => void;
  toggleTask: (id: string) => void;
  snoozeTask: (id: string, days: number) => void;
  deleteTask: (id: string) => void;
  addTask: (t: { title: string; due: string; lottery?: Pick<Lottery, "id" | "name" | "borough"> }) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  markNotified: (ids: string[]) => void;
  notified: string[];
  clearData: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<UserData>(emptyData);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  const load = useCallback(async (id: string, email: string, metaName?: string) => {
    const [p, s, t] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase.from("saved_lotteries").select("*").eq("user_id", id),
      supabase.from("tasks").select("*").eq("user_id", id).order("created_at"),
    ]);
    const err = p.error ?? s.error ?? t.error;
    if (err) {
      console.error("[sync] load", err);
      toast.error("Couldn't load your alerts", { description: err.message });
    }
    let profile = p.data;
    if (!profile && !p.error) {
      const fallbackName = metaName || email.split("@")[0];
      const ins = await supabase.from("profiles").upsert({ id, email, name: fallbackName }).select().single();
      if (ins.error) console.error("[sync] profile create", ins.error);
      profile = ins.data;
    }
    setUser({
      id,
      email,
      name: profile?.name || metaName || email.split("@")[0],
      plan: (profile?.plan === "pro" ? "pro" : "free") as Plan,
      createdAt: profile?.created_at ?? new Date().toISOString(),
      deletionAt: profile?.deletion_scheduled_at ?? null,
    });
    setData({
      tasks: (t.data ?? []).map(fromTask),
      saved: Object.fromEntries((s.data ?? []).map((r) => [r.lottery_id, fromSaved(r)])),
      prefs: {
        browserNotify: profile?.browser_notify ?? false,
        remindDaysBefore: profile?.remind_days_before ?? 3,
      },
      notified: profile?.notified ?? [],
    });
  }, []);

  useEffect(() => {
    if (!userId || !session) {
      setUser(null);
      setData(emptyData());
      return;
    }
    let cancelled = false;
    const email = session.user.email ?? "";
    const metaName = (session.user.user_metadata?.full_name ?? session.user.user_metadata?.name) as string | undefined;
    setLoading(true);
    (async () => {
      const imported = await importLegacy(userId, email);
      if (cancelled) return;
      await load(userId, email, metaName);
      if (!cancelled) {
        setLoading(false);
        if (imported) toast.success("Moved your saved lotteries to your account");
      }
    })();
    return () => {
      cancelled = true;
    };
    // Reload only when the signed-in account changes, not on token refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Pull fresh data when the tab regains focus so edits from other devices show up.
  useEffect(() => {
    if (!userId || !session) return;
    const onFocus = () => {
      if (document.visibilityState === "visible") load(userId, session.user.email ?? "");
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [userId, session, load]);

  /** Refetch everything (e.g. right after returning from Stripe checkout). */
  const refresh = useCallback(() => {
    if (!session) return;
    setLoading(true);
    load(session.user.id, session.user.email ?? "").finally(() => setLoading(false));
  }, [session, load]);

  const signOut = useCallback(() => {
    supabase.auth.signOut().then(({ error }) => {
      if (error) toast.error("Couldn't sign out", { description: error.message });
    });
  }, []);

  const updateProfile = useCallback(
    (name: string) => {
      if (!user) return;
      const clean = clampText(name, 80) || user.name;
      setUser({ ...user, name: clean });
      sync("profile", supabase.from("profiles").update({ name: clean, updated_at: new Date().toISOString() }).eq("id", user.id));
    },
    [user],
  );

  const store = useMemo<Store>(() => {
    const id = user?.id ?? "";
    const updateTask = (taskId: string, fn: (t: Task) => Task) => {
      const cur = dataRef.current.tasks.find((t) => t.id === taskId);
      if (!cur) return;
      const next = fn(cur);
      setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === taskId ? next : t)) }));
      sync("task update", supabase.from("tasks").update({ done: next.done, snoozed_until: next.snoozedUntil ?? null }).eq("id", taskId));
    };

    return {
      user,
      ready,
      loading,
      refresh,
      signOut,
      updateProfile,
      tasks: data.tasks,
      saved: data.saved,
      prefs: data.prefs,
      notified: data.notified,
      isSaved: (lid) => !!data.saved[lid],
      saveLottery: (l) => {
        if (dataRef.current.saved[l.id] || !id) return;
        const s: SavedLottery = { lotteryId: l.id, name: l.name, borough: l.borough, end: l.end, status: "saved", savedAt: new Date().toISOString() };
        const newTasks = defaultTasks(l, dataRef.current.prefs.remindDaysBefore);
        setData((d) => ({ ...d, saved: { ...d.saved, [l.id]: s }, tasks: [...d.tasks, ...newTasks] }));
        sync("save", supabase.from("saved_lotteries").upsert(toSaved(s, id)));
        sync("tasks insert", supabase.from("tasks").insert(newTasks.map((t) => toTask(t, id))));
      },
      unsaveLottery: (lid) => {
        setData((d) => {
          const saved = { ...d.saved };
          delete saved[lid];
          return { ...d, saved, tasks: d.tasks.filter((t) => t.lotteryId !== lid) };
        });
        sync("unsave", supabase.from("saved_lotteries").delete().eq("user_id", id).eq("lottery_id", lid));
        sync("tasks delete", supabase.from("tasks").delete().eq("user_id", id).eq("lottery_id", lid));
      },
      setStatus: (lid, status) => {
        if (!dataRef.current.saved[lid]) return;
        setData((d) => ({ ...d, saved: { ...d.saved, [lid]: { ...d.saved[lid], status } } }));
        sync("status", supabase.from("saved_lotteries").update({ status }).eq("user_id", id).eq("lottery_id", lid));
      },
      toggleTask: (tid) => updateTask(tid, (t) => ({ ...t, done: !t.done })),
      snoozeTask: (tid, days) =>
        updateTask(tid, (t) => ({
          ...t,
          snoozedUntil: new Date(Math.max(Date.now(), new Date(effectiveDue(t)).getTime()) + days * DAY).toISOString(),
        })),
      deleteTask: (tid) => {
        setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== tid) }));
        sync("task delete", supabase.from("tasks").delete().eq("id", tid));
      },
      addTask: ({ title, due, lottery }) => {
        if (!id) return;
        const t: Task = {
          id: uid(),
          title: clampText(title, 140) || "Reminder",
          due,
          done: false,
          createdAt: new Date().toISOString(),
          lotteryId: lottery?.id ?? null,
          lotteryName: lottery ? clampText(lottery.name, 160) : undefined,
          borough: lottery?.borough,
        };
        setData((d) => ({ ...d, tasks: [...d.tasks, t] }));
        sync("task insert", supabase.from("tasks").insert(toTask(t, id)));
      },
      setPrefs: (p) => {
        const next = { ...dataRef.current.prefs, ...p };
        if (p.remindDaysBefore !== undefined) next.remindDaysBefore = Math.min(30, Math.max(1, Math.round(p.remindDaysBefore)));
        next.browserNotify = Boolean(next.browserNotify);
        setData((d) => ({ ...d, prefs: next }));
        sync(
          "prefs",
          supabase.from("profiles").update({ browser_notify: next.browserNotify, remind_days_before: next.remindDaysBefore }).eq("id", id),
        );
      },
      markNotified: (ids) => {
        const next = [...dataRef.current.notified, ...ids].slice(-500);
        setData((d) => ({ ...d, notified: next }));
        sync("notified", supabase.from("profiles").update({ notified: next }).eq("id", id));
      },
      clearData: () => {
        setData((d) => ({ ...emptyData(), prefs: d.prefs }));
        sync("clear saved", supabase.from("saved_lotteries").delete().eq("user_id", id));
        sync("clear tasks", supabase.from("tasks").delete().eq("user_id", id));
        sync("clear notified", supabase.from("profiles").update({ notified: [] }).eq("id", id));
      },
    };
  }, [user, ready, loading, data, signOut, updateProfile, refresh]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
