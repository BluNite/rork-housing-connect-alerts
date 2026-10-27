import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Search, WifiOff } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { LotteryMap } from "@/components/LotteryMap";
import { SaveButton } from "@/components/SaveButton";
import { AdSlot } from "@/components/AdSlot";
import {
  BEDROOMS,
  BOROUGHS,
  HOUSEHOLD_SIZES,
  bedroomSummary,
  incomeSummary,
  isOpen,
  priceSummary,
  useLotteries,
  type BedroomKey,
  type Borough,
  type Lottery,
} from "@/lib/lotteries";
import { useStore } from "@/lib/store";
import { daysUntil, fmtDate } from "@/lib/dates";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Sort = "deadline" | "units" | "newest";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary bg-accent text-primary" : "bg-card hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

function DeadlineBadge({ l }: { l: Lottery }) {
  if (!l.end) return null;
  const d = daysUntil(l.end);
  const tone = d < 0 ? "bg-muted text-muted-foreground" : d <= 7 ? "bg-warn-soft text-warn-ink" : "bg-accent text-accent-foreground";
  return (
    <span className={cn("whitespace-nowrap rounded-lg px-2.5 py-1 text-[13px] font-medium tabular", tone)}>
      {d < 0 ? `Closed ${fmtDate(l.end, { year: undefined })}` : `Due ${fmtDate(l.end)}`}
    </span>
  );
}

export function LotteryCard({ l }: { l: Lottery }) {
  return (
    <Link
      to={`/lottery/${l.id}`}
      className="panel group flex items-start gap-4 p-5 transition-all hover:-translate-y-px hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-primary">
        <Building2 className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h3 className="text-lg font-bold leading-snug group-hover:text-primary">{l.name}</h3>
          <DeadlineBadge l={l} />
        </div>
        <div className="mt-0.5 text-[15px] text-muted-foreground">
          {l.borough} · {l.type}
          {l.neighborhood ? ` · ${l.neighborhood}` : ""}
        </div>
        <div className="mt-2 text-sm text-muted-foreground tabular">
          {l.units} units · {bedroomSummary(l)} · {priceSummary(l)} · {incomeSummary(l)}
        </div>
      </div>
      <SaveButton lottery={l} />
    </Link>
  );
}

