import { useState, type FormEvent, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { toInputDate, DAY } from "@/lib/dates";
import type { Borough } from "@/lib/lotteries";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function AddReminderDialog({ children, lotteryId }: { children: ReactNode; lotteryId?: string }) {
  const { saved, addTask } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(toInputDate(new Date(Date.now() + DAY)));
  const [time, setTime] = useState("17:00");
  const [lottery, setLottery] = useState<string>(lotteryId ?? "none");
  const savedList = Object.values(saved);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const due = new Date(`${date}T${time || "17:00"}`).toISOString();
    const s = lottery !== "none" ? saved[lottery] : undefined;
    addTask({ title: title.trim(), due, lottery: s ? { id: s.lotteryId, name: s.name, borough: s.borough as Borough } : undefined });
    toast.success("Reminder added", { description: title.trim() });
    setTitle("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add a reminder</DialogTitle>
            <DialogDescription>For example: "Get pay stubs from HR" or "Call the leasing office".</DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="r-title">What do you need to do?</Label>
              <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Request tax return transcript" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="r-date">Date</Label>
                <Input id="r-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-time">Time</Label>
                <Input id="r-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Related lottery</Label>
              <Select value={lottery} onValueChange={setLottery}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {savedList.map((s) => (
                    <SelectItem key={s.lotteryId} value={s.lotteryId}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add reminder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
