import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Check, Loader2, Sparkles } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PRO_SALES_PAUSED } from "@/lib/flags";
import { openStripe } from "@/lib/openStripe";

const FREE = ["Browse every live lottery", "Save lotteries & deadline alerts", "Map, calendar & countdowns", "Sync across devices", "Supported by ads"];
const PRO = ["Everything in Free", "No ads, anywhere", "Priority early access to new features", "Supports an independent, scam-free tracker"];

export default function Upgrade() {
  const { user } = useStore();
  // While Pro sales are paused the plans page is closed entirely — no baiting,
  // just the free service. Flipping PRO_SALES_PAUSED restores this page.
  if (PRO_SALES_PAUSED) return <Navigate to="/" replace />;
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const isPro = user?.plan === "pro";

  async function checkout(plan: "monthly" | "yearly") {
    setBusy(plan);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", { body: { mode: "checkout", plan } });
      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error("Checkout didn't open. Try again in a moment.");
      if (!openStripe(data.url as string)) setBusy(null);
    } catch (err) {
      toast.error("Couldn't start checkout", { description: err instanceof Error ? err.message : "Please try again." });
      setBusy(null);
    }
  }

  return (
    <AppShell header={<PageTitle title="Choose your plan" subtitle="Use NYC Lottery Tracker free with ads, or go ad-free with Pro." />}>
      <div className="grid gap-5 md:grid-cols-2">
        <section className="panel p-6">
          <h2 className="font-display text-2xl font-semibold">Free</h2>
          <p className="mt-1 text-4xl font-bold tabular">$0</p>
          <p className="mt-1 text-sm text-muted-foreground">Everything you need to never miss a deadline.</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {FREE.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-primary" /> {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="mt-6 w-full" disabled>
            {isPro ? "Not available on Pro" : "Your current plan"}
          </Button>
        </section>

        <section
          className={cn(
            "relative overflow-hidden rounded-2xl p-6 text-white shadow-sm ring-1 ring-primary/30",
            "bg-[linear-gradient(160deg,#3b8bff_0%,#1e6fe8_55%,#1554b4_100%)]",
          )}
        >
          <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
            Best value
          </span>
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Sparkles className="h-5 w-5" /> Pro
          </h2>
          <p className="mt-1 text-4xl font-bold tabular">
            $4<span className="text-base font-medium opacity-80">/mo</span>
          </p>
          <p className="mt-1 text-sm opacity-85">or $24/year — two months free.</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {PRO.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <Button variant="outline" className="mt-6 w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={() => navigate("/account")}>
              You're on Pro — manage in Account
            </Button>
          ) : PRO_SALES_PAUSED ? (
            <div className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm leading-snug">
              <p className="font-semibold">Pro subscriptions are temporarily closed</p>
              <p className="mt-1 opacity-85">We're opening them again soon. Everything stays free with ads in the meantime.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-2">
              <Button variant="outline" className="w-full border-white/40 bg-white text-primary hover:bg-white/90" disabled={!!busy} onClick={() => checkout("monthly")}>
                {busy === "monthly" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Start monthly — $4/mo
              </Button>
              <Button variant="outline" className="w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white" disabled={!!busy} onClick={() => checkout("yearly")}>
                {busy === "yearly" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Start yearly — $24/yr
              </Button>
            </div>
          )}
          <p className="mt-3 text-xs opacity-75">
            Secure checkout by Stripe. Subscriptions renew until cancelled; cancel anytime from Account → Manage subscription and keep access until the end of the paid period. No refunds or returns — cancellations only. Applications to housing lotteries are always free — this only supports the tracker.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
