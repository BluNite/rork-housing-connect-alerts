import { AuthError, createAdminClient, requireAuth } from "../_shared/auth.ts";
import { overLimit, tooMany } from "../_shared/rateLimit.ts";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const GRACE_DAYS = 30;

/**
 * POST /functions/v1/delete-account
 * GDPR right to erasure with a 30-day grace period.
 *   body {}           → schedule deletion: cancels any active Stripe
 *                       subscription immediately (no rebilling) and stamps
 *                       profiles.deletion_scheduled_at = now + 30 days. A
 *                       nightly pg_cron job purges overdue accounts permanently.
 *   body {cancel: true} → lifts the scheduled deletion (must be within grace).
 * The caller's session JWT is required; the lazy purge sweep also runs on
 * every invocation as a safety net alongside cron.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let userId: string;
  try {
    const user = await requireAuth(req);
    userId = user.userId;
  } catch (e) {
    return json({ error: e instanceof AuthError ? e.message : "Unauthorized" }, 401);
  }
  // Brake: at most 5 schedule/cancel calls per user per 10 minutes — this
  // endpoint also triggers the purge sweep, so it must not be spammable.
  if (overLimit(`delete-account:${userId}`, 5, 600_000)) return tooMany();

  const admin = createAdminClient();
  let body: { cancel?: boolean } = {};
  try {
    body = (await req.json()) as { cancel?: boolean };
  } catch {
    /* empty body = schedule */
  }

  // Safety net for the nightly purge (in case pg_cron is paused).
  try {
    await admin.rpc("purge_scheduled_deletions");
  } catch (e) {
    console.error("[delete-account] purge sweep failed", e);
  }

  if (body.cancel) {
    const { error } = await admin
      .from("profiles")
      .update({ deletion_scheduled_at: null })
      .eq("id", userId)
      .gt("deletion_scheduled_at", new Date().toISOString());
    if (error) return json({ error: `Couldn't cancel deletion: ${error.message}` }, 500);
    return json({ ok: true, cancelled: true });
  }

  // Best-effort: cancel active Stripe subscriptions immediately, so the
  // account is never rebilled during or after the grace period.
  try {
    const { data: prof } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();
    const customerId = prof?.stripe_customer_id;
    const key = Deno.env.get("STRIPE_SECRET_KEY");
    if (customerId && key) {
      const listRes = await fetch(
        `https://api.stripe.com/v1/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=10`,
        { headers: { Authorization: `Bearer ${key}` } },
      );
      if (listRes.ok) {
        const { data: subs } = await listRes.json();
        for (const s of subs ?? []) {
          if (["active", "past_due", "unpaid", "trialing"].includes(s.status)) {
            await fetch(`https://api.stripe.com/v1/subscriptions/${s.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${key}` },
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("[delete-account] stripe cancel failed (continuing)", e);
  }

  const scheduledFor = new Date(Date.now() + GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error: schedErr } = await admin
    .from("profiles")
    .update({ deletion_scheduled_at: scheduledFor })
    .eq("id", userId);
  if (schedErr) return json({ error: `Couldn't schedule deletion: ${schedErr.message}` }, 500);

  return json({ ok: true, scheduledFor, graceDays: GRACE_DAYS });
});
