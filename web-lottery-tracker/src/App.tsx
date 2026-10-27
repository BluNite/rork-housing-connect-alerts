import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
  const { user, ready, loading } = useStore();
  if (!ready || loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <BrandMark className="h-12 w-12 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading your alerts…</p>
        </div>
      </div>
    );
  }
  if (!user)
    return (
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  return (
    <>
      <IdleSignOut />
      <Routes>
        <Route path="/" element={<Alerts />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/lottery/:id" element={<LotteryDetail />} />
        <Route path="/calendar" element={<CalendarPage />} />
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
