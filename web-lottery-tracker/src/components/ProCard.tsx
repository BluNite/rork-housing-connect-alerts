import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { openStripe } from "@/lib/openStripe";
import { PRO_SALES_PAUSED } from "@/lib/flags";

const PERKS = ["No ads, anywhere", "Same features, zero clutter", "Cancel anytime"];

/**
 * Compact Pro pitch with working subscribe buttons — drops straight into
 * asides. Opens Stripe Checkout directly; same flow as the Upgrade page.
 */
export function ProCard({ className }: { className?: string }) {
  const { user } = useStore();
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

  if (isPro || PRO_SALES_PAUSED) return null;

  return (
    <section
      aria-label="Subscribe to Pro"
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#3b8bff_0%,#1e6fe8_55%,#1554b4_100%)] p-5 text-white shadow-sm ring-1 ring-primary/30",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Sparkles className="h-5 w-5" aria-hidden /> Go Pro
      </h2>
      <p className="mt-1 text-[13px] leading-snug opacity-85">Ad-free housing hunting, $4/mo or $24/yr — two months free yearly.</p>
      <ul className="mt-3 space-y-1.5 text-[13px]">
        {PERKS.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> {p}
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-2">
        <Button
          variant="outline"
          className="h-10 w-full border-white/40 bg-white text-primary hover:bg-white/90"
          disabled={!!busy}
          onClick={() => checkout("monthly")}
        >
          {busy === "monthly" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Subscribe — $4/mo
        </Button>
        <Button
          variant="outline"
          className="h-10 w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          disabled={!!busy}
          onClick={() => checkout("yearly")}
        >
          {busy === "yearly" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Subscribe — $24/yr
        </Button>
      </div>
      <p className="mt-2.5 text-[11px] leading-snug opacity-75">Secure checkout by Stripe. Cancel anytime, no refunds — cancellations only.</p>
    </section>
  );
}
