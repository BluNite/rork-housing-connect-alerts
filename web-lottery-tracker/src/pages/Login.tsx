import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BellRing, CalendarCheck, ListChecks, ArrowRight, Mail, Loader2, ArrowLeft, Eye, EyeOff, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { isLocked, msLeft, recordFailure, clearFailures, cooldownMessage } from "@/lib/authThrottle";
import { BrandMark } from "@/components/BrandMark";
import { DedicationRibbon } from "@/pages/Privacy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const POINTS = [
  { icon: BellRing, title: "Save lotteries you like", body: "Live listings from NYC Open Data, filtered by borough, bedrooms, and income." },
  { icon: ListChecks, title: "Get a to-do list for each one", body: "Check eligibility, gather documents, and apply, each with its own due date." },
  { icon: CalendarCheck, title: "Never miss a deadline", body: "Countdown, calendar, browser alerts, and export to your own calendar." },
];

const HOODS = ["Astoria", "Bushwick", "Fordham", "Harlem", "Jamaica", "Sunset Park", "St. George", "Kingsbridge", "Flatbush", "Ridgewood", "Inwood", "Elmhurst"];

type Mode = "signin" | "signup" | "magic";

const friendly = (msg: string) => {
  if (/invalid login credentials/i.test(msg)) return "That email and password don't match. Try again or use a sign-in link.";
  if (/already registered/i.test(msg)) return "An account with this email already exists. Sign in instead.";
  if (/rate limit/i.test(msg)) return "Too many emails sent. Wait a few minutes and try again.";
  if (/email not confirmed/i.test(msg)) return "Please confirm your email first. Check your inbox and spam folder for the confirmation link.";
  return msg;
};

/** Everyday user mistakes the form already explains, so they aren't logged as app errors. */
const EXPECTED_AUTH = /invalid login credentials|already registered|rate limit|email not confirmed/i;