export default function Browse() {
  const { data, isLoading } = useLotteries();
  const { saved } = useStore();
  const navigate = useNavigate();
  const [boroughs, setBoroughs] = useState<Borough[]>([]);
  const [beds, setBeds] = useState<BedroomKey[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);
  const [openOnly, setOpenOnly] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("deadline");
  const [view, setView] = useState<"map" | "list">("map");

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const results = useMemo(() => {
    const list = (data?.lotteries ?? []).filter((l) => {
      if (boroughs.length && !boroughs.includes(l.borough as Borough)) return false;
      if (beds.length && !beds.some((b) => l.bedrooms[b] > 0)) return false;
      if (sizes.length && !sizes.some((s) => (l.householdMin ?? 1) <= s && s <= (l.householdMax ?? 99))) return false;
      if (openOnly && !isOpen(l)) return false;
      if (q && !`${l.name} ${l.address} ${l.zip} ${l.borough} ${l.neighborhood}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const t = (l: Lottery) => (l.end ? new Date(l.end).getTime() : 0);
    return list.sort((a, b) => {
      if (sort === "units") return b.units - a.units;
      if (sort === "newest") return (b.start ?? "").localeCompare(a.start ?? "");
      const ao = isOpen(a), bo = isOpen(b);
      if (ao !== bo) return ao ? -1 : 1;
      return ao ? t(a) - t(b) : t(b) - t(a);
    });
  }, [data, boroughs, beds, sizes, openOnly, q, sort]);

  const filtersOn = boroughs.length + beds.length + sizes.length > 0 || openOnly || !!q;
  const clear = () => {
    setBoroughs([]);
    setBeds([]);
    setSizes([]);
    setOpenOnly(false);
    setQ("");
  };
  const openCount = (data?.lotteries ?? []).filter(isOpen).length;

  return (
    <AppShell header={<PageTitle title="Browse Lotteries" subtitle="Find affordable housing lotteries across New York City." />}>
      <div className={cn("grid gap-6", view === "map" && "xl:grid-cols-[minmax(0,1fr)_420px]")}>
        <div className="min-w-0 space-y-5">
          <section className="panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <h2 className="text-lg font-bold">Filter results</h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Switch checked={openOnly} onCheckedChange={setOpenOnly} /> Accepting applications
                </label>
                {filtersOn && (
                  <button onClick={clear} className="text-sm font-medium text-primary hover:underline">
                    Clear all
                  </button>
                )}
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or ZIP code" className="h-11 pl-9" aria-label="Search lotteries" />
            </div>
            <div className="mt-5 grid gap-6 md:grid-cols-[170px_1fr_1.3fr] md:divide-x">
              <fieldset>
                <legend className="mb-3 font-semibold">Boroughs</legend>
                <div className="space-y-2.5">
                  {BOROUGHS.map((b) => (
                    <label key={b} className="flex cursor-pointer items-center gap-3 text-[15px]">
                      <Checkbox checked={boroughs.includes(b)} onCheckedChange={() => toggle(boroughs, b, setBoroughs)} className="h-5 w-5 rounded-md" />
                      {b}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="md:pl-6">
                <legend className="mb-3 font-semibold md:pl-6">Bedrooms</legend>
                <div className="flex flex-wrap gap-2">
                  {BEDROOMS.map((b) => (
                    <Chip key={b.key} active={beds.includes(b.key)} onClick={() => toggle(beds, b.key, setBeds)}>
                      {b.label}
                    </Chip>
                  ))}
                </div>
              </fieldset>
              <fieldset className="md:pl-6">
                <legend className="mb-3 font-semibold md:pl-6">Household size</legend>
                <div className="flex flex-wrap gap-2">
                  {HOUSEHOLD_SIZES.map((s) => (
                    <Chip key={s} active={sizes.includes(s)} onClick={() => toggle(sizes, s, setSizes)}>
                      {s === 6 ? "6+ people" : `${s} ${s === 1 ? "person" : "people"}`}
                    </Chip>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Matches lotteries whose income limits fit your household size.</p>
              </fieldset>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tabular">
              {isLoading ? "Loading lotteries…" : `${results.length} ${results.length === 1 ? "lottery" : "lotteries"} found`}
              {!isLoading && <span className="ml-2 text-sm font-normal text-muted-foreground">{openCount} accepting applications</span>}
            </h2>
            <div className="flex items-center gap-3">
              {/* Quick district filter — same state as the Borough checkboxes above. */}
              <Select
                value={boroughs.length === 1 ? boroughs[0] : "all"}
                onValueChange={(v) => setBoroughs(v === "all" ? [] : [v as Borough])}
              >
                <SelectTrigger className="h-10 w-[168px] bg-card" aria-label="Filter by district">
                  <SelectValue>
                    {boroughs.length === 0
                      ? "All districts"
                      : boroughs.length === 1
                        ? boroughs[0]
                        : `${boroughs.length} districts`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All districts</SelectItem>
                  {BOROUGHS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="inline-flex rounded-lg border bg-card p-1" role="group" aria-label="View">
                {(["map", "list"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    className={cn("rounded-md px-4 py-1.5 text-sm font-medium capitalize", view === v ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                <SelectTrigger className="h-10 w-[220px] bg-card" aria-label="Sort by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline">Application deadline (soonest)</SelectItem>
                  <SelectItem value="units">Most units</SelectItem>
                  <SelectItem value="newest">Newest listings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {data && !data.live && (
            <div className="flex items-center gap-3 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn-ink">
              <WifiOff className="h-4 w-4" /> Couldn't reach Housing Connect. Showing a saved sample of listings.
            </div>
          )}

          {view === "map" && (
            <div className="h-[320px] overflow-hidden rounded-2xl border xl:hidden">
              <LotteryMap lotteries={results} savedIds={Object.keys(saved)} onSelect={(l) => navigate(`/lottery/${l.id}`)} />
            </div>
          )}

          <div className="space-y-3">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[118px] rounded-2xl" />)}
            {results.map((l) => (
              <LotteryCard key={l.id} l={l} />
            ))}
            {!isLoading && results.length === 0 && (
              <div className="panel px-6 py-14 text-center">
                <h3 className="text-lg font-bold">No lotteries match those filters</h3>
                <p className="mt-1 text-muted-foreground">Try another borough or income level.</p>
                <button onClick={clear} className="mt-4 font-medium text-primary hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
          <AdSlot className="xl:hidden" />
          <p className="text-xs text-muted-foreground">
            Source: NYC Housing Connect (live listings, matching the official site). Deadlines and figures change, so confirm on
            Housing Connect before you apply.
          </p>
        </div>

        {view === "map" && (
          <div className="hidden xl:block">
            <div className="sticky top-6 h-[calc(100vh-48px)] overflow-hidden rounded-2xl border">
              <LotteryMap lotteries={results} savedIds={Object.keys(saved)} onSelect={(l) => navigate(`/lottery/${l.id}`)} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
