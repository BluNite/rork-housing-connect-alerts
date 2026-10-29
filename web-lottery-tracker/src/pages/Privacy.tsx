import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";

/** Awareness-ribbon symbol: solid loop, two strands crossing underneath. */
export function RibbonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 11.4c-2.2-1.6-3.6-3.5-3.6-5.3C8.4 3.8 10 2.4 12 2.4s3.6 1.4 3.6 3.7c0 1.8-1.4 3.7-3.6 5.3Z" fill="currentColor" stroke="none" />
      <path d="M10.4 12.2c.4 3 2.4 5.8 6.8 8.3" />
      <path d="M13.6 12.2c-.4 3-2.4 5.8-6.8 8.3" />
    </svg>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-6">
    <h2 className="text-lg font-bold">{title}</h2>
    <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

export function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 pb-36 pt-10 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-card shadow-sm ring-1 ring-border">
            <BrandMark className="h-8 w-8" />
          </span>
          <span className="font-bold">NYC Lottery Tracker</span>
        </Link>
        <h1 className="font-display text-grad mt-8 text-4xl font-semibold">Privacy policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated October 27, 2026</p>

        <Section title="The short version">
          <p>
            Anyone with the link can browse lottery listings. Everything you save — saved lotteries, alerts, reminders, and
            settings — is tied to your signed-in account and visible only to you. We don't sell your data.
          </p>
        </Section>

        <Section title="What we collect">
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong className="text-foreground">Account details:</strong> your email address and display name, used only to sign you in and sync your alerts.</li>
            <li><strong className="text-foreground">Your alerts:</strong> saved lotteries, checklist tasks, deadlines, and notification preferences. These are protected by row-level security: only your account can read them.</li>
            <li><strong className="text-foreground">Essential cookies/local storage:</strong> a session token that keeps you signed in. We don't use tracking cookies of our own.</li>
            <li><strong className="text-foreground">Billing (Pro only):</strong> payments are handled by Stripe. We never see or store your card details; we keep only your Stripe customer ID. Subscriptions renew until cancelled; cancelling keeps Pro until the end of the paid period. We do not offer refunds or returns — cancellations only.</li>
          </ul>
        </Section>

        <Section title="Ads on the Free plan">
          <p>
            Free accounts see ads. When ad partners are enabled, their code may set cookies and collect device information to
            show and measure ads. We plan to block ad categories that target people seeking affordable housing with fee-charging
            "application services" — real applications are always free on Housing Connect. Pro accounts see no ads at all.
          </p>
        </Section>

        <Section title="Listing data">
          <p>
            Lottery listings come from NYC Housing Connect's public search. We are not affiliated with NYC HPD or Housing
            Connect; always confirm deadlines and figures on the official site before applying.
          </p>
        </Section>

        <Section title="Your choices and rights">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Export your alerts to a calendar file anytime from the Account screen.</li>
            <li>Delete all saved lotteries and alerts from the Account screen.</li>
            <li>
              Delete your account from the Account screen: deletion is scheduled 30 days out, everything stays intact during that grace period, and you can cancel it there at any time. Afterwards the data is erased automatically and permanently.
            </li>
            <li>Decline optional cookies in the banner; the app works fully without them.</li>
          </ul>
        </Section>

        <Section title="Contact">
          <p>Questions or deletion requests: use the Help &amp; Resources link in the app to reach us.</p>
        </Section>

        <Link to="/" className="mt-10 inline-block font-semibold text-primary hover:underline">
          ← Back to NYC Lottery Tracker
        </Link>
        <div className="mt-8 flex flex-col items-center gap-2.5">
          <RibbonIcon className="h-6 w-6 text-primary/70" />
          <p className="text-xs text-muted-foreground/80">
            made with <span aria-label="blue heart">💙</span> by <span className="font-semibold">bluNite</span>
          </p>
        </div>
      </div>
      <DedicationRibbon />
    </div>
  );
}

/** Blue dedication ribbon pinned to the bottom of the app. */
export function DedicationRibbon() {
  return (
    <div
      role="note"
      aria-label="Dedication"
      className="grad-deep fixed inset-x-0 bottom-0 z-40 px-4 py-3 text-center text-white"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
        Dedicated to targeted individuals worldwide facing homelessness and displacement
      </p>
      <p className="font-display mt-1 flex items-center justify-center gap-2.5 text-[17px] italic leading-snug tracking-wide sm:text-lg">
        <RibbonIcon className="h-5 w-5 shrink-0 text-[#9ec2ff]" />
        Everyone deserves a safe home.
      </p>
    </div>
  );
}
