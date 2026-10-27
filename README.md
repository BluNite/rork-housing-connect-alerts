# Lottery Tracker — NYC affordable housing lottery alerts

**Lottery Tracker** helps New Yorkers find, track, and act on affordable housing lotteries from NYC Housing Connect — without constantly re-checking the official site. Listings from NYC Housing Connect. Not affiliated with NYC HPD or Housing Connect. Always apply on the official site.

## Why it matters

Affordable housing lotteries in New York can close within weeks and are easy to miss. The official portal lists dozens of open lotteries at once, with deadlines, income bands, and neighborhood rules buried in dense listings. For housing-insecure households, a missed deadline can mean months more waiting. Lottery Tracker turns that scattered information into personal alerts, a calendar, and one-tap detail pages — so the people who most need affordable housing don't lose their spot in line to information overload.

## What it does

- **Track lotteries** — save Housing Connect lotteries and get automatic reminders before their deadlines, including browser notifications for anything due within 24 hours.
- **Browse live data** — searches the live NYC Housing Connect API (with OpenStreetMap maps showing each listing's neighborhood) rather than a stale snapshot.
- **Lottery detail pages** — deadlines, income bands, unit counts, amenity and community-board notes, and the nearest subway lines with official MTA bullet colors.
- **Free & Pro plans** — the Free plan is ad-supported; **Pro** ($4/month or $24/year) removes ads. Payments run through Stripe-hosted Checkout and the Stripe billing portal; the app never touches card data. Cancellations are self-serve and keep Pro until the paid period ends — no refunds, cancellations only.
- **Account & data rights** — download your data as JSON, and delete your account with a 30-day grace period (billing is cancelled immediately; a nightly job purges the account if you don't return).

## Privacy & security by design

The audience includes vulnerable and housing-insecure people, so defaults are protective:

- **Supabase Auth** with session-based (PKCE) sign-in, plus a client-side sign-in brake (5 failed attempts per 15 minutes per email).
- **Row-level security**: every database policy is keyed to `auth.uid()` — you can only ever read and write your own alerts, saved lotteries, and profile.
- **No card data, ever**: Stripe-hosted Checkout and the billing portal handle payments; the server holds only Stripe's secret keys and verifies every request's session before acting.
- **Consent-gated ads**: the ad slot stays a house placeholder until consent is given and a network is approved; third-party ad scripts would load only after consent and only in non-personalized mode.
- **Secrets stay server-side**: only the public Supabase URL and anon key reach the browser; `.env` files are git-ignored (see `.env.example` for the expected shape).

## Tech stack

- **Web:** React 19 + TypeScript + Vite, Tailwind CSS, Radix UI, React Router, TanStack Query, Leaflet/OpenStreetMap, lucide icons.
- **Backend:** Supabase (Postgres, Auth, RLS) and Supabase Edge Functions (Deno) for Stripe Checkout, the Stripe webhook (source of truth for plan status), and account deletion/purge; pg_cron runs the nightly purge.
- **Self-hosting:** a hardened Dockerfile (nginx-unprivileged on port 8080, read-only root filesystem, all capabilities dropped) with a `/healthz` endpoint the app's sidebar polls.

## Project layout

```
web-lottery-tracker/   The web app (Vite + React + TypeScript)
backend/functions/     Supabase Edge Functions (stripe-checkout, stripe-webhook, delete-account)
backend/types.ts       Shared database types
scripts/               Tooling (e.g. osv-audit.mjs — dependency vulnerability scan via the OSV database)
```

## Development

```bash
cd web-lottery-tracker
bun install
cp .env.example .env   # fill in your Supabase URL/anon key
bun run dev
bun run build          # production build to dist/
```

### Security audit

```bash
bun scripts/osv-audit.mjs web-lottery-tracker
```

Scans every installed package against the OSV vulnerability database and reports known CVEs.

## Deployment

The app deploys as a static build to any static host. A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) builds and publishes the site to **GitHub Pages** automatically on every push to `main` — enable Pages under **Settings → Pages → Source: GitHub Actions**. The workflow builds with the repository's base path so client-side routing works under `https://<user>.github.io/<repo>/`.

Stripe configuration for live payments (edge-function secrets and webhook) is documented in the code; the webhook must be able to reach the deployed Supabase functions.
