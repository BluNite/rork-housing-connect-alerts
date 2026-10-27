import { createClient } from "../../web-lottery-tracker/node_modules/@supabase/supabase-js/dist/index.mjs";
import { readFileSync } from "node:fs";
const env = Object.fromEntries(
  readFileSync("web-lottery-tracker/.env", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/cs_test_b1iilHdjCfznbcqKBvzSnqnE6Mz7id6QBJhPMn4ta8BOOx887uKmBhRoOc`, { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } });
const s = await res.json();
console.log(JSON.stringify({ client_reference_id: s.client_reference_id, metadata: s.metadata, subscription: s.subscription, customer: s.customer, status: s.status }, null, 1));

// Did the test user from webhook-test even get a profile row?
const me = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${s.metadata?.user_id ?? ""}` } } });
