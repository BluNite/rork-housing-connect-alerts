import { chromium } from "/usr/local/lib/node_modules/playwright/index.mjs";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto("file:///home/user/rork-app/tmp/lt/ribbon-ideas.html", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const stages = await page.locator(".stage").all();
let i = 0;
for (const s of stages) {
  i++;
  await s.screenshot({ path: `.rork/web-verification/ribbon-${String.fromCharCode(64 + i)}.png` });
}
console.log("shot", i);
await browser.close();
