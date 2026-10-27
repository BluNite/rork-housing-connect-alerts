const { chromium } = await import("/usr/local/lib/node_modules/playwright/index.mjs");
const base = "https://99wcbe1quzcp38wqka8k4-web-lottery-tracker.rork.live";
const email = `rork.buy.${Date.now()}@example.com`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// 1. Sign up
await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Create account" }).click();
await page.fill("#email", email);
await page.fill("#password", "testpass123");
await page.click("button[type=submit]");
await page.waitForTimeout(4000);

// 2. Start monthly checkout
await page.goto(base + "/upgrade", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Start monthly/ }).click();
await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 });
console.log("ON_STRIPE:", page.url().slice(0, 55));

// 3. Pay with the test card (card fields live in an iframe)
await page.waitForTimeout(3000);
const cardFrame = page.frameLocator("iframe").last();
const fill = async (sel, val) => { await cardFrame.locator(sel).fill(val); };
let filled = "none";
for (const sel of ["#cardNumber", "input[name=cardNumber]", "input[placeholder*='1234']"]) {
  try { await fill(sel, "4242424242424242"); filled = sel; break; } catch {}
}
console.log("CARD_FIELD:", filled);
try {
  await cardFrame.locator("#cardExpiry, input[name=cardExpiry]").fill("12/34");
  await cardFrame.locator("#cardCvc, input[name=cardCvc]").fill("123");
} catch (e) { console.log("exp/cvc fallback needed:", String(e).slice(0, 80)); }
await page.locator("input#email, #email").fill(email).catch(() => {});
await page.locator("input#billingName, #billingName").fill("Test Buyer").catch(() => {});
await page.getByRole("button", { name: /Subscribe|Pay/ }).first().click();
console.log("PAID, waiting for redirect…");

// 4. Back to the app: should land on /account?upgraded=1 and show Pro
await page.waitForURL(/\/account/, { timeout: 45000 });
await page.waitForTimeout(5000);
const body = await page.locator("body").innerText();
console.log("BACK_AT:", page.url());
console.log("HAS_PRO_BADGE:", /Pro/.test(body) && !body.includes("Upgrade to Pro"));
console.log("HAS_WELCOME:", body.includes("Welcome to Pro"));
console.log("NO_AD_CARD:", !body.includes("Go ad-free"));
await browser.close();
