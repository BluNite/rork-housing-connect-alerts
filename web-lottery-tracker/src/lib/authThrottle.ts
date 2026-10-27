/**
 * Client-side brake on failed sign-in attempts: at most 5 failures per email
 * in a rolling 15-minute window. This is a UX layer on top of Supabase's own
 * server-side limits — it stops casual hammering and shows a clear cooldown,
 * but real enforcement lives with the auth server.
 *
 * Stored under "ltn:auth-fails" (localStorage): email → failure timestamps.
 * Clamped: emails truncated to 120 chars, at most 50 tracked emails,
 * timestamps older than the window pruned on every touch.
 */

const KEY = "ltn:auth-fails";
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;
const MAX_EMAILS = 50;
const MAX_ADDR_LEN = 120;

type Failures = Record<string, number[]>;

const normalize = (addr: string) => addr.trim().toLowerCase().slice(0, MAX_ADDR_LEN);

function read(): Failures {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Failures;
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: Failures = {};
    const cutoff = Date.now() - WINDOW_MS;
    for (const [k, list] of Object.entries(parsed)) {
      if (!Array.isArray(list)) continue;
      const fresh = list.filter((t) => typeof t === "number" && t > cutoff);
      if (fresh.length) out[k.slice(0, MAX_ADDR_LEN)] = fresh.slice(-MAX_ATTEMPTS);
    }
    return out;
  } catch {
    return {};
  }
}

function write(map: Failures) {
  try {
    const entries = Object.entries(map)
      .filter(([, list]) => list.length > 0)
      .slice(-MAX_EMAILS);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* storage full or blocked — throttling degrades to no-op */
  }
}

export function isLocked(addr: string): boolean {
  return failCount(addr) >= MAX_ATTEMPTS;
}

export function failCount(addr: string): number {
  const map = read();
  return (map[normalize(addr)] ?? []).length;
}

/** Milliseconds until the lock lifts (0 when unlocked). */
export function msLeft(addr: string): number {
  const map = read();
  const list = map[normalize(addr)] ?? [];
  if (list.length < MAX_ATTEMPTS) return 0;
  return Math.max(0, list[0] + WINDOW_MS - Date.now());
}

export function recordFailure(addr: string) {
  const key = normalize(addr);
  const map = read();
  const cutoff = Date.now() - WINDOW_MS;
  const list = (map[key] ?? []).filter((t) => t > cutoff);
  list.push(Date.now());
  map[key] = list.slice(-MAX_ATTEMPTS);
  write(map);
}

export function clearFailures(addr: string) {
  const map = read();
  delete map[normalize(addr)];
  write(map);
}

export function cooldownMessage(addr: string): string {
  const min = Math.max(1, Math.ceil(msLeft(addr) / 60_000));
  return `Too many sign-in attempts for this email. For security, wait ${min} more minute${min === 1 ? "" : "s"} before trying again — or email yourself a sign-in link below.`;
}
