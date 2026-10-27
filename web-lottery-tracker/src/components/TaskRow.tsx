import { Link } from "react-router-dom";
import { AlarmClock, MoreVertical, Trash2, ExternalLink } from "lucide-react";
import { useStore, effectiveDue, type Task } from "@/lib/store";
import { daysUntil, fmtDate, fmtTime, relativeDue } from "@/lib/dates";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { buzz } from "@/lib/devicePrefs";
import { toast } from "sonner";

export function DueBadge({ iso, done }: { iso: string; done?: boolean }) {
  const d = daysUntil(iso);
  const tone = done
    ? "bg-muted text-muted-foreground"
    : d < 0
      ? "bg-destructive/10 text-destructive"
      : d <= 7
        ? "bg-warn-soft text-warn-ink"
        : d <= 31
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground";
  const label = done ? "Done" : d > 31 ? "Upcoming" : d > 14 ? `Due ${fmtDate(iso, { year: undefined })}` : relativeDue(iso);
  return <span className={cn("whitespace-nowrap rounded-lg px-2.5 py-1 text-[13px] font-medium tabular", tone)}>{label}</span>;
}

export function TaskRow({ task }: { task: Task }) {
  const { toggleTask, snoozeTask, deleteTask, addTask } = useStore();
  const due = effectiveDue(task);
  const snoozed = task.snoozedUntil && task.snoozedUntil === due;

  const onToggle = () => {
    buzz(task.done ? 8 : 12);
    toggleTask(task.id);
    if (!task.done) toast.success("Nice, marked done", { description: task.title, action: { label: "Undo", onClick: () => toggleTask(task.id) } });
  };

  const onDelete = () => {
    deleteTask(task.id);
    toast("Alert removed", {
      description: task.title,
      action: {
        label: "Undo",
        onClick: () =>
          addTask({ title: task.title, due: task.due, lottery: task.lotteryId ? { id: task.lotteryId, name: task.lotteryName ?? "", borough: (task.borough ?? "NYC") as "NYC" } : undefined }),
      },
    });
  };

  return (
    <li className={cn("group flex items-start gap-4 py-4 transition-opacity", task.done && "opacity-60")}>
      <Checkbox
        checked={task.done}
        onCheckedChange={onToggle}
        aria-label={`Mark "${task.title}" ${task.done ? "not done" : "done"}`}
        className="mt-1 h-5 w-5 rounded-md border-[1.5px]"
      />
      <div className="min-w-0 flex-1">
        <div className={cn("text-[16px] font-semibold leading-snug", task.done && "line-through")}>
          {task.title}
          {task.lotteryName && (
            <>
              {" – "}
              <Link to={`/lottery/${task.lotteryId}`} className="hover:text-primary hover:underline">
                {task.lotteryName}
                {task.borough && task.borough !== "NYC" ? `, ${task.borough}` : ""}
              </Link>
            </>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground tabular">
          <span>
            {fmtDate(due)} at {fmtTime(due)}
          </span>
          {snoozed && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <AlarmClock className="h-3.5 w-3.5" /> Snoozed
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden sm:inline">
          <DueBadge iso={due} done={task.done} />
        </span>
        {!task.done && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-lg px-3.5">
                Snooze
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Remind me again in</DropdownMenuLabel>
              {[1, 3, 7].map((d) => (
                <DropdownMenuItem
                  key={d}
                  onClick={() => {
                    snoozeTask(task.id, d);
                    toast(`Snoozed ${d === 7 ? "1 week" : `${d} day${d > 1 ? "s" : ""}`}`, { description: task.title });
                  }}
                >
                  {d === 7 ? "1 week" : `${d} day${d > 1 ? "s" : ""}`}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {task.lotteryId && (
              <>
                <DropdownMenuItem asChild>
                  <Link to={`/lottery/${task.lotteryId}`}>View lottery</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`https://housingconnect.nyc.gov/PublicWeb/details/${task.lotteryId}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open on Housing Connect
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete alert
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
