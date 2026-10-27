import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, CalendarCheck, ChevronDown, ListChecks, Map, Megaphone, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { DedicationRibbon } from "./Privacy";
import { Reveal } from "@/components/Reveal";

const FEATURES = [
  {
    icon: BellRing,
    title: "Save lotteries you like",
    body: "Every open NYC Housing Connect lottery in one place, filtered by borough, bedrooms, and income — live data, not a stale snapshot.",
  },
  {
    icon: ListChecks,
    title: "A to-do list per lottery",
    body: "Check eligibility, gather documents, apply — each lottery becomes its own calm checklist instead of a pile of PDFs.",
  },
  {
    icon: CalendarCheck,
    title: "Never miss a deadline",
    body: "Countdowns, a month calendar, browser alerts, and export to your own calendar. Reminders fire before lotteries close.",
  },
  {
    icon: Map,
    title: "Explore on a map",
    body: "See where listings actually are — neighborhoods, subway lines with real MTA colors, and pins you can tap.",
  },
];

const STEPS = [
  { n: "1", title: "Create a free account", body: "Email and password, or a one-tap sign-in link. Takes under a minute." },
  { n: "2", title: "Save the lotteries you like", body: "Browse live listings or search the map, and save the ones that fit your household." },
  { n: "3", title: "We nudge you before they close", body: "Deadlines land on your calendar and in your browser — no more finding out it closed last week." },
];

/** Scroll-progress hairline in the brand gradient, fixed to the top edge. */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setP(max > 0 ? window.scrollY / max : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-[#1e6fe8] via-[#f07c1f] to-[#1e6fe8]" style={{ transform: `scaleX(${p})` }} aria-hidden />
  );
}

/**
 * House sponsorship slot for the landing page — this is the "paid commercial"
 * space that keeps the service free. First-party content today (no tracking,
 * safe under any consent choice); a partner unit renders in this same
 * reserved-height box later, gated by cookie consent. Labeled and
 * reserved-height per .rork/ads-standard.md.
 */
