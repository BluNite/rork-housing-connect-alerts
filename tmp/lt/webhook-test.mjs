import { createClient } from "../../web-lottery-tracker/node_modules/@supabase/supabase-js/dist/index.mjs";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync("web-lottery-tracker/.env", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const sb = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

// 1. Sign up + create the profile row exactly like the app does on first sign-in
const email = `rork.buy.${Date.now()}@example.com`;
const { data: signup } = await sb.auth.signUp({ email, password: "testpass123" });
await new Promise((r) => setTimeout(r, 2000));
const token = (await sb.auth.getSession()).data.session?.access_token;
const userId = signup.user?.id;
if (!token || !userId) { console.log("signup failed"); process.exit(1); }
const ins = await sb.from("profiles").insert({ id: userId, email, name: email.split("@")[0] }).select().single();
console.log("PROFILE_CREATED:", ins.data?.id === userId, ins.error?.message ?? "");

// 2. Create a checkout session (saves the Stripe customer on the profile)
const res = await fetch(`${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY },
  body: JSON.stringify({ mode: "checkout", plan: "monthly" }),
});
const { url } = await res.json();
const sessionId = new URL(url).pathname.split("/").find((p) => p.startsWith("cs_"));
const session = await (await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } })).json();
console.log("SESSION:", sessionId.slice(0, 20), "CUSTOMER:", session.customer, "REF:", session.client_reference_id === userId);

const signAndPost = async (event) => {
  const t = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify(event);
  const sig = createHmac("sha256", env.STRIPE_WEBHOOK_SECRET).update(`${t}.${payload}`).digest("hex");
  const r = await fetch(`${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Stripe-Signature": `t=${t},v1=${sig}` },
    body: payload,
  });
  return { status: r.status, body: await r.text() };
};
const base = { id: `evt_test_${Date.now()}`, object: "event", api_version: "2024-06-20", created: Math.floor(Date.now() / 1000), livemode: false, request: { id: null, idempotency_key: null } };
const fakeSession = { id: sessionId, object: "checkout.session", customer: session.customer, metadata: session.metadata, client_reference_id: session.client_reference_id };

// 3. checkout.session.completed → plan=pro
console.log("COMPLETED →", JSON.stringify(await signAndPost({ ...base, type: "checkout.session.completed", data: { object: fakeSession } })));
await new Promise((r) => setTimeout(r, 1500));
let { data: prof } = await sb.from("profiles").select("plan, stripe_customer_id").eq("id", userId).single();
console.log("PLAN_AFTER_PAYMENT:", prof?.plan, "CUSTOMER_SAVED:", prof?.stripe_customer_id === session.customer);

// 4. customer.subscription.deleted → plan=free
console.log("CANCELED →", JSON.stringify(await signAndPost({ ...base, type: "customer.subscription.deleted", data: { object: { id: "sub_test_1", object: "subscription", status: "canceled", customer: session.customer } } })));
await new Promise((r) => setTimeout(r, 1500));
({ data: prof } = await sb.from("profiles").select("plan").eq("id", userId).single());
console.log("PLAN_AFTER_CANCEL:", prof?.plan);

// 5. Forged signature must be rejected
const t = Math.floor(Date.now() / 1000);
const forged = JSON.stringify({ ...base, type: "checkout.session.completed", data: { object: { customer: "cus_fake", metadata: { user_id: userId } } } });
const bad = await fetch(`${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-webhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Stripe-Signature": `t=${t},v1=${"0".repeat(64)}` },
  body: forged,
});
console.log("FORGED_REJECTED:", bad.status === 400, `(${bad.status})`);
