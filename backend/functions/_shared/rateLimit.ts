/**
 * Lightweight sliding-window rate limiter for edge functions.
 *
 * Kept in memory per function instance — it is a soft brake that stops a
 * single session from hammering an endpoint from one connection, not a
 * distributed quota. The hard guarantees live elsewhere: every protected
 * endpoint verifies a real Supabase session JWT first, the database enforces
 * row-level security, and Stripe signs its own webhooks.
 */

const buckets = new Map<string, number[]>();

/** True when `key` exceeds `max` hits within `windowMs`; prunes old hits. */
export function overLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  // Keep the map bounded: drop stale buckets once they grow past a cap.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return false;
}

/** Standard 429 response with a Retry-After hint. */
export function tooMany(retryAfterSec = 60): Response {
  return new Response(JSON.stringify({ error: "Too many requests — please wait a moment and try again." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfterSec) },
  });
}
