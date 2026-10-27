import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";

const CONSENT_KEY = "ltn:cookie-consent";
export type AdConsent = "all" | "essential" | "unknown";

/**
 * Cookie-consent state for ads. Third-party ad scripts may only load on "all";
 * "essential" and undecided mean no partner script and no partner cookie.
 * (See .rork/ads-standard.md §4.)
 */
export function useAdConsent(): AdConsent {
  const [consent, setConsent] = useState<AdConsent>("unknown");
  useEffect(() => {
    setConsent((localStorage.getItem(CONSENT_KEY) as AdConsent) ?? "unknown");
  }, []);
  return consent;
}

/**
 * Ad slot for free accounts. Renders nothing for Pro users.
 * Today it shows a first-party house ad (our own upgrade pitch — no tracking,
 * safe under any consent choice). When Google AdSense is approved, its unit
 * renders inside this same reserved-height slot, gated by useAdConsent, with
 * the CSP change isolated to this one component.
 *
 * Placement rules live in .rork/ads-standard.md — only the Alerts right rail
 * and the end of the Browse list are allowed.
 */
export function AdSlot({ className }: { className?: string }) {
  const { user } = useStore();
  if (!user || user.plan === "pro") return null;
  return (
    // Reserved height: the future ad unit loads into this box without
    // shifting the page (ads-standard.md §3).
    <section aria-label="Advertisement" data-ad-slot className={`min-h-[120px] ${className ?? ""}`}>
      <div className="rounded-2xl border border-dashed border-warn/40 bg-gradient-to-br from-warn-soft/70 via-card to-accent/60 p-5">
        <div className="flex items-start gap-3">
          <span className="grad-orange grid h-10 w-10 shrink-0 place-items-center rounded-full text-white shadow-sm">
            <Megaphone className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-warn-ink">Advertisement</p>
            <p className="mt-1 text-sm leading-snug text-foreground">
              Upgrade to Pro for an ad-free experience and to support the tracker.
            </p>
            <Link
              to="/upgrade"
              className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" /> See plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
