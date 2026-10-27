import { chromium } from "/usr/local/lib/node_modules/playwright/index.mjs";
const base = "https://99wcbe1quzcp38wqka8k4-web-lottery-tracker.rork.live";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("console", m => { if (m.type() === "error") console.log("CONSOLE ERR:", m.text().slice(0, 200)); });
page.on("pageerror", e => console.log("PAGE ERR:", String(e).slice(0, 200)));
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 400 || r.height > 400) {
      out.push(`${el.tagName}.${String(el.className.baseVal ?? el.className).slice(0, 80)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  }
  return out.slice(0, 15);
});
console.log(info.join("\n"));
const ribbon = await page.evaluate(() => {
  const el = document.querySelector('[role="note"]');
  if (!el) return "no ribbon";
  const r = el.getBoundingClientRect();
  return `ribbon ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`;
});
console.log(ribbon);
await browser.close();
