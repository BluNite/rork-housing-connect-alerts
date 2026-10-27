import { chromium } from "/usr/local/lib/node_modules/playwright/index.mjs";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 260 } });
await page.goto("file:///home/user/rork-app/tmp/lt/ribbon-icon-candidates2.html", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({ path: ".rork/web-verification/ribbon-icons2.png" });
console.log("ok");
await browser.close();
