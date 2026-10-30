import { useQuery } from "@tanstack/react-query";

/**
 * Housing Connect has no documented developer API, but its own site
 * (housingconnect.nyc.gov/PublicWeb/search-lotteries) queries an anonymous
 * public endpoint with a fixed POST body. Hitting the same endpoint keeps this
 * app in lockstep with what the official site currently advertises — open
 * lotteries only, with live deadlines, rents, income limits, photos, and
 * building locations.
 */
const SEARCH_URL = "https://a806-housingconnectapi.nyc.gov/HPDPublicAPI/api/Lottery/SearchLotteries";

export type Borough = "Bronx" | "Brooklyn" | "Manhattan" | "Queens" | "Staten Island";
export const BOROUGHS: Borough[] = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];

export type BedroomKey = "studio" | "one" | "two" | "three" | "four";
export const BEDROOMS: { key: BedroomKey; label: string }[] = [
  { key: "studio", label: "Studio" },
  { key: "one", label: "1 BR" },
  { key: "two", label: "2 BR" },
  { key: "three", label: "3 BR" },
  { key: "four", label: "4+ BR" },
];

/** Household sizes offered as browse filters; 6 means "6 or more". */
export const HOUSEHOLD_SIZES: number[] = [1, 2, 3, 4, 5, 6];

export interface Lottery {
  id: string;
  name: string;
  type: "Rental" | "Sales";
  start: string | null;
  end: string | null;
  endInDays: number | null;
  units: number;
  bedrooms: Record<BedroomKey, number>;
  /** Monthly rents for rentals, purchase prices for sales, in dollars. */
  prices: number[];
  incomeMin: number | null;
  incomeMax: number | null;
  householdMin: number | null;
  householdMax: number | null;
  address: string;
  zip: string;
  borough: Borough | "NYC";
  neighborhood: string;
  lat: number | null;
  lng: number | null;
  trains: string[];
  amenities: string[];
  photo: string | null;
  description: string;
}

interface RawLottery {
  lotteryId: number;
  lotteryName: string;
  lotteryDescription?: string;
  endIn?: number;
  lotteryStartDate?: string | null;
  lotteryEndDate?: string | null;
  prices?: string | null;
  rents?: string | null;
  maxIncome?: number | null;
  minIncome?: number | null;
  minHouseholdSize?: number | null;
  maxHouseholdSize?: number | null;
  neighborhood?: string | null;
  amenities?: string | null;
  trains?: string | null;
  defaultPhotoStream?: string | null;
  studios?: number;
  oneBR?: number;
  twoBR?: number;
  threeBR?: number;
  fourBR?: number;
  fiveBR?: number;
  sixBR?: number;
  units?: number;
  markers?: { lat?: string; lng?: string; address?: string; zip?: string } | Array<{ lat?: string; lng?: string; address?: string; zip?: string }> | null;
  borough?: string | null;
}

/** The exact body housingconnect.nyc.gov posts from its search page. */
const SEARCH_BODY = {
  UnitTypes: [],
  NearbyPlaces: [],
  NearbySubways: [],
  Amenities: [],
  Applied: null,
  HPDUserId: null,
  Boroughs: [],
  Neighborhoods: [],
  HouseholdSize: null,
  Income: "",
  HouseholdType: 1,
  OwnerTypes: [],
  PreferanceTypes: [],
  LotteryTypes: [],
  Min: null,
  Max: null,
  RentalSubsidy: null,
};

const toList = (s?: string | null): number[] =>
  (s ?? "")
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v) && v > 0);

const toMoney = (s?: string | null): number[] => toList(s);

const firstMarker = (m: RawLottery["markers"]) => (Array.isArray(m) ? m[0] : m);

