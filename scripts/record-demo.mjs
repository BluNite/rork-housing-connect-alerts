// Records a short product demo of the live site for the GitHub README.
// Usage: node scripts/record-demo.mjs <site-url> <output-dir>
// Produces <output-dir>/demo.webm (converted to mp4 by the caller via ffmpeg).
import { mkdtemp, mkdir } from "node:fs/promises";
import path from "node:path";

const [site = "", outDir = ""] = process.argv.slice(2);
if (!site || !outDir) throw new Error("Usage: node scripts/record-demo.mjs <site-url> <output-dir>");

const { chromium } = await import(
  process.env.RORK_PLAYWRIGHT_MODULE ?? "/usr/local/lib/node_modules/playwright/index.mjs"
);

const BASE = site.replace(/\/+$/, "");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const scrollBy = async (page, dy, step = 400) => {
  for (let y = 0; y < Math.abs(dy); y += step) {
    await page.mouse.wheel(0, Math.sign(dy) * Math.min(step, Math.abs(dy) - y));
    await wait(120);
  }
};

const dir = await mkdtemp("/tmp/demo-");
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();

  // 1. Landing — hero + slow scroll over the features.
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await wait(2500);
  await scrollBy(page, 900);
  await wait(600);
  await scrollBy(page, -900);
  await wait(800);

  // 2. Browse — the card list with property photos.
  await page.goto(`${BASE}/browse`, { waitUntil: "domcontentloaded" });
  await wait(3500); // let the live lottery feed and photos load
  await scrollBy(page, 1200);
  await wait(800);

  // 3. Lottery detail — photo banner over the map.
  const card = page.locator('a[href^="/lottery/"]').first();
  await card.click();
  await page.waitForURL("**/lottery/**", { timeout: 15000 });
  await wait(3500); // photo + map tiles
  await scrollBy(page, 600);
  await wait(600);
  await scrollBy(page, -600);
  await wait(600);

  // 4. Sign-in — just the branded screen, no credentials entered.
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await wait(2500);

  // 5. Close on the landing hero.
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await wait(2000);

  await context.close(); // flushes the video file
  const fs = await import("node:fs/promises");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".webm"));
  if (!files.length) throw new Error("no video produced");
  await mkdir(outDir, { recursive: true });
  await fs.rename(path.join(dir, files[0]), `${outDir}/demo.webm`);
  console.log(`saved ${outDir}/demo.webm`);
} finally {
  await browser.close();
}
