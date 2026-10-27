import Stripe from "npm:stripe@16.12.0";
import { requireAuth, createAdminClient, AuthError } from "../_shared/auth.ts";
import { overLimit, tooMany } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

/** Where Stripe sends the user back. Only same-product origins are accepted. */
function safeOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  const fallback = "https://housing-lottery-tracker.rork.app";
  try {
    const u = new URL(origin);
    if (u.hostname.endsWith(".rork.live") || u.hostname.endsWith(".rork.app") || u.hostname === "localhost") return origin;
  } catch {
    /* fall through */
  }
  return fallback;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await requireAuth(req);
    // Brake: at most 5 checkout/portal sessions per user per minute.
    if (overLimit(`checkout:${user.userId}`, 5, 60_000)) return tooMany();
    const secret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!secret) throw new Error("Billing is not configured yet");
    const stripe = new Stripe(secret);
    const admin = createAdminClient();
    const site = safeOrigin(req);
    const body = (await req.json().catch(() => ({}))) as { mode?: string; plan?: string };

    // Fetch or lazily create this user's Stripe customer and remember it.
    const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", user.userId).maybeSingle();
    let customerId = profile?.stripe_customer_id as string | null;
    if (!customerId && user.email) {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = existing.data[0]?.id ?? (await stripe.customers.create({ email: user.email, metadata: { user_id: user.userId } })).id;
      await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.userId);
    }

    if (body.mode === "portal") {
      const session = await stripe.billingPortal.sessions.create({ customer: customerId!, return_url: `${site}/account` });
      return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Default: subscription checkout. $4/month or $24/year.
    const yearly = body.plan === "yearly";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId ?? undefined,
      client_reference_id: user.userId,
      allow_promotion_codes: true,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: yearly ? 2400 : 400,
            recurring: { interval: yearly ? "year" : "month" },
            product_data: { name: "Lottery Tracker Pro" },
          },
        },
      ],
      subscription_data: { metadata: { user_id: user.userId } },
      success_url: `${site}/account?upgraded=1`,
      cancel_url: `${site}/upgrade`,
    });

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: "Please sign in first." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    console.error("[stripe-checkout]", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Checkout failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
