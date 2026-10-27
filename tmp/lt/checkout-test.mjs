import { createClient } from "../../web-lottery-tracker/node_modules/@supabase/supabase-js/dist/index.mjs";
import { readFileSync } from "node:fs";
const env = Object.fromEntries(
  readFileSync("web-lottery-tracker/.env", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const sb = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
const email = `rork.pay.${Date.now()}@example.com`;
const { data: signup, error: suErr } = await sb.auth.signUp({ email, password: "testpass123" });
if (suErr) { console.log("signup err", suErr.message); process.exit(1); }
await new Promise((r) => setTimeout(r, 1500));
const { data: { session } } = await sb.auth.getSession();
const token = session?.access_token;
if (!token) { console.log("no token (email confirmation?)"); process.exit(1); }
const res = await fetch(`${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY },
  body: JSON.stringify({ mode: "checkout", plan: "monthly" }),
});
console.log(res.status, (await res.text()).slice(0, 400));
