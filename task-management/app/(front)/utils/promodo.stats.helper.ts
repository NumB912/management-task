
import { IPomodoroModel } from "../model/pomodoro.model";

const WEEKDAY_NAMES = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function toDateKey(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type ChartPoint = { label: string; focusMinutes: number; sessions: number };
export function calculateTodayChartData(sessions: IPomodoroModel[]): ChartPoint[] {
  const timeSlots = [
    { label: "08:00", hourStart: 0, hourEnd: 9 },
    { label: "10:00", hourStart: 9, hourEnd: 11 },
    { label: "12:00", hourStart: 11, hourEnd: 13 },
    { label: "14:00", hourStart: 13, hourEnd: 15 },
    { label: "16:00", hourStart: 15, hourEnd: 17 },
    { label: "18:00", hourStart: 17, hourEnd: 19 },
    { label: "20:00", hourStart: 19, hourEnd: 24 },
  ];

  return timeSlots.map((slot) => {
    const slotSessions = sessions.filter((s) => {
      const h = new Date(s.start).getHours();
      return h >= slot.hourStart && h < slot.hourEnd;
    });
    return {
      label: slot.label,
      focusMinutes: slotSessions.reduce((sum, s) => sum + getSessionFocusMinutes(s), 0),
      sessions: slotSessions.length,
    };
  });
}

export function calculateDailyChartData(
  sessions: IPomodoroModel[],
  days: number,
  labelMode: "weekday" | "date"
): ChartPoint[] {
  const now = new Date();
  const buckets = new Map<string, ChartPoint>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const label =
      labelMode === "weekday"
        ? WEEKDAY_SHORT[d.getDay()]
        : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(toDateKey(d), { label, focusMinutes: 0, sessions: 0 });
  }

  sessions.forEach((s) => {
    const bucket = buckets.get(toDateKey(s.start));
    if (bucket) {
      bucket.focusMinutes += getSessionFocusMinutes(s);
      bucket.sessions += 1;
    }
  });

  return Array.from(buckets.values());
}

export function calculateChartData(sessions: IPomodoroModel[], timeRange: TimeRange): ChartPoint[] {
  switch (timeRange) {
    case "today":
      return calculateTodayChartData(sessions);
    case "week":
      return calculateDailyChartData(sessions, 7, "weekday");
    case "month":
      return calculateDailyChartData(sessions, 30, "date");
  }
}

export function calculateStreakDays(sessions: IPomodoroModel[]): number {
  const activeDays = new Set(sessions.map((s) => toDateKey(s.start)));
  const now = new Date();
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!activeDays.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (activeDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function calculateBestDay(sessions: IPomodoroModel[]): string {
  const totals = new Array<number>(7).fill(0);

  sessions.forEach((s) => {
    totals[new Date(s.start).getDay()] += getSessionFocusMinutes(s);
  });

  const max = Math.max(...totals);
  if (max <= 0) return "Chưa có";
  return WEEKDAY_NAMES[totals.indexOf(max)];
}
