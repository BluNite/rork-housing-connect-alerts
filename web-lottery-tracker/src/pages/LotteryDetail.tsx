import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, ExternalLink, Hash, MapPin, Plus, TrainFront } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LotteryMap } from "@/components/LotteryMap";
import { SaveButton } from "@/components/SaveButton";
import { TaskRow } from "@/components/TaskRow";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { BEDROOMS, householdSummary, housingConnectUrl, isOpen, useLottery } from "@/lib/lotteries";
import { trainBullet } from "@/lib/mta";
import { useStore, effectiveDue, STATUS_LABEL, type AppStatus } from "@/lib/store";
import { daysUntil, fmtDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const backLink = (
  <Link to="/browse" className="inline-flex items-center gap-2 pt-2 text-[15px] font-medium text-muted-foreground hover:text-foreground">
    <ArrowLeft className="h-4 w-4" /> Back to Browse Lotteries
  </Link>
);

export default function LotteryDetail() {
  const { id } = useParams();
  const { lottery: l, isLoading } = useLottery(id);
  const { saved, tasks, setStatus } = useStore();

  if (isLoading) {
    return (
      <AppShell header={backLink}>
        <Skeleton className="h-[260px] rounded-2xl" />
        <Skeleton className="mt-6 h-[320px] rounded-2xl" />
      </AppShell>
    );
  }

  if (!l) {
    return (
      <AppShell header={backLink}>
        <div className="panel px-6 py-16 text-center">
          <h1 className="text-xl font-bold">This lottery is no longer listed</h1>
          <p className="mt-2 text-muted-foreground">It may have closed. Your saved alerts for it are still in My Alerts.</p>
          {id && (
            <a href={housingConnectUrl(id)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Check on Housing Connect <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </AppShell>
    );
  }

  const s = saved[l.id];
  const myTasks = tasks.filter((t) => t.lotteryId === l.id).sort((a, b) => effectiveDue(a).localeCompare(effectiveDue(b)));
  const open = isOpen(l);
  const bedRows = BEDROOMS.filter((b) => l.bedrooms[b.key] > 0);
  const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
  const household = householdSummary(l);

  const timeline = [
    { title: "Applications opened", body: "Lottery posted on Housing Connect.", date: l.start ? fmtDate(l.start) : "—", sub: "", done: true },
    {
      title: l.end ? `Apply by ${fmtDate(l.end, { year: undefined })}` : "Application deadline",
      body: "Submit online on NYC Housing Connect before the end of the day.",
      date: l.end ? fmtDate(l.end) : "TBD",
      sub: l.end ? (open ? `${daysUntil(l.end)} days left` : "Closed") : "",
      done: !open,
    },
    { title: "Lottery & review", body: "Applications are randomly ranked, then reviewed in log order.", date: "After deadline", sub: "Estimated", done: false },
    { title: "Results", body: "If selected, you'll be contacted for an eligibility interview.", date: "2-10 months", sub: "Typical", done: false },
  ];

  return (
    <AppShell header={backLink}>
      <div className="grid gap-6 rise lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex h-[300px] flex-col overflow-hidden rounded-2xl border lg:h-auto lg:min-h-[300px]">
          {l.photo && (
            <img
              src={l.photo}
              alt={`Photo of ${l.name}`}
              loading="lazy"
              decoding="async"
              className="h-[150px] w-full shrink-0 border-b border-border object-cover"
            />
          )}
          <div className="relative min-h-[130px] flex-1">
            <LotteryMap lotteries={[l]} savedIds={s ? [l.id] : []} zoomControl={false} interactive={false} />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-6 sm:flex-row sm:items-start lg:py-2">
          <div className="min-w-0 flex-1">
            <span className={cn("inline-block rounded-md px-2.5 py-1 text-xs font-semibold", open ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
              {l.type} lottery · {open ? "Accepting applications" : "Deadline passed"}
            </span>
            <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-tight sm:text-[36px]">{l.name}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{l.borough}</p>
            <ul className="mt-4 space-y-2 text-[15px] text-foreground/80">
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" /> {l.address ? `${l.address}, ` : ""}{l.borough}, NY {l.zip}
                {l.neighborhood ? ` · ${l.neighborhood}` : ""}
              </li>
              <li className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" /> {l.units} units · {l.type} lottery
              </li>
              {l.trains.length > 0 && (
                <li className="flex items-center gap-3">
                  <TrainFront className="h-4 w-4 text-muted-foreground" /> Near trains{" "}
                  {l.trains.map((t, i) => {
                    const { bg, fg } = trainBullet(t);
                    return (
                      <span
                        key={`${t}-${i}`}
                        title={`Line ${t}`}
                        className="grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[11px] font-bold"
                        style={{ backgroundColor: bg, color: fg }}
                      >
                        {t}
                      </span>
                    );
                  })}
                </li>
              )}
              <li className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-muted-foreground" /> Lottery #{l.id}
              </li>
            </ul>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:w-[240px]">
            <SaveButton lottery={l} size="lg" />
            <Button asChild variant="outline" className="h-14 gap-2 rounded-lg text-base font-bold tracking-tight">
              <a href={housingConnectUrl(l.id)} target="_blank" rel="noreferrer">
                <ExternalLink className="h-5 w-5" /> Apply on Housing Connect
              </a>
            </Button>
          </div>
        </div>
      </div>

      {s && (
        <section className="panel mt-6 p-5 sm:p-6 rise">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Your progress</h2>
              <p className="text-sm text-muted-foreground">Update this as your application moves along.</p>
            </div>
            <div className="inline-flex flex-wrap rounded-xl border bg-background p-1" role="radiogroup" aria-label="Application status">
              {(Object.keys(STATUS_LABEL) as AppStatus[]).map((k) => (
                <button
                  key={k}
                  role="radio"
                  aria-checked={s.status === k}
                  onClick={() => setStatus(l.id, k)}
                  className={cn("rounded-lg px-3.5 py-2 text-sm font-medium transition-colors", s.status === k ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
                >
                  {STATUS_LABEL[k]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <h3 className="font-semibold">Checklist for this lottery</h3>
            <AddReminderDialog lotteryId={l.id}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
                <Plus className="h-4 w-4" /> Add step
              </Button>
            </AddReminderDialog>
          </div>
          <ul className="divide-y">
            {myTasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="panel p-6">
          <h2 className="text-xl font-bold">Units, costs & income limits</h2>
          <p className="mt-1 text-muted-foreground">Published with the official listing. Check Housing Connect for the full breakdown.</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <table className="w-full text-[15px]">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold">Unit size</th>
                  <th className="pb-3 text-right font-semibold">Units</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {bedRows.length ? (
                  bedRows.map((b, i) => (
                    <tr key={b.key} className={cn(i % 2 === 0 && "bg-muted/60")}>
                      <td className="px-2 py-3">{b.label}</td>
                      <td className="px-2 py-3 text-right font-medium">{l.bedrooms[b.key]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-3 text-muted-foreground">Not published</td>
                  </tr>
                )}
              </tbody>
            </table>
            <table className="w-full text-[15px]">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold">Costs & limits</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {[
                  l.prices.length > 0 && [
                    l.type === "Rental" ? "Monthly rent" : "Purchase price",
                    l.prices.length > 1 && l.prices[0] !== l.prices[l.prices.length - 1]
                      ? `${usd(Math.min(...l.prices))}–${usd(Math.max(...l.prices))}`
                      : usd(l.prices[0]),
                  ],
                  l.incomeMin && l.incomeMax && ["Household income", `${usd(l.incomeMin)}–${usd(l.incomeMax)} / yr`],
                  l.incomeMin && !l.incomeMax && ["Household income", `From ${usd(l.incomeMin)} / yr`],
                  !l.incomeMin && l.incomeMax && ["Household income", `Up to ${usd(l.incomeMax)} / yr`],
                  household && ["Household size", household.replace(" household", "").replace(" people", "")],
                ]
                  .filter(Boolean)
                  .map((row, i) => {
                    const [label, value] = row as [string, string];
                    return (
                      <tr key={label} className={cn(i % 2 === 0 && "bg-muted/60", "border-b last:border-0 border-border/60")}>
                        <td className="px-2 py-3">{label}</td>
                        <td className="px-2 py-3 text-right font-medium">{value}</td>
                      </tr>
                    );
                  })}
                {!l.prices.length && !l.incomeMin && !l.incomeMax && !household && (
                  <tr>
                    <td colSpan={2} className="py-3 text-muted-foreground">See Housing Connect</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <a href={housingConnectUrl(l.id)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 font-medium text-primary hover:underline">
            Full unit details & rents on Housing Connect <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-bold">Key dates</h2>
          <p className="mt-1 text-muted-foreground">Don't miss these important dates.</p>
          <ol className="mt-5">
            {timeline.map((t, i) => (
              <li key={t.title} className="relative flex gap-4 pb-6 last:pb-0">
                {i < timeline.length - 1 && <span className="absolute left-[9px] top-6 h-full w-0.5 bg-primary/25" aria-hidden />}
                <span className={cn("relative mt-1 h-5 w-5 shrink-0 rounded-full border-2 border-primary", t.done ? "bg-primary" : "bg-card")} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-sm text-muted-foreground">{t.body}</div>
                </div>
                <div className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-center text-sm tabular">
                  <div className="font-semibold text-accent-foreground">{t.date}</div>
                  {t.sub && <div className="text-xs text-muted-foreground">{t.sub}</div>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel mt-6 p-6">
        <h2 className="text-xl font-bold">About this lottery</h2>
        {l.description && <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-foreground/80">{l.description}</p>}
        {l.amenities.length > 0 && (
          <>
            <h3 className="mt-6 font-semibold">Building amenities</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {l.amenities.map((a) => (
                <span key={a} className="rounded-lg bg-accent px-3 py-1.5 text-sm text-accent-foreground">
                  {a}
                </span>
              ))}
            </div>
          </>
        )}
        <p className="mt-6 text-sm text-muted-foreground">
          Preference set-asides (community board, municipal employees, etc.) are listed on Housing Connect when they apply.
        </p>
      </section>
    </AppShell>
  );
}
