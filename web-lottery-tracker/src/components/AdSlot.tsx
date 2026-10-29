import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";

const CONSENT_KEY = "ltn:cookie-consent";
export type AdConsent = "all" | "essential" | "unknown";

/** Your AdSense publisher ID. Empty = house ads only. */
const ADSENSE_CLIENT: string = "ca-pub-7697385175735400";
/** Optional per-slot unit ID from the AdSense dashboard ("" = auto unit sizing). */
const ADSENSE_SLOT_ID = "";

/**
 * Inside the Android app shell (its WebView adds this user-agent marker) AdSense
 * is not allowed by Google policy without the Mobile Ads WebView API, so the
 * app shows only the first-party house ad until that is set up.
 */
const IN_ANDROID_APP =
  typeof navigator !== "undefined" && navigator.userAgent.includes("NYCLotteryTrackerAndroid");

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

interface AdSenseWindow extends Window {
  adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
}

/**
 * Loads the AdSense loader exactly once, only on explicit "all" consent, and
 * pins every request to NON-personalized ads — this audience may include
 * housing-insecure and financially vulnerable people; we never personalize
 * against their app data (ads-standard.md §4). In-display units only: the
 * dashboard must not enable vignette/anchor/interstitial formats (§6).
 */
function useAdSenseLoader(active: boolean) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!active || !ADSENSE_CLIENT || loaded) return;
    const w = window as AdSenseWindow;
    w.adsbygoogle = w.adsbygoogle ?? (Object.assign([] as unknown[], { requestNonPersonalizedAds: 1 }) as AdSenseWindow["adsbygoogle"]);
    w.adsbygoogle!.requestNonPersonalizedAds = 1;
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.onload = () => setLoaded(true);
      s.onerror = () => setLoaded(true); // failed load must not brick the slot
      document.head.appendChild(s);
    } else {
      setLoaded(true);
    }
  }, [active, loaded]);
  return loaded;
}

declare global {
  // eslint-disable-next-line no-var
  var adsbygoogle: AdSenseWindow["adsbygoogle"];
}

/**
 * Ad slot for free accounts. Renders nothing for Pro users.
 * With ADSENSE_CLIENT set and consent given, a non-personalized AdSense unit
 * renders inside this reserved-height box; otherwise the first-party house ad
 * (our own upgrade pitch — no tracking, safe under any consent choice).
 *
 * Placement rules live in .rork/ads-standard.md — the Alerts right rail and
 * the end of the Browse list are the only allowed placements.
 */
export function AdSlot({ className }: { className?: string }) {
  const { user } = useStore();
  const consent = useAdConsent();
  const partner = consent === "all" && ADSENSE_CLIENT !== "" && !IN_ANDROID_APP;
  useAdSenseLoader(partner);
  const [unitMounted, setUnitMounted] = useState(false);

  useEffect(() => {
    if (!unitMounted) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch (err) {
      console.error("[ads] unit push", err);
    }
  }, [unitMounted]);

  if (!user || user.plan === "pro") return null;
  return (
    // Reserved height: the ad unit loads into this box without shifting the
    // page (ads-standard.md §3).
    <section aria-label="Advertisement" data-ad-slot className={`min-h-[120px] ${className ?? ""}`}>
      {partner ? (
        <div className="rounded-2xl border border-dashed border-warn/40 bg-card p-3">
          <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-warn-ink">Advertisement</p>
          <ins
            ref={() => setUnitMounted(true)}
            className="adsbygoogle block"
            style={{ display: "block", minHeight: 100 }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOT_ID || undefined}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
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
      )}
    </section>
  );
}
