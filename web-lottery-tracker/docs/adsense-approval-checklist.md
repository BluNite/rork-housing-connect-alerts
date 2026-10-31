# AdSense Approval Checklist — NYC Lottery Tracker

Sources: Google AdSense eligibility (support.google.com/adsense/answer/9724),
"Your AdSense account wasn't approved" (answer/81904), AdSense policies
(answer/23921), and account setup (answer/7402256).
Goal: pass site review on the first or second try, then re-open Pro sales.

## A. Already done ✅

- [x] Ad code on a live page (verification meta `google-adsense-account` in `<head>`)
- [x] ads.txt at the domain root
- [x] Own domain serving the site directly (housinglotteryalerts.com, real SSL, no redirect)
- [x] Privacy policy page (/privacy) with cookie/ad-disclosure language
- [x] Mobile-friendly, fast (self-hosted fonts, inlined CSS)
- [x] Clear navigation (fixed nav: Home, Browse, Alerts, Calendar, Account)
- [x] Consent-gated, non-personalized ads only
- [x] No pop-ups, no interstitials, no "click our ads" content

## B. Content (the big one — most common rejection is "low value content")

- [ ] Add original editorial content beyond the listings themselves. Target:
      8–15 short guides, each answering one real question. Candidates:
  - [ ] "How to apply for a NYC housing lottery (step by step)"
  - [ ] "What documents you need for a Housing Connect application"
  - [ ] "How AMI (Area Median Income) works — what you can afford"
  - [ ] "Lottery vs. Section 8 vs. affordable rentals — what's the difference?"
  - [ ] "What happens after you win a housing lottery"
  - [ ] "Rent freeze programs NYC renters should know (SCRIE/DRIE)"
  - [ ] "How to spot housing-lottery scams" (we're already the scam-free tracker)
  - [ ] "Affordable homeownership lotteries in NYC (Housing Connect sales)"
- [ ] Each guide: complete sentences and paragraphs (Google explicitly rejects
      headline/image-only pages), 600+ words of genuinely useful text.
- [ ] Link the guides from the nav or footer (must be reachable without login —
      Google flags content behind restricted access).
- [ ] Every lottery detail page should show its live data even when signed out
      (check: open a detail page in a private window and confirm it isn't empty).

## C. Review-readiness

- [ ] Site is fully launched — no "coming soon", no placeholder pages (✅ once
      the Pro-pause notice on /upgrade reads as intentional, not unfinished)
- [ ] No broken links: click through every nav item and footer link once
- [ ] All pages reachable without an account (landing, browse, detail, guides)
- [ ] Footer has: Privacy, Terms, contact email, © line, company identity
- [ ] About information: who runs the site (bluNite / Nkenge Crowe) — an About
      section or page builds reviewer trust for a YMYL-adjacent topic
- [ ] No misleading claims ("guaranteed apartment", "official NYC site") — we
      already say we're not the government; keep that disclaimer visible

## D. While the review is pending

- [ ] Pro sales paused (done — `PRO_SALES_PAUSED` flag in the app code)
- [ ] Re-open sales only AFTER ads are approved and live (flip flag to false)
- [ ] Don't apply extra "revenue" widgets (affiliate links, other ad networks)
      during review — affiliate-heavy pages are a known rejection reason

## E. After approval

- [ ] Confirm ads render on Browse (end of list) and Alerts (right rail) only
- [ ] Keep everything non-personalized (already hardcoded in AdSlot.tsx)
- [ ] Flip `PRO_SALES_PAUSED` to false, publish, then announce Pro again
- [ ] Check Ad Experience Report (Google Web Tools) for annoying-ad flags
