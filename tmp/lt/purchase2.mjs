const { chromium } = await import("/usr/local/lib/node_modules/playwright/index.mjs");
const base = "https://99wcbe1quzcp38wqka8k4-web-lottery-tracker.rork.live";
const email = `rork.buy.${Date.now()}@example.com`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Create account" }).click();
await page.fill("#email", email);
await page.fill("#password", "testpass123");
await page.click("button[type=submit]");
await page.waitForTimeout(4000);
await page.goto(base + "/upgrade", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Start monthly/ }).click();
await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 });
await page.waitForTimeout(5000);

// Map every frame and input so we can see where the card fields live
for (const f of page.frames()) {
  const inputs = await f.locator("input").evaluateAll((els) => els.map((e) => `${e.id || "?"}|${e.name || "?"}|${e.placeholder || "?"}|${e.getAttribute("aria-label") || ""}`).slice(0, 12)).catch(() => ["(cannot inspect)"]);
  console.log("FRAME:", f.url().slice(0, 70), "->", JSON.stringify(inputs));
}
await browser.close();
