import { chromium } from "/usr/local/lib/node_modules/playwright/index.mjs";
const base = process.env.BASE || "https://99wcbe1quzcp38wqka8k4-web-lottery-tracker.rork.live";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: ".rork/web-verification/blue-login-ribbon.png" });
// open privacy from login footer
const link = page.getByRole("link", { name: "Privacy policy" }).first();
if (await link.count()) await link.click();
await page.waitForTimeout(1200);
await page.screenshot({ path: ".rork/web-verification/blue-privacy.png", fullPage: false });
console.log("done", page.url());
await browser.close();
