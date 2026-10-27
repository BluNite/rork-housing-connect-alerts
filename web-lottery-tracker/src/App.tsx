import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider, useStore } from "@/lib/store";
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
    <Routes>
      <Route path="/" element={<Alerts />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/lottery/:id" element={<LotteryDetail />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/account" element={<Account />} />
      <Route path="/upgrade" element={<Upgrade />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
