const { chromium } = await import("/usr/local/lib/node_modules/playwright/index.mjs");
const base = "https://99wcbe1quzcp38wqka8k4-web-lottery-tracker.rork.live";
const email = `rork.test.${Date.now()}@example.com`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
// login screen (blue hero)
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: ".rork/web-verification/blue-login.png" });
// sign up and land on alerts
await page.getByRole("tab", { name: "Create account" }).click();
await page.fill("#email", email);
await page.fill("#password", "testpass123");
await page.click("button[type=submit]");
await page.waitForTimeout(4000);
await page.screenshot({ path: ".rork/web-verification/blue-alerts.png" });
// browse + map
await page.goto(base + "/browse", { waitUntil: "networkidle" });
await page.waitForTimeout(7000);
const count = await page.getByText(/lotteries found|lottery found/).first().innerText().catch(() => "count not found");
console.log(JSON.stringify({ count }));
await page.screenshot({ path: ".rork/web-verification/blue-browse.png" });
console.log("errors:", errors.length);
await browser.close();
