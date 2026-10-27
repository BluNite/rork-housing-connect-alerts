import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarPlus, CreditCard, Download, Lock, LogOut, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppShell, PageTitle } from "@/components/AppShell";
import { useStore, STATUS_LABEL } from "@/lib/store";
import { fmtDate } from "@/lib/dates";
import { downloadIcs } from "@/lib/reminders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Account() {
  const { user, updateProfile, signOut, saved, tasks, prefs, unsaveLottery, clearData, refresh } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);
  const savedList = Object.values(saved).sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  // Returning from a successful Stripe checkout lands on /account?upgraded=1.
  const upgraded = params.get("upgraded") === "1";
  useEffect(() => {
    if (!upgraded || !user) return;
    refresh();
    navigate("/account", { replace: true });
    toast.success("Welcome to Pro!", { description: "Ads are gone and new perks are on the way. Thank you!" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgraded]);

  // GDPR portability: a machine-readable copy of everything we hold.
  function downloadData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: { email: user?.email, name: user?.name, plan: user?.plan },
      preferences: prefs,
      savedLotteries: savedList,
      tasks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lottery-tracker-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data downloaded", { description: "A JSON copy of everything your account holds." });
  }

  // GDPR erasure with a 30-day grace period: the server cancels any active
  // subscription, stamps a deletion date, and a nightly job purges the data.
  async function deleteAccount() {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", { body: {} });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(String(data.error));
      await refresh();
      toast.success("Deletion scheduled", {
        description: `Your account will be erased on ${data?.scheduledFor ? fmtDate(String(data.scheduledFor)) : "the scheduled date"}. You can cancel until then from this screen.`,
      });
    } catch (err) {
      toast.error("Couldn't delete account", { description: err instanceof Error ? err.message : "Try again in a moment." });
    } finally {
      setBusy(false);
    }
  }

  async function manageBilling() {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", { body: { mode: "portal" } });
      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error("Portal didn't open. Try again in a moment.");
      window.location.assign(data.url as string);
    } catch (err) {
      toast.error("Couldn't open billing", { description: err instanceof Error ? err.message : "Please try again." });
      setBusy(false);
    }
  }

  return (
    <AppShell header={<PageTitle title="Account" subtitle="Your profile, saved lotteries, and data." />}>
      {user?.deletionAt && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold text-destructive">Deletion scheduled.</span> Your account and all its data will be
            permanently erased on {fmtDate(user.deletionAt)}. You can cancel until then.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const { data, error } = await supabase.functions.invoke("delete-account", { body: { cancel: true } });
                if (error) throw new Error(error.message);
                if (data?.error) throw new Error(String(data.error));
                await refresh();
                toast.success("Deletion cancelled", { description: "Your account is safe. Sorry to see you stay!" });
              } catch (err) {
                toast.error("Couldn't cancel deletion", { description: err instanceof Error ? err.message : "Try again in a moment." });
              } finally {
                setBusy(false);
              }
            }}
          >
            Cancel deletion
          </Button>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <section className="panel p-6">
          <h2 className="text-lg font-bold">Saved lotteries</h2>
          <p className="text-sm text-muted-foreground">Removing one also removes its alerts.</p>
          {savedList.length ? (
            <ul className="mt-3 divide-y">
              {savedList.map((s) => (
                <li key={s.lotteryId} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <Link to={`/lottery/${s.lotteryId}`} className="font-semibold hover:text-primary hover:underline">
                      {s.name}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {s.borough}
                      {s.end ? ` · Deadline ${fmtDate(s.end)}` : ""}
                    </div>
                  </div>
                  <span className="rounded-lg bg-accent px-2.5 py-1 text-[13px] font-medium text-accent-foreground">{STATUS_LABEL[s.status]}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      unsaveLottery(s.lotteryId);
                      toast("Removed", { description: s.name });
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-sm text-muted-foreground">
              Nothing saved yet.{" "}
              <Link to="/browse" className="font-medium text-primary hover:underline">
                Browse lotteries
              </Link>
            </p>
          )}
          <p className="mt-4 flex items-center gap-2 border-t pt-4 text-[13px] text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
            These entries are visible only to your signed-in account ({user?.email}).
          </p>
        </section>

        <aside className="space-y-5">
          <section className="panel p-5">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-xl font-semibold text-primary">{user?.name.charAt(0).toUpperCase()}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-semibold">
                  {user?.name}
                  {user?.plan === "pro" ? (
                    <span className="grad-primary rounded-full px-2 py-0.5 text-[11px] font-semibold text-white">Pro</span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">Free</span>
                  )}
                </div>
                <div className="truncate text-sm text-muted-foreground">{user?.email}</div>
                {user?.plan !== "pro" && (
                  <Link to="/upgrade" className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline">
                    <Sparkles className="h-3.5 w-3.5" /> Go ad-free with Pro
                  </Link>
                )}
              </div>
            </div>
            <form
              className="mt-5 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) {
                  updateProfile(name.trim());
                  toast.success("Profile updated");
                }
              }}
            >
              <Label htmlFor="acc-name">Display name</Label>
              <div className="flex gap-2">
                <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} />
                <Button type="submit" variant="outline" disabled={!name.trim() || name.trim() === user?.name}>
                  Save
                </Button>
              </div>
            </form>
          </section>

          <section className="panel space-y-3 p-5">
            <h2 className="text-lg font-bold">Your data</h2>
            <div className="flex gap-3 rounded-xl bg-accent/70 p-3.5 ring-1 ring-accent">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-[13px] leading-relaxed text-foreground">
                <span className="font-semibold">Public link, private data.</span> Anyone with the link can browse listings and open the app, but your saved lotteries, alerts, and settings are tied to your signed-in account and visible only to you.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Your alerts sync privately to your account, so they're the same on every device you sign in on.</p>
            <Button variant="outline" className="w-full gap-2" disabled={tasks.every((t) => t.done)} onClick={() => downloadIcs(tasks)}>
              <CalendarPlus className="h-4 w-4" /> Export alerts to calendar
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={downloadData}>
              <Download className="h-4 w-4" /> Download my data (JSON)
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> Clear all alerts & saved lotteries
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear everything?</AlertDialogTitle>
                  <AlertDialogDescription>This removes all saved lotteries and alerts for {user?.email}. This can't be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => {
                      clearData();
                      toast("All data cleared");
                    }}
                  >
                    Clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3.5">
              <p className="text-[13px] font-semibold text-destructive">Delete account</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Schedules permanent deletion of your account, saved lotteries, alerts, and settings in 30 days, and cancels any active subscription right away. You can cancel any time during the grace period.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="mt-3 w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={busy}>
                    <Trash2 className="h-4 w-4" /> Delete my account permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Schedule account deletion?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your subscription is cancelled now and {user?.email} is scheduled for permanent deletion in 30 days. Everything stays intact until then, and you can cancel from this screen at any time during the grace period.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep my account</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={deleteAccount}>
                      Schedule deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>

          <section className="panel space-y-3 p-5">
            <h2 className="text-lg font-bold">Your plan</h2>
            {user?.plan === "pro" ? (
              <>
                <p className="text-sm text-muted-foreground">You're on Pro — no ads, with our thanks. Manage billing, invoices, or cancel below.</p>
                <Button variant="outline" className="w-full" disabled={busy} onClick={manageBilling}>
                  <CreditCard className="h-4 w-4" /> {busy ? "Opening Stripe…" : "Manage subscription"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">You're on Free, which shows ads. Go ad-free for $4/mo or $24/yr.</p>
                <Button className="w-full" onClick={() => navigate("/upgrade")}>
                  <Sparkles className="h-4 w-4" /> Upgrade to Pro
                </Button>
              </>
            )}
          </section>
        </aside>
      </div>

      <section className="panel mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="font-semibold">Sign out of Lottery Tracker</div>
          <p className="text-sm text-muted-foreground">Ends your session on this device. Your alerts stay safe in your account.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            signOut();
            navigate("/", { replace: true });
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </section>
    </AppShell>
  );
}
