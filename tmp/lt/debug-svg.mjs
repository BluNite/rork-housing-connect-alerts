import { chromium } from "/usr/local/lib/node_modules/playwright/index.mjs";
const base = "https://99wcbe1quzcp38wqka8k4-web-lottery-tracker.rork.live";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const res = await page.evaluate(() => {
  const svg = document.querySelector('[role="note"] svg');
  if (!svg) return "no svg";
  const cs = getComputedStyle(svg);
  let hasH45 = false;
  for (const sheet of document.styleSheets) {
    try { for (const rule of sheet.cssRules) { if (rule.cssText && rule.cssText.includes("h-4\\.5")) hasH45 = true; } } catch {}
  }
  const r = svg.getBoundingClientRect();
  return `svg rect ${Math.round(r.width)}x${Math.round(r.height)} computed w=${cs.width} h=${cs.height} | h-4.5 rule in CSS: ${hasH45} | class="${svg.getAttribute("class")}"`;
});
console.log(res);
await browser.close();