function SponsorSlot() {
  return (
    <section aria-label="Advertisement" data-ad-slot className="min-h-[150px]">
      <div className="rounded-2xl border border-dashed border-warn/40 bg-gradient-to-br from-warn-soft/70 via-card to-accent/60 p-6 sm:p-7">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grad-orange grid h-11 w-11 shrink-0 place-items-center rounded-full text-white shadow-sm">
            <Megaphone className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-warn-ink">Advertisement</p>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
              Your business here — reach New Yorkers finding their next home.
            </p>
            <p className="mt-1 text-sm leading-snug text-muted-foreground">
              Sponsorship keeps Lottery Tracker free for everyone. Local and mission-aligned businesses only.
            </p>
          </div>
          <a
            href="mailto:sponsors@blunite.app?subject=Lottery%20Tracker%20sponsorship"
            className="grad-primary inline-flex h-11 shrink-0 items-center rounded-xl px-5 text-[15px] font-semibold text-white shadow-sm transition hover:-translate-y-px hover:shadow"
          >
            Become a sponsor
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  // Gentle hero parallax: the headline drifts and fades as you scroll away.
  const [drift, setDrift] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setDrift(Math.min(window.scrollY, 600)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollProgress />

      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/95 shadow-sm">
              <BrandMark className="h-8 w-8" />
            </span>
            <span className="text-[15px] font-bold tracking-tight drop-shadow-sm">Lottery Tracker</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <a href="#features" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:block">
              Features
            </a>
            <a href="#how" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:block">
              How it works
            </a>
            <Link
              to="/login"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#1e6fe8] shadow-sm transition hover:-translate-y-px hover:shadow"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — brand colors full-bleed, oversized logo */}
      <section className="grad-deep relative flex min-h-[100svh] flex-col overflow-hidden text-white">
        <svg className="pointer-events-none absolute -bottom-2 left-0 right-0 h-40 w-full text-white/10" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0 160V96h30V60h24v36h20V30h36v66h18V70h28v26h22V44h14V20h20v24h14v52h26V64h30v32h16V50h40v46h20V76h24v20h22V36h30v60h18V58h26v38h24V80h30v16h22V40h40v56h16v64z" />
        </svg>
        <div
          className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 pb-24 pt-28 text-center sm:px-8"
          style={{ transform: `translateY(${drift * -0.12}px)`, opacity: 1 - drift / 900 }}
        >
          <span className="grid h-28 w-28 place-items-center rounded-3xl bg-white shadow-xl floaty">
            <BrandMark className="h-20 w-20" />
          </span>
          <p className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
            NYC Housing Connect, tracked
          </p>
          <h1 className="font-display mt-6 max-w-3xl text-[44px] font-semibold leading-[1.04] tracking-tight sm:text-[64px]">
            Find your <em className="font-light italic text-[#ffd9ae]">home</em> in the five boroughs.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Every affordable housing lottery in New York City, saved to one calm checklist — with reminders before the deadlines close.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex h-14 items-center gap-2 rounded-xl bg-white px-8 text-base font-bold text-[#1e6fe8] shadow-lg transition hover:-translate-y-px hover:shadow-xl"
            >
              Get started free <span aria-hidden>→</span>
            </Link>
            <a
              href="#how"
              className="inline-flex h-14 items-center gap-2 rounded-xl border border-white/30 px-8 text-base font-semibold text-white transition hover:bg-white/10"
            >
              See how it works
            </a>
          </div>
          <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-white/60">
            <ShieldCheck className="h-3.5 w-3.5" /> Free for everyone. No card. Your data stays yours.
          </p>
        </div>
        <a href="#features" className="absolute bottom-7 left-1/2 -translate-x-1/2" aria-label="Scroll to features">
          <span className="flex flex-col items-center gap-1 text-white/70 transition hover:text-white">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Scroll</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </span>
        </a>
      </section>

      <main id="main" className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        {/* Why */}
        <Reveal className="pt-20 sm:pt-28">
          <h2 className="font-display mx-auto max-w-3xl text-center text-[30px] font-semibold leading-tight tracking-tight sm:text-[40px]">
            Lotteries close quietly. <em className="font-light italic">Now you'll know first.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
            Dozens of affordable lotteries are open across New York at any moment — and each closes within weeks.
            Lottery Tracker watches them all and puts your deadlines on one calm checklist, so the home you're
            waiting for never slips past you.
          </p>
        </Reveal>

        {/* Features */}
        <section id="features" className="scroll-mt-20 pt-14 sm:pt-20">
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 90}>
                <article className="panel h-full p-6">
                  <span className="grad-primary grid h-11 w-11 place-items-center rounded-xl text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 pt-20 sm:pt-28">
          <Reveal>
            <h2 className="font-display text-center text-[30px] font-semibold leading-tight tracking-tight sm:text-[40px]">
              Three steps. <em className="font-light italic">That's it.</em>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 110}>
                <article className="panel h-full p-6">
                  <span className="grad-orange grid h-11 w-11 place-items-center rounded-full text-lg font-bold text-white shadow-sm">
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Sponsorship — the paid unit that keeps the service free */}
        <section className="pt-20 sm:pt-28">
          <Reveal>
            <h2 className="font-display text-center text-[26px] font-semibold leading-tight tracking-tight sm:text-[34px]">
              Free for everyone, <em className="font-light italic">sponsored by neighbors.</em>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Lottery Tracker is a public service: every feature stays free because local businesses sponsor this
              space. One sponsor per screen, clearly labeled, never inside your checklist.
            </p>
          </Reveal>
          <Reveal className="mt-8" delay={120}>
            <SponsorSlot />
          </Reveal>
        </section>

        {/* Closing CTA */}
        <Reveal className="pb-24 pt-20 sm:pb-32 sm:pt-28">
          <div className="grad-deep relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12">
            <div className="relative">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-lg mx-auto">
                <BrandMark className="h-11 w-11" />
              </span>
              <h2 className="font-display mt-6 text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
                Your next home has a deadline. <em className="font-light italic">Catch it.</em>
              </h2>
              <Link
                to="/login"
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl bg-white px-8 text-base font-bold text-[#1e6fe8] shadow-lg transition hover:-translate-y-px hover:shadow-xl"
              >
                Start tracking free <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 text-center sm:px-8">
          <p className="text-[13px] text-muted-foreground">
            Listings from NYC Housing Connect. Not affiliated with NYC HPD or Housing Connect. Always apply on the
            official site.{" "}
            <Link to="/privacy" className="font-semibold text-primary underline-offset-2 hover:underline">
              Privacy
            </Link>
          </p>
          <p className="text-[13px] text-muted-foreground/80">
            made with <span aria-label="blue heart">💙</span> by{" "}
            <span className="font-semibold text-foreground/70">bluNite</span>
          </p>
        </div>
      </footer>

      <DedicationRibbon />
    </div>
  );
}
