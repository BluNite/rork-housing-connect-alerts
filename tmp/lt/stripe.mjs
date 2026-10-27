const { chromium } = await import("/usr/local/lib/node_modules/playwright/index.mjs");
const base = "https://99wcbe1quzcp38wqka8k4-web-lottery-tracker.rork.live";
const email = `rork.pay.${Date.now()}@example.com`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Create account" }).click();
await page.fill("#email", email);
await page.fill("#password", "testpass123");
await page.click("button[type=submit]");
await page.waitForTimeout(4000);
// Go to upgrade page and start monthly checkout
await page.goto(base + "/upgrade", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Start monthly/ }).click();
try {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20000 });
  console.log("STRIPE_OK:", page.url().slice(0, 60));
  const proCard = await page.getByText("Lottery Tracker Pro").count();
  const amount = await page.getByText("$4.00").count();
  console.log(JSON.stringify({ proCard, amount }));
} catch {
  console.log("NO_REDIRECT:", page.url());
  console.log(await page.locator("body").innerText().then((t) => t.slice(0, 300)));
}
await browser.close();