export default function Login() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState<null | "email">(null);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const valid = emailOk && (mode === "magic" || password.length >= 6);
  const redirectTo = window.location.origin;

  // Failed-attempt throttle: 5 failures per email per 15 minutes.
  const addr0 = email.trim().toLowerCase();
  const locked = isLocked(addr0);
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setTick((t) => t + 1), 1_000);
    return () => clearInterval(id);
  }, [locked, addr0]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    const addr = email.trim().toLowerCase();
    if (isLocked(addr)) {
      setError(cooldownMessage(addr));
      return;
    }
    setBusy("email");
    setError(null);
    try {
      if (mode === "magic") {
        const { error: err } = await supabase.auth.signInWithOtp({ email: addr, options: { emailRedirectTo: redirectTo } });
        if (err) throw err;
        clearFailures(addr);
        setSentTo(addr);
      } else if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: addr,
          password,
          options: { emailRedirectTo: redirectTo, data: { name: name.trim() || addr.split("@")[0] } },
        });
        if (err) throw err;
        clearFailures(addr);
        if (!data.session) setSentTo(addr);
        else toast.success("Account created. Welcome!");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: addr, password });
        if (err) throw err;
        clearFailures(addr);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (!EXPECTED_AUTH.test(msg)) console.error("[auth]", err);
      recordFailure(addr);
      setError(isLocked(addr) ? cooldownMessage(addr) : friendly(msg));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="grad-deep relative hidden overflow-hidden p-12 text-primary-foreground lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-background p-1.5">
            <BrandMark className="h-9 w-9" />
          </div>
          <span className="text-lg font-bold tracking-tight">Lottery Tracker</span>
        </div>

        <div className="my-auto max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
            NYC Housing Connect, tracked
          </p>
          <h1 className="font-display mt-6 text-[52px] font-semibold leading-[1.04] tracking-tight xl:text-[60px]">
            Find your <em className="font-light italic">home</em> in the five boroughs.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
            Every affordable housing lottery in New York City, saved to one calm checklist.
          </p>

          <ul className="mt-10 space-y-5">
            {POINTS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex gap-4 rise" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="mt-0.5 text-sm text-white/70">{body}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -top-16 right-12 hidden xl:block">
            <div className="floaty -rotate-6 rounded-xl bg-warn px-5 py-3 text-center text-warn-ink shadow-lg">
              <div className="text-[22px] font-extrabold leading-none">Free</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider">to apply</div>
            </div>
          </div>
          <div className="relative overflow-hidden border-t border-white/15 pt-5" aria-hidden>
            <div className="marquee-track flex w-max gap-8 text-sm font-medium text-white/55">
              {[...HOODS, ...HOODS].map((h, i) => (
                <span key={i} className="flex items-center gap-8">
                  {h} <span className="h-1 w-1 rounded-full bg-white/40" />
                </span>
              ))}
            </div>
          </div>
        </div>

        <svg className="pointer-events-none absolute -bottom-2 left-0 right-0 h-36 w-full text-white/10" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0 160V96h30V60h24v36h20V30h36v66h18V70h28v26h22V44h14V20h20v24h14v52h26V64h30v32h16V50h40v46h20V76h24v20h22V36h30v60h18V58h26v38h24V80h30v16h22V40h40v56h16v64z" />
        </svg>
      </section>

      <section className="relative flex items-center justify-center overflow-hidden px-6 pt-12 pb-36">
        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-primary via-warn to-primary/40" aria-hidden />
        <div className="w-full max-w-sm rise">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark className="h-10 w-10" />
            <span className="text-lg font-bold">Lottery Tracker</span>
          </div>
          {sentTo ? (
            <div className="rise">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
                <MailCheck className="h-7 w-7" />
              </span>
              <h2 className="font-display mt-6 text-[34px] font-semibold leading-tight tracking-tight">
                Check your <em className="font-light italic">inbox</em>.
              </h2>
              <p className="mt-3 text-muted-foreground">
                We sent a link to <span className="font-semibold text-foreground">{sentTo}</span>. Open it on this device to sign in.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Can't find it? Check your spam folder.</p>
              <Button variant="outline" className="mt-8 h-11" onClick={() => setSentTo(null)}>
                <ArrowLeft className="h-4 w-4" /> Use a different email
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </p>
              <h2 className="font-display mt-3 text-[34px] font-semibold leading-tight tracking-tight sm:text-[38px]">
                One checklist for <em className="font-light italic">every</em> lottery.
              </h2>
              <p className="mt-3 text-muted-foreground">Your saved lotteries and alerts follow you on every device.</p>

              {mode !== "magic" && (
                <div className="mb-5 grid grid-cols-2 rounded-lg bg-muted p-1 text-sm font-semibold" role="tablist">
                  {(["signin", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => switchMode(m)}
                      className={`rounded-md py-2 transition ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {m === "signin" ? "Sign in" : "Create account"}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2 rise">
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria" className="h-12 bg-card" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@example.com" className="h-12 bg-card" />
                </div>
                {mode !== "magic" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                        className="h-12 bg-card pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={!valid || !!busy || locked} className="group h-12 w-full text-[15px]">
                  {busy === "email" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === "magic" ? (
                    <>
                      <Mail className="h-4 w-4" /> Email me a sign-in link
                    </>
                  ) : (
                    <>
                      {mode === "signup" ? "Create account" : "Sign in"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => switchMode(mode === "magic" ? "signin" : "magic")}
                className="mt-4 w-full text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {mode === "magic" ? "Use a password instead" : "Forgot your password? Email me a sign-in link"}
              </button>
            </>
          )}
          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            This is not your Housing Connect login. You'll still apply on the official NYC Housing Connect website.{" "}
            <Link to="/privacy" className="font-semibold text-primary hover:underline">
              Privacy policy
            </Link>
          </p>
          <p className="mt-3 text-xs text-muted-foreground/80">
            made with <span aria-label="blue heart">💙</span> by <span className="font-semibold">bluNite</span>
          </p>
        </div>
      </section>
      <DedicationRibbon />
    </div>
  );
}
