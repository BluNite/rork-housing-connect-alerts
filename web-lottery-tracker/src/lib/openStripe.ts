import { toast } from "sonner";

/**
 * Sends the user to a Stripe-hosted page (Checkout or Billing Portal).
 * Stripe refuses to render inside iframes, so when the app is framed
 * (e.g. an editor preview) we open a new tab instead of navigating in place.
 * Returns true when navigation started in this tab.
 */
export function openStripe(url: string): boolean {
  let framed = false;
  try {
    framed = window.self !== window.top;
  } catch {
    framed = true;
  }

  if (!framed) {
    window.location.assign(url);
    return true;
  }

  const tab = window.open(url, "_blank", "noopener,noreferrer");
  if (!tab) {
    // Popup blocked — give the user a one-tap way through.
    toast("Secure checkout is ready", {
      description: "Your browser blocked the new tab. Tap Open to continue on Stripe.",
      action: { label: "Open", onClick: () => window.open(url, "_blank", "noopener,noreferrer") },
      duration: 20000,
    });
  } else {
    toast.success("Opened Stripe in a new tab", { description: "Finish there, then come back — your plan updates automatically." });
  }
  return false;
}
