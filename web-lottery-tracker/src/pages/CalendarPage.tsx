import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, Bookmark } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { TaskRow } from "@/components/TaskRow";
import { useStore, effectiveDue, type AppStatus, type Task } from "@/lib/store";
import { daysUntil, fmtDate, fmtTime, sameDay } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DateChip({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <span className="grid w-14 shrink-0 place-items-center rounded-xl border bg-card py-1.5 tabular">
      <span className="text-[11px] font-semibold uppercase text-muted-foreground">{d.toLocaleDateString("en-US", { month: "short" })}</span>
      <span className="text-xl font-bold leading-none">{d.getDate()}</span>
    </span>
  );
}

function DeadlineLink({ t }: { t: Task }) {
  const due = effectiveDue(t);
  const inner = (
    <>
      <DateChip iso={due} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{t.lotteryName ?? t.title}</div>
        <div className="truncate text-sm text-muted-foreground">
          {t.lotteryName ? t.title : "Reminder"} · {fmtTime(due)}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  const cls = "flex items-center gap-4 rounded-lg py-3 transition-colors hover:bg-accent/50";
  return t.lotteryId ? (
    <Link to={`/lottery/${t.lotteryId}`} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export default function CalendarPage() {
  const { tasks, saved } = useStore();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);

  const open = useMemo(() => tasks.filter((t) => !t.done).sort((a, b) => effectiveDue(a).localeCompare(effectiveDue(b))), [tasks]);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    const weeks = Math.ceil((first.getDay() + new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()) / 7);
    return Array.from({ length: weeks * 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { date: d, inMonth: d.getMonth() === cursor.getMonth(), items: tasks.filter((t) => sameDay(new Date(effectiveDue(t)), d)) };
    });
  }, [cursor, tasks]);

  const monthTasks = open.filter((t) => {
    const d = new Date(effectiveDue(t));
    return d.getMonth() === cursor.getMonth() && d.getFullYear() === cursor.getFullYear();
  });
  const selectedTasks = selected ? tasks.filter((t) => sameDay(new Date(effectiveDue(t)), selected)) : [];
  const week = open.filter((t) => {
    const d = daysUntil(effectiveDue(t));
    return d >= 0 && d <= 7;
  });

  const counts = Object.values(saved).reduce(
    (acc, s) => ({ ...acc, [s.status]: acc[s.status] + 1 }),
    { saved: 0, applied: 0, waiting: 0, result: 0 } as Record<AppStatus, number>,
  );
  const progress = [
    { icon: Bookmark, value: counts.saved, label: "saved, not applied yet", tone: "bg-muted text-muted-foreground" },
    { icon: FileText, value: counts.applied, label: "applied", tone: "bg-accent text-primary" },
    { icon: Clock, value: counts.waiting, label: "waiting for results", tone: "bg-warn-soft text-warn" },
    { icon: CheckCircle2, value: counts.result, label: "result received", tone: "bg-accent text-primary" },
  ];

  const shift = (n: number) => {
    setSelected(null);
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  };

  return (
    <AppShell header={<PageTitle title="Calendar" subtitle="Track deadlines and your progress at a glance." />}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="space-y-5">
          <section className="panel p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="flex-1 text-2xl font-bold tabular sm:text-[28px]">
                {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelected(today);
                }}
              >
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
              {WEEKDAYS.map((d) => (
                <div key={d} className="pb-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 overflow-hidden rounded-xl border">
              {cells.map(({ date, inMonth, items }, i) => {
                const isToday = sameDay(date, today);
                const isSel = selected && sameDay(date, selected);
                const pending = items.filter((t) => !t.done);
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(date)}
                    aria-label={`${fmtDate(date)}, ${items.length} alerts`}
                    className={cn(
                      "relative flex h-16 flex-col items-center justify-start gap-1.5 border-b border-r pt-2.5 text-[15px] transition-colors sm:h-[72px]",
                      (i + 1) % 7 === 0 && "border-r-0",
                      i >= cells.length - 7 && "border-b-0",
                      !inMonth && "text-muted-foreground/50",
                      isSel ? "bg-accent" : "hover:bg-accent/40",
                    )}
                  >
                    <span className={cn("grid h-7 w-7 place-items-center rounded-full tabular", isToday && "bg-primary font-semibold text-primary-foreground")}>
                      {date.getDate()}
                    </span>
                    {items.length > 0 && (
                      <span className="flex gap-1">
                        {items.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className={cn("h-2 w-2 rounded-full", t.done ? "bg-muted-foreground/40" : daysUntil(effectiveDue(t)) <= 7 ? "bg-warn" : "bg-primary")}
                          />
                        ))}
                      </span>
                    )}
                    {pending.length > 3 && <span className="absolute right-1.5 top-1 text-[10px] text-muted-foreground">+{pending.length - 3}</span>}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Upcoming
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-warn" /> Due within 7 days
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" /> Done
              </span>
            </div>
          </section>

          <section className="panel px-6 pb-3 pt-5">
            <h2 className="border-b pb-3 text-lg font-bold">
              {selected ? fmtDate(selected, { weekday: "long" }) : `Deadlines in ${cursor.toLocaleDateString("en-US", { month: "long" })}`}
            </h2>
            {selected ? (
              selectedTasks.length ? (
                <ul className="divide-y">
                  {selectedTasks.map((t) => (
                    <TaskRow key={t.id} task={t} />
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-sm text-muted-foreground">Nothing due on this day.</p>
              )
            ) : monthTasks.length ? (
              <div className="divide-y">
                {monthTasks.map((t) => (
                  <DeadlineLink key={t.id} t={t} />
                ))}
              </div>
            ) : (
              <p className="py-6 text-sm text-muted-foreground">No open alerts this month.</p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="panel p-5">
            <h2 className="text-lg font-bold">Your progress</h2>
            <p className="mt-1 text-sm text-muted-foreground">Where you stand with your lottery applications.</p>
            <ul className="mt-3 divide-y">
              {progress.map(({ icon: Icon, value, label, tone }) => (
                <li key={label} className="flex items-center gap-4 py-3.5">
                  <span className={cn("grid h-12 w-12 place-items-center rounded-full", tone)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-2xl font-bold leading-none tabular">{value}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{label}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">Update the status from each lottery's page.</p>
          </section>

          <section className="panel p-5">
            <h2 className="text-lg font-bold">Upcoming deadlines</h2>
            <p className="text-sm text-muted-foreground">Next 7 days</p>
            <div className="mt-2 divide-y">
              {week.length ? week.slice(0, 5).map((t) => <DeadlineLink key={t.id} t={t} />) : <p className="py-5 text-sm text-muted-foreground">You're clear for the week.</p>}
            </div>
            <Button asChild variant="outline" className="mt-3 h-11 w-full border-primary/40 text-primary hover:text-primary">
              <Link to="/">View all alerts</Link>
            </Button>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
