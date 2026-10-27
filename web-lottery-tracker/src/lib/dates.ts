export const DAY = 86_400_000;

export const fmtDate = (iso: string | Date, opts: Intl.DateTimeFormatOptions = {}) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", ...opts });

export const fmtTime = (iso: string | Date) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const fmtDateTime = (iso: string | Date) => `${fmtDate(iso)} at ${fmtTime(iso)}`;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Whole calendar days from today to the date (negative = past). */
export const daysUntil = (iso: string) =>
  Math.round((startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime()) / DAY);

export const relativeDue = (iso: string) => {
  const d = daysUntil(iso);
  if (d < 0) return d === -1 ? "1 day overdue" : `${-d} days overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "1 day left";
  if (d <= 14) return `${d} days left`;
  return `Due ${fmtDate(iso, { year: undefined })}`;
};

/** yyyy-mm-dd for date inputs (local). */
export const toInputDate = (d: Date) => {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
