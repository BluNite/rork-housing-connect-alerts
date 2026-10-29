#!/usr/bin/env node
// Publish status check for the live site.
//
// Usage:
//   node scripts/publish-status.mjs                one check, prints a status line
//   node scripts/publish-status.mjs --watch        poll until the newest build is live
//                                                  (exponential backoff, ~5 min max)
//
// The website publish itself is a platform action (run by the Rork agent after
// each change) and cannot be triggered from this sandbox shell — so the retry
// policy lives in the publish workflow, and this script is the source of truth
// for whether the LAST publish actually landed: it compares the bundle the
// public site is serving against the newest local build.
//
// Exit codes: 0 = live, 1 = pending/stale, 2 = unreachable.

const args = process.argv.slice(2);
const SITE = (args.find((a) => a.startsWith("http")) ??
  "https://housing-lottery-tracker.rork.app").replace(/\/+$/, "");
const DIST = args.find((a) => !a.startsWith("-") && !a.startsWith("http")) ?? "web-lottery-tracker/dist";
const WATCH = process.argv.includes("--watch");

import { readdir } from "node:fs/promises";

const liveBundle = async () => {
  const res = await fetch(`${SITE}/?nocache=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`site returned HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/assets\/(index-[A-Za-z0-9_-]+\.js)/);
  if (!m) throw new Error("no bundle reference found in served HTML");
  return m[1];
};

const localBundle = async () => {
  const files = await readdir(`${DIST}/assets`);
  const bundle = files.find((f) => /^index-[A-Za-z0-9_-]+\.js$/.test(f));
  if (!bundle) throw new Error(`no built bundle in ${DIST}/assets — run a build first`);
  return bundle;
};

const check = async () => {
  const [live, local] = await Promise.all([liveBundle(), localBundle()]);
  if (live === local) {
    console.log(`✅ Last publish is live — ${SITE} is serving the newest build (${local})`);
    return 0;
  }
  console.log(`⏳ Publish still pending — site is serving ${live}, newest build is ${local}`);
  return 1;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!WATCH) {
  try {
    process.exit(await check());
  } catch (e) {
    console.log(`❌ Could not reach ${SITE}: ${e.message}`);
    process.exit(2);
  }
} else {
  // Exponential backoff: 10s, 20s, 40s, 60s, 60s… capped, ~5 minutes total.
  for (let attempt = 1, delay = 10_000; attempt <= 8; attempt++, delay = Math.min(delay * 2, 60_000)) {
    try {
      const code = await check();
      if (code === 0) process.exit(0);
      console.log(`   retry ${attempt}/8 in ${Math.round(delay / 1000)}s…`);
    } catch (e) {
      console.log(`❌ attempt ${attempt}: ${e.message} — retrying in ${Math.round(delay / 1000)}s…`);
    }
    await sleep(delay);
  }
  console.log("❌ Newest build did not go live after ~5 minutes of retries.");
  process.exit(1);
}
