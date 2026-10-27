import { Bell, BellRing } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Lottery } from "@/lib/lotteries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SaveButton({ lottery, size = "default", className }: { lottery: Lottery; size?: "default" | "lg"; className?: string }) {
  const { isSaved, saveLottery, unsaveLottery } = useStore();
  const saved = isSaved(lottery.id);
  const lg = size === "lg";

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      unsaveLottery(lottery.id);
      toast("Alert removed", { description: lottery.name, action: { label: "Undo", onClick: () => saveLottery(lottery) } });
    } else {
      saveLottery(lottery);
      toast.success("Alert set", { description: `We added a checklist for ${lottery.name} to My Alerts.` });
    }
  };

  return (
    <Button
      onClick={toggle}
      variant={lg ? (saved ? "outline" : "default") : saved ? "secondary" : "outline"}
      aria-pressed={saved}
      className={cn(
        "gap-2 rounded-lg",
        lg ? "h-12 px-6 text-[15px]" : "h-10 px-4",
        !lg && saved && "border border-primary/30 bg-accent text-primary hover:bg-accent",
        lg && saved && "border-primary/40 text-primary",
        className,
      )}
    >
      {saved ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {lg ? (saved ? "Alert set" : "Set alert") : saved ? "Saved" : "Save"}
    </Button>
  );
}
