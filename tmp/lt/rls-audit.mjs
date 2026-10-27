// Verifies row-level security: an anonymous (signed-out) client must not read or write anyone's data.
import { createClient } from "../../web-lottery-tracker/node_modules/@supabase/supabase-js/dist/index.mjs";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync("web-lottery-tracker/.env", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);

const anon = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
const out = {};

for (const table of ["profiles", "tasks", "saved_lotteries"]) {
  const { data, error } = await anon.from(table).select("*").limit(5);
  out[`read_${table}`] = error ? `blocked: ${error.code}` : `rows: ${data.length}`;
}

const { error: insErr } = await anon.from("tasks").insert({ id: "anon-hack-test", user_id: "00000000-0000-0000-0000-000000000000", title: "x", due: new Date().toISOString() });
out.insert_tasks = insErr ? `blocked: ${insErr.code}` : "ALLOWED!!";
const { error: updErr } = await anon.from("profiles").update({ name: "hacked" }).neq("id", "nothing");
out.update_profiles = updErr ? `blocked: ${updErr.code}` : "no error (check rowcount)";
const { data: delData, error: delErr } = await anon.from("saved_lotteries").delete().neq("lottery_id", "nothing").select();
out.delete_saved = delErr ? `blocked: ${delErr.code}` : `deleted rows: ${delData.length}`;

console.log(JSON.stringify(out, null, 2));
