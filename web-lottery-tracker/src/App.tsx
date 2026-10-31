import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider, useStore } from "@/lib/store";
import { useDevicePrefs, buzz } from "@/lib/devicePrefs";
import { BrandMark } from "@/components/BrandMark";
import { CookieBanner } from "@/components/CookieBanner";

import Alerts from "./pages/Alerts";
import Browse from "./pages/Browse";
import LotteryDetail from "./pages/LotteryDetail";
import CalendarPage from "./pages/CalendarPage";
import Account from "./pages/Account";
import Upgrade from "./pages/Upgrade";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import { Privacy } from "./pages/Privacy";
import { Guides, GuideArticle } from "./pages/Guides";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * Branded transition screen shown while auth state settles (initial load,
 * sign-in, profile fetch). Blocks the momentary flash of the wrong page.
 */
function LaunchScreen() {
  return (
    <div className="grad-deep grid min-h-screen place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <div className="relative grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 rounded-full border-[3px] border-white/15" aria-hidden />
          <span
            className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-white/90 motion-reduce:animate-none"
            style={{ animationDuration: "1.1s" }}
            aria-hidden
          />
          <BrandMark className="h-9 w-9" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-white">Preparing your alerts…</p>
          <p className="mt-1 text-sm text-white/60">One moment — we're syncing your lotteries.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Inactivity guard: after the user's chosen idle time (Account → Accessibility
 * & session; default 15 minutes) with no clicks, keys, scroll, or mouse
 * movement, sign the user out and return to the landing page (user request —
 * protects accounts on shared computers). Signing in again is one tap.
 */
function IdleSignOut() {
  const { user, signOut } = useStore();
  const navigate = useNavigate();
  const { idleTimeoutMinutes: minutes } = useDevicePrefs();
  useEffect(() => {
    if (!user || minutes === 0) return;
    const IDLE_LIMIT_MS = minutes * 60_000;
    const span = minutes >= 60 ? "1 hour" : `${minutes} minutes`;
    let timer = 0;
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        buzz(30);
        signOut();
        toast.info(`Signed out after ${span} of inactivity`, {
          description: "For your privacy. Sign back in any time — your checklist is waiting.",
        });
        navigate("/");
      }, IDLE_LIMIT_MS);
    };
    const events = ["pointerdown", "keydown", "scroll", "mousemove"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user, minutes, signOut, navigate]);
  return null;
}

function Gate() {
  const { user, ready, loading, authPending } = useStore();
  if (!ready || loading || authPending) {
    return <LaunchScreen />;
  }
  if (!user)
    return (
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
        {/* Guides are crawlable/reviewable without an account (AdSense §B). */}
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:slug" element={<GuideArticle />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  return (
    <>
      <IdleSignOut />
      <Routes>
        <Route path="/" element={<Alerts />} />
        {/* Signed-in users never belong on the auth screen — land them at home instead of the 404 catch-all. */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/lottery/:id" element={<LotteryDetail />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:slug" element={<GuideArticle />} />
        <Route path="/account" element={<Account />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StoreProvider>
        <Toaster position="bottom-right" />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Gate />
          <CookieBanner />
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
