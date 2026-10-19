import { ITaskModel } from "../model";
const DAY_MS = 86_400_000;

const dayKey = (d: Date | string) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

const diffDays = (a: number, b: number) => Math.round((a - b) / DAY_MS);

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

export function occursOn(task: ITaskModel, date: Date): boolean {
  const rule = task.rule;
  if (!rule?.start_date) return false;

  const day = dayKey(date);
  const start = dayKey(rule.start_date);
  const repeat = rule.repeat;
  const mode = repeat?.mode ?? "none";

  if (day < start) return false;   
  if (day === start) return true; 

  const untilRaw = repeat?.until;
  const until = untilRaw ? dayKey(untilRaw) : null;
  if (until !== null && day > until) return false; 

  const every = Math.max(1, repeat?.every ?? 1);
  const d = new Date(day);
  const s = new Date(start);

  switch (mode) {
    case "none": {
      if (rule.end_date && day <= dayKey(rule.end_date)) return true;
      return until !== null;
    }

    case "day":
      return diffDays(day, start) % every === 0;

    case "week": {
      const weekdays = repeat.days?.length ? repeat.days : [s.getDay()];
      if (!weekdays.includes(d.getDay())) return false;
      const weekIndex = Math.floor(
        (diffDays(day - d.getDay() * DAY_MS, start - s.getDay() * DAY_MS)) / 7,
      );
      return weekIndex % every === 0;
    }

    case "month": {
      const monthDiff =
        d.getFullYear() * 12 + d.getMonth() - (s.getFullYear() * 12 + s.getMonth());
      if (monthDiff % every !== 0) return false;
      const dates = repeat.dates?.length ? repeat.dates : [s.getDate()];
      const last = daysInMonth(d.getFullYear(), d.getMonth());
      return dates.some((n: number) => Math.min(n, last) === d.getDate());
    }
    case "specific":
      return !!repeat.specificDays?.some((x: string | Date) => dayKey(x) === day);

    default:
      return false;
  }
}