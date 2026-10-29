import { effectiveDue, type Task } from "./store";

const icsDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

/** Downloads open alerts as an .ics file with a reminder 1 day before each. */
export function downloadIcs(tasks: Task[]) {
  const open = tasks.filter((t) => !t.done);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NYC Lottery Tracker//EN",
    "CALSCALE:GREGORIAN",
    ...open.flatMap((t) => {
      const due = effectiveDue(t);
      const start = icsDate(due);
      const end = icsDate(new Date(new Date(due).getTime() + 30 * 60 * 1000).toISOString());
      const summary = t.lotteryName ? `${t.title} – ${t.lotteryName}` : t.title;
      return [
        "BEGIN:VEVENT",
        `UID:${t.id}@lottery-tracker`,
        `DTSTAMP:${icsDate(new Date().toISOString())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${esc(summary)}`,
        t.lotteryId ? `URL:https://housingconnect.nyc.gov/PublicWeb/details/${t.lotteryId}` : "",
        "BEGIN:VALARM",
        "TRIGGER:-P1D",
        "ACTION:DISPLAY",
        `DESCRIPTION:${esc(summary)}`,
        "END:VALARM",
        "END:VEVENT",
      ].filter(Boolean);
    }),
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "housing-lottery-alerts.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const notificationsSupported = () => typeof window !== "undefined" && "Notification" in window;
