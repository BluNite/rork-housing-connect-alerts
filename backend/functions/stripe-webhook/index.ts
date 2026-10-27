import Stripe from "npm:stripe@16.12.0";
import { createAdminClient } from "../_shared/auth.ts";

/**
 * Stripe webhook — no Supabase JWT; authenticated by Stripe's signature.
 * Events: checkout.session.completed, customer.subscription.updated/deleted.
 * Keeps profiles.plan in sync with the real subscription state.
 */
Deno.serve(async (req) => {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secret || !key) return new Response("Billing not configured", { status: 500 });

  const stripe = new Stripe(key);
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] bad signature", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createAdminClient();
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;
        if (session.customer && userId) {
          await admin.from("profiles").update({ plan: "pro", stripe_customer_id: session.customer as string }).eq("id", userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const active = event.type === "customer.subscription.updated" && ["active", "trialing", "past_due"].includes(sub.status);
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await admin.from("profiles").update({ plan: active ? "pro" : "free" }).eq("stripe_customer_id", customerId);
        break;
      }
      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook]", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
