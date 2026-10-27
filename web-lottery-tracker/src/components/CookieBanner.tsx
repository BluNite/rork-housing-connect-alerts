import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const KEY = "ltn:cookie-consent";

/**
 * Cookie consent banner. Until ads are enabled only an essential session cookie
 * exists; the choice is stored and will later gate the ad partner's script.
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(!localStorage.getItem(KEY));
  }, []);
  if (!show) return null;
  const decide = (value: "all" | "essential") => {
    localStorage.setItem(KEY, value);
    setShow(false);
  };
  return (
    <div className="fixed inset-x-0 bottom-[72px] z-50 px-4 sm:px-6">
      <div className="panel mx-auto flex max-w-3xl flex-wrap items-center gap-4 px-5 py-4 shadow-lg">
        <Cookie className="h-5 w-5 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-muted-foreground">
          We use one essential cookie to keep you signed in. On the Free plan, ad partners may set additional cookies.{" "}
          <Link to="/privacy" className="font-semibold text-primary hover:underline">
            Privacy policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => decide("essential")} className="rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            Essential only
          </button>
          <button onClick={() => decide("all")} className="grad-primary rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:brightness-[1.07]">
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
