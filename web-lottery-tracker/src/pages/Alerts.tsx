import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Bookmark, Building2, CalendarDays, CalendarPlus, CheckCircle2, Clock, FileText, Plus, BellRing, Sparkles } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { TaskRow } from "@/components/TaskRow";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { useStore, effectiveDue, type Task } from "@/lib/store";
import { daysUntil, fmtDate, fmtTime } from "@/lib/dates";
import { downloadIcs, notificationsSupported } from "@/lib/reminders";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/AdSlot";
import { ProCard } from "@/components/ProCard";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

function Stat({ icon: Icon, value, label }: { icon: ComponentType<{ className?: string }>; value: number; label: string }) {
  return (
    <div className="panel flex items-center gap-4 p-5">
      <span className="grad-primary grid h-12 w-12 shrink-0 place-items-center rounded-full text-white shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-[30px] font-bold leading-none tabular">{value}</div>
        <div className="mt-1.5 text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Group({ title, tone, tasks, initial = 4 }: { title: string; tone: "warn" | "blue" | "gray"; tasks: Task[]; initial?: number }) {
  const [all, setAll] = useState(false);
  if (tasks.length === 0) return null;
  const Icon = tone === "warn" ? AlertCircle : Clock;
  const shown = all ? tasks : tasks.slice(0, initial);
  return (
    <section className="panel px-6 pb-2 pt-5 rise">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="flex items-center gap-3 text-lg font-bold">
          <span
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full text-white",
              tone === "warn" ? "grad-orange" : tone === "blue" ? "grad-primary" : "bg-muted-foreground/70",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        {tasks.length > initial && (
          <button onClick={() => setAll((v) => !v)} className="text-sm font-medium text-primary hover:underline">
            {all ? "Show less" : `See all (${tasks.length})`}
          </button>
        )}
      </div>
      <ul className="divide-y">
        {shown.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </ul>
    </section>
  );
}

function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, new Date(iso).getTime() - now);
  const parts = [
    [Math.floor(ms / 86_400_000), "Days"],
    [Math.floor(ms / 3_600_000) % 24, "Hours"],
    [Math.floor(ms / 60_000) % 60, "Minutes"],
    [Math.floor(ms / 1000) % 60, "Seconds"],
  ] as const;
  return (
    <div className="grid grid-cols-4 overflow-hidden rounded-xl border" role="timer" aria-label="Time remaining">
      {parts.map(([v, l], i) => (
        <div key={l} className={cn("py-3 text-center", i > 0 && "border-l")}>
          <div className="text-[26px] font-bold leading-none tabular">{v}</div>
          <div className="mt-1.5 text-xs text-muted-foreground">{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function Alerts() {
  const { user, tasks, saved, prefs, setPrefs } = useStore();
  const navigate = useNavigate();

  const { dueSoon, month, later, done, next, weekCount } = useMemo(() => {
    const open = tasks.filter((t) => !t.done).sort((a, b) => effectiveDue(a).localeCompare(effectiveDue(b)));
    const d = (t: Task) => daysUntil(effectiveDue(t));
    const upcoming = open.find((t) => new Date(effectiveDue(t)).getTime() > Date.now());
    return {
      dueSoon: open.filter((t) => d(t) <= 7),
      month: open.filter((t) => d(t) > 7 && d(t) <= 31),
      later: open.filter((t) => d(t) > 31),
      done: tasks.filter((t) => t.done).sort((a, b) => effectiveDue(b).localeCompare(effectiveDue(a))),
      next: upcoming,
      weekCount: open.filter((t) => d(t) >= 0 && d(t) <= 7).length,
    };
  }, [tasks]);

  const savedList = Object.values(saved);
  const applied = savedList.filter((s) => s.status !== "saved").length;

  const toggleNotify = async (on: boolean) => {
    if (!on) return setPrefs({ browserNotify: false });
    if (!notificationsSupported()) return toast.error("This browser doesn't support notifications");
    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (perm === "granted") {
      setPrefs({ browserNotify: true });
      toast.success("Browser alerts on", { description: "We'll notify you within 24 hours of each deadline while this site is open." });
    } else toast.error("Notifications are blocked", { description: "Allow notifications for this site in your browser settings." });
  };

  return (
    <AppShell header={<PageTitle title={`${greeting()}, ${user?.name.split(" ")[0]}`} subtitle="Here's what's happening with your saved lotteries." />}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="space-y-5">
          {user?.plan !== "pro" && (
            <section
              aria-label="Upgrade to Pro"
              className="grad-orange flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4 text-white shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
                <div>
                  <p className="font-bold leading-snug">Go ad-free with Pro</p>
                  <p className="text-[13px] leading-snug opacity-90">$4/mo or $24/yr — every feature, zero ads, cancel anytime.</p>
                </div>
              </div>
              <Button onClick={() => navigate("/upgrade")} className="h-10 gap-1.5 bg-white font-bold text-warn-ink shadow-sm hover:bg-white/90">
                Upgrade <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </section>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat icon={CalendarDays} value={weekCount} label={weekCount === 1 ? "deadline this week" : "deadlines this week"} />
            <Stat icon={Bookmark} value={savedList.length} label={savedList.length === 1 ? "saved lottery" : "saved lotteries"} />
            <Stat icon={FileText} value={applied} label="applied" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your checklist</h2>
            <AddReminderDialog>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg bg-card">
                <Plus className="h-4 w-4" /> Add reminder
              </Button>
            </AddReminderDialog>
          </div>

          {tasks.length === 0 ? (
            <div className="panel flex flex-col items-center px-6 py-16 text-center rise">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-primary">
                <BellRing className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-xl font-bold">No alerts yet</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Save a lottery and we'll add the steps for it: check eligibility, gather documents, and apply before the deadline.
              </p>
              <Button className="mt-6 h-11 gap-2 px-6" onClick={() => navigate("/browse")}>
                Browse open lotteries <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Group title="Due soon" tone="warn" tasks={dueSoon} />
              <Group title="This month" tone="blue" tasks={month} />
              <Group title="Later" tone="gray" tasks={later} />
              {dueSoon.length + month.length + later.length === 0 && (
                <div className="panel flex items-center gap-4 p-6 rise">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold">All caught up</div>
                    <div className="text-sm text-muted-foreground">Every alert is checked off. Find another lottery to apply to.</div>
                  </div>
                </div>
              )}
              <Group title="Completed" tone="gray" tasks={done} initial={2} />
            </>
          )}
        </div>

        <aside className="space-y-5">
          <ProCard />
          <section className="panel p-5">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-bold">Next deadline</h2>
              {next?.lotteryId && (
                <Link to={`/lottery/${next.lotteryId}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  View details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            {next ? (
              <>
                <div className="flex items-center gap-4 py-5">
              <span className="grad-primary grid h-14 w-14 shrink-0 place-items-center rounded-full text-white shadow-sm">
                    <CalendarDays className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xl font-bold tabular">
                      {fmtDate(effectiveDue(next), { year: undefined })}, {fmtTime(effectiveDue(next))}
                    </div>
                    <div className="truncate text-muted-foreground">
                      {next.title}
                      {next.lotteryName ? ` · ${next.lotteryName}` : ""}
                    </div>
                  </div>
                </div>
                <Countdown iso={effectiveDue(next)} />
                {next.lotteryId && (
                  <Button className="mt-5 h-11 w-full text-[15px]" onClick={() => navigate(`/lottery/${next.lotteryId}`)}>
                    View lottery details
                  </Button>
                )}
              </>
            ) : (
              <p className="py-6 text-sm text-muted-foreground">Nothing coming up. Save a lottery to start a countdown.</p>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="text-lg font-bold">Notification settings</h2>
            <p className="mt-1 text-sm text-muted-foreground">Get reminded about important dates.</p>
            <div className="mt-4 divide-y">
              <label className="flex items-center justify-between gap-4 py-3.5">
                <span>
                  <span className="block font-medium">Browser alerts</span>
                  <span className="block text-xs text-muted-foreground">Within 24 hours of each deadline</span>
                </span>
                <Switch checked={prefs.browserNotify} onCheckedChange={toggleNotify} />
              </label>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <span>
                  <span className="block font-medium">Document reminder</span>
                  <span className="block text-xs text-muted-foreground">For newly saved lotteries</span>
                </span>
                <Select value={String(prefs.remindDaysBefore)} onValueChange={(v) => setPrefs({ remindDaysBefore: Number(v) })}>
                  <SelectTrigger className="h-9 w-[132px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 3, 5, 7].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} day{d > 1 ? "s" : ""} before
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-3.5">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={tasks.every((t) => t.done)}
                  onClick={() => {
                    downloadIcs(tasks);
                    toast.success("Calendar file downloaded", { description: "Open it to add your alerts to Google, Apple, or Outlook calendar." });
                  }}
                >
                  <CalendarPlus className="h-4 w-4" /> Add alerts to my calendar
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-gradient-to-br from-accent via-card to-warn-soft/60 p-5 ring-1 ring-accent/60">
            <div className="flex gap-4">
              <Building2 className="h-8 w-8 shrink-0 text-primary" />
              <div>
                <h3 className="font-bold leading-snug">Apply to as many as you qualify for.</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Applying is free and lotteries are random, so applying to more of them raises your chances. Applications are submitted on NYC Housing Connect.
                </p>
                <a
                  href="https://housingconnect.nyc.gov/PublicWeb/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Go to Housing Connect <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </section>

          <AdSlot />
        </aside>
      </div>
    </AppShell>
  );
}
