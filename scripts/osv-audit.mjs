#!/usr/bin/env bun
/**
 * Dependency vulnerability audit against the OSV database (api.osv.dev).
 * Reads the resolved versions from `bun pm ls --all` for an app folder,
 * queries OSV in one batch, and prints any known vulnerabilities.
 * Usage: bun scripts/osv-audit.mjs [appFolder]
 */
const appFolder = process.argv[2] ?? "web-lottery-tracker";

const proc = Bun.spawnSync(["bun", "pm", "ls", "--all"], { cwd: appFolder, stdout: "pipe" });
if (proc.exitCode !== 0) {
  console.error(proc.stderr.toString());
  process.exit(1);
}

const deps = new Set();
for (const line of proc.stdout.toString().split("\n")) {
  const m = line.replace(/[│├└─\s]+/g, "").trim().match(/^([@a-z0-9][^@\s]*)@(\d[^\s]*)/i);
  if (m) deps.add(`${m[1]}@${m[2]}`);
}
console.log(`Scanning ${deps.size} installed packages from ${appFolder} against OSV…`);

const list = [...deps];
if (!list.length) {
  console.error("No installed packages found — is the lockfile present?");
  process.exit(1);
}
const query = { queries: list.map((name) => ({ package: { name, ecosystem: "npm" } })) };
const res = await fetch("https://api.osv.dev/v1/querybatch", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(query),
});
if (!res.ok) {
  console.error(`OSV query failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}
const { results = [] } = await res.json();

let findings = 0;
for (let i = 0; i < results.length; i++) {
  const vulns = results[i]?.vulns ?? [];
  if (!vulns.length) continue;
  const name = list[i];
  findings += vulns.length;
  for (const v of vulns) {
    const sev = v.database_specific?.severity ?? "unknown";
    const fixed = (v.affected ?? []).flatMap((a) => a.ranges ?? []).flatMap((r) => r.events ?? []).filter((e) => e.fixed).map((e) => e.fixed);
    console.log(`\n🔴 ${name} — ${v.id} (${v.summary ?? v.details?.slice(0, 100) ?? ""})`);
    console.log(`   severity: ${sev}  fixed in: ${fixed.slice(0, 4).join(", ") || "?"}  ${v.references?.[0]?.url ?? ""}`);
  }
}
console.log(findings ? `\n${findings} known vulnerabilities found.` : "\n✅ No known vulnerabilities in any installed package.");