function normalize(r: RawLottery, type: "Rental" | "Sales"): Lottery {
  const marker = firstMarker(r.markers);
  const lat = marker?.lat ? Number(marker.lat) : NaN;
  const lng = marker?.lng ? Number(marker.lng) : NaN;
  const borough = (r.borough ?? "").trim();
  return {
    id: String(r.lotteryId),
    name: (r.lotteryName ?? "Untitled lottery").replace(/\s+/g, " ").trim(),
    type,
    start: r.lotteryStartDate ? `${r.lotteryStartDate.slice(0, 10)}T00:00:00` : null,
    end: r.lotteryEndDate ? `${r.lotteryEndDate.slice(0, 10)}T23:59:00` : null,
    endInDays: typeof r.endIn === "number" ? Math.round(r.endIn) : null,
    units: r.units ?? 0,
    bedrooms: {
      studio: r.studios ?? 0,
      one: r.oneBR ?? 0,
      two: r.twoBR ?? 0,
      three: r.threeBR ?? 0,
      four: (r.fourBR ?? 0) + (r.fiveBR ?? 0) + (r.sixBR ?? 0),
    },
    prices: toMoney(type === "Rental" ? r.rents : r.prices),
    incomeMin: r.minIncome ?? null,
    incomeMax: r.maxIncome ?? null,
    householdMin: r.minHouseholdSize ?? null,
    householdMax: r.maxHouseholdSize ?? null,
    address: (marker?.address ?? "").trim(),
    zip: (marker?.zip ?? "").trim(),
    borough: (BOROUGHS as string[]).includes(borough) ? (borough as Borough) : "NYC",
    neighborhood: (r.neighborhood ?? "").trim(),
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    trains: (r.trains ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    amenities: (r.amenities ?? "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
    photo: r.defaultPhotoStream || null,
    description: (r.lotteryDescription ?? "").trim(),
  };
}

/** Small offline fallback (real listings) used only if Housing Connect is unreachable. */
const FALLBACK: Lottery[] = [
  {
    id: "7672",
    name: "83-12 Broadway",
    type: "Rental",
    start: null,
    end: "2026-10-28T23:59:00",
    endInDays: 1,
    units: 6,
    bedrooms: { studio: 0, one: 3, two: 3, three: 0, four: 0 },
    prices: [2225, 2579],
    incomeMin: 84926,
    incomeMax: 146560,
    householdMin: 1,
    householdMax: 5,
    address: "83-12 Broadway",
    zip: "11373",
    borough: "Queens",
    neighborhood: "West Queens",
    lat: 40.7407081,
    lng: -73.879745,
    trains: ["E", "7", "M", "R"],
    amenities: ["Elevator", "Laundry service", "Air-conditioning"],
    photo: null,
    description: "",
  },
  {
    id: "7338",
    name: "Washington Heights ANCP Cluster Phase 2",
    type: "Sales",
    start: null,
    end: "2026-11-20T23:59:00",
    endInDays: 24,
    units: 20,
    bedrooms: { studio: 0, one: 0, two: 20, three: 0, four: 0 },
    prices: [193878, 274084],
    incomeMin: 75067,
    incomeMax: 231440,
    householdMin: 1,
    householdMax: 7,
    address: "609 West 158 Street",
    zip: "10032",
    borough: "Manhattan",
    neighborhood: "Inwood and Washington Heights",
    lat: 40.8350135,
    lng: -73.9452225,
    trains: ["1", "A", "D", "3"],
    amenities: [],
    photo: null,
    description: "",
  },
];

/*
 * The Housing Connect endpoint doesn't send cacheable HTTP headers, so a cold
 * start always pays the full network round-trip. To make repeat opens feel
 * instant (especially in the Android app's WebView), the last good list is
 * persisted to localStorage and shown immediately while a fresh fetch runs in
 * the background. Kept for 7 days, max; anything older is ignored.
 */
const CACHE_KEY = "ltn:lotteries-cache";
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

interface LotteryCacheEntry {
  lotteries: Lottery[];
  savedAt: number;
}

function readLotteryCache(): { lotteries: Lottery[]; live: boolean } | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const entry = JSON.parse(raw) as LotteryCacheEntry;
    if (!Array.isArray(entry?.lotteries) || entry.lotteries.length === 0) return undefined;
    if (Date.now() - entry.savedAt > CACHE_MAX_AGE_MS) return undefined;
    return { lotteries: entry.lotteries, live: true };
  } catch {
    return undefined;
  }
}

function writeLotteryCache(lotteries: Lottery[]) {
  try {
    const entry: LotteryCacheEntry = { lotteries, savedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable — caching is a nice-to-have, never fatal.
  }
}

async function fetchLotteries(): Promise<{ lotteries: Lottery[]; live: boolean }> {
  try {
    const res = await fetch(SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(SEARCH_BODY),
    });
    if (!res.ok) throw new Error(`Housing Connect ${res.status}`);
    const json = (await res.json()) as { rentals?: RawLottery[]; sales?: RawLottery[] };
    const lotteries = [
      ...(json.rentals ?? []).map((r) => normalize(r, "Rental")),
      ...(json.sales ?? []).map((r) => normalize(r, "Sales")),
    ];
    if (!lotteries.length) throw new Error("Empty response");
    writeLotteryCache(lotteries);
    return { lotteries, live: true };
  } catch {
    return { lotteries: FALLBACK, live: false };
  }
}

export function useLotteries() {
  return useQuery({
    queryKey: ["lotteries"],
    queryFn: fetchLotteries,
    staleTime: 1000 * 60 * 15,
    // Stale-while-revalidate: render the cached list immediately on mount;
    // the background fetch swaps in the fresh data when it lands.
    placeholderData: () => readLotteryCache(),
  });
}

export function useLottery(id: string | undefined) {
  const q = useLotteries();
  return { ...q, lottery: q.data?.lotteries.find((l) => l.id === id) };
}

export const housingConnectUrl = (id: string) =>
  `https://housingconnect.nyc.gov/PublicWeb/details/${id}`;

export const isOpen = (l: Pick<Lottery, "end">) =>
  !!l.end && new Date(l.end).getTime() >= Date.now();

export const bedroomSummary = (l: Lottery) => {
  const present = BEDROOMS.filter((b) => l.bedrooms[b.key] > 0).map((b) => b.label);
  if (present.length === 0) return "Unit mix on Housing Connect";
  if (present.length === 1) return present[0];
  return `${present[0]} – ${present[present.length - 1]}`;
};

const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

/** "From $2,225/mo" for rentals, "From $193,878" for sales. */
export const priceSummary = (l: Lottery) => {
  if (!l.prices.length) return "Pricing on Housing Connect";
  const min = Math.min(...l.prices);
  return l.type === "Rental" ? `From ${usd(min)}/mo` : `From ${usd(min)}`;
};

export const incomeSummary = (l: Lottery) => {
  if (l.incomeMin && l.incomeMax) return `Income ${usd(l.incomeMin)}–${usd(l.incomeMax)}`;
  if (l.incomeMin) return `Income from ${usd(l.incomeMin)}`;
  if (l.incomeMax) return `Income up to ${usd(l.incomeMax)}`;
  return "Income limits on Housing Connect";
};

export const householdSummary = (l: Lottery) => {
  if (!l.householdMin && !l.householdMax) return null;
  if (l.householdMin === l.householdMax) return `${l.householdMin}-person household`;
  if (l.householdMin && l.householdMax) return `${l.householdMin}–${l.householdMax} people`;
  return l.householdMin ? `${l.householdMin}+ people` : `Up to ${l.householdMax} people`;
};
