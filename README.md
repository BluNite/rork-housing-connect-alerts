<div align="center">

# <samp>**NYC Housing Connect Api Alert/Apt_Tacker/Planner**</samp>


**Every affordable housing lottery in New York City, saved to one calm checklist — with reminders before the deadlines close.**

[![Live site](https://img.shields.io/badge/live-housing--lottery--tracker.rork.app-1E6FE8?logo=safari&logoColor=white)](https://housing-lottery-tracker.rork.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-rolldown-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-auth_·_db_·_RLS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-subscriptions-635BFF?logo=stripe&logoColor=white)](https://stripe.com)
[![Resend](https://img.shields.io/badge/Resend-email-F4660E?logo=resend&logoColor=white)](https://resend.com)

![Product demo](docs/demo.mp4)

*(If your player blocks the embed: [watch the demo](docs/demo.mp4).)*

</div>

---

## What it does

NYC Housing Connect lists every affordable housing lottery in the five boroughs, but offers no way to save listings, see them on a map, or get reminded before a deadline. **NYC Lottery Tracker** fills that gap:

- **Browse** every open rental and sales lottery, with property photos, unit counts, income limits, and a borough map — refreshed live from the official Housing Connect API.
- **Save** lotteries to a personal checklist with **deadline reminders** (email + browser notifications, days-before configurable).
- **Go Pro** ($4/mo or $24/yr) to remove ads. Free plan is fully usable.

The audience includes New Yorkers facing housing insecurity, so the product is built privacy-first: no tracking by default, ads are consent-gated and non-personalized, accounts are deletable in one click, and all user data is protected by row-level security.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + TypeScript (strict) + Vite, Tailwind CSS 4, TanStack Query |
| Auth & database | Supabase (PKCE sessions, Postgres + row-level security) |
| Payments | Stripe Checkout + webhook (the webhook is the source of truth for plan status) |
| Email | Resend SMTP for auth emails; edge functions for reminders |
| Server | Supabase Edge Functions (TypeScript, shared sliding-window rate limiter) |
| Deployment | Docker / nginx, Kubernetes manifests in [`k8s/`](k8s/), hosted at Rork |

## Project layout

```
web-lottery-tracker/   ← this folder: the React app + Docker/K8s configs
  docs/demo.mp4          product demo video
  k8s/                   namespace, deployment, ingress, HPA, network policy
backend/functions/      Supabase Edge Functions (Stripe checkout/webhook, delete-account)
  _shared/rateLimit.ts   sliding-window rate limiter shared by all functions
```

## Run it locally

```bash
bun install

# the only required env vars are public by design:
cat > .env <<'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
EOF

bun run dev        # http://localhost:8080
bun run build      # production build → dist/
```

Secrets (Stripe keys, webhook signing secret) live only in the edge-function environment — never in this repo, never in the client bundle. Local `.env` files are git-ignored.

For a self-hosted deployment, see [`Dockerfile`](Dockerfile) + [`docker-compose.yml`](docker-compose.yml), or the full Kubernetes setup in [`k8s/`](k8s/) (nginx config ships a strict security-header set via [`security-headers.conf`](security-headers.conf)).

## Built with Rork

This app was designed and built with [Rork](https://rork.com) — an AI app builder the founder drives in plain English. Rork generated the React codebase, the edge functions, the deployment pipeline, and this very README workflow; the founder made every product, design, and privacy decision. The repo is fully standard React + TypeScript and can be developed, audited, and extended without Rork.

## License

© 2026 NYC Lottery Tracker. All rights reserved.
