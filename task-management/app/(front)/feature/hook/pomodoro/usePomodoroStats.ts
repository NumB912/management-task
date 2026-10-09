import { ITaskModel } from "@/app/(front)/model";
import { IPomodoroModel } from "@/app/(front)/model/pomodoro.model";
import { useCallback, useMemo, useState } from "react";

export type TimeRange = "today" | "week" | "month";
export type TimeOfDayPeriod = "morning" | "afternoon" | "evening" | "night";

export interface TimeOfDayStats {
  period: TimeOfDayPeriod;
  label: string;
  timeRange: string;
  icon: "sunrise" | "sun" | "sunset" | "moon";
  focusMinutes: number;
  totalHoursFormatted: string;
  sessionsCount: number;
  percentage: number;
  efficiency: number;
  isPeak: boolean;
  color: string;
}

export interface HourlyFocusPoint {
  hour: number;
  hourLabel: string;
  period: TimeOfDayPeriod;
  focusMinutes: number;
  sessionsCount: number;
}

export interface DayTimelineSession {
  id: string;
  task?: Pick<ITaskModel, "id" | "name">;
  startTime: Date;
  endTime: Date;
  startLabel: string;
  endLabel: string;
  period: TimeOfDayPeriod;
  periodLabel: string;
  focusMinutes: number;
  pauseSeconds: number;
  pauseCount: number;
  efficiency: number;
  startPercent: number;
  widthPercent: number;
  progress: { startPause: Date; duration: number }[];
}

export interface DayTimelineSummary {
  date: Date;
  dateKey: string;
  dateDisplay: string;
  totalFocusMinutes: number;
  totalFocusHours: string;
  totalSessions: number;
  totalPauseMinutes: number;
  efficiency: number;
  peakPeriod: string;
  sessions: DayTimelineSession[];
  timeOfDayStats: TimeOfDayStats[];
  hourlyDistribution: HourlyFocusPoint[];
}

export interface ChartPoint {
  label: string;
  focusMinutes: number;
  sessions: number;
}

export interface PomodoroStatsSummary {
  timeRange: TimeRange;
  totalFocusMinutes: number;
  totalFocusHours: string;
  totalSessions: number;
  totalPauseMinutes: number;
  averagePauseMinutes: number;
  streakDays: number;
  focusEfficiency: number;
  dailyGoalSessions: number;
  goalCompletionRate: number;
  chartData: ChartPoint[];
  timeOfDayStats: TimeOfDayStats[];
  hourlyDistribution: HourlyFocusPoint[];
  productivityInsight: {
    goldenHour: string;
    bestDay: string;
    averageSessionMinutes: number;
    message: string;
  };
}

export interface OverallTimelineData {
  totalFocusMinutes: number;
  totalFocusHours: string;
  totalSessions: number;
  totalPauseMinutes: number;
  efficiency: number;
  peakPeriod: string;
  timeOfDayStats: TimeOfDayStats[];
  days: DayTimelineSummary[];
}
const WEEKDAY_NAMES = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function daysAgo(days: number, h = 9, m = 0, s = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, s, 0);
  return d;
}

export function todayAt(h: number, m: number, s = 0): Date {
  return daysAgo(0, h, m, s);
}

const toMs = (d: Date | string) => new Date(d).getTime();

export function toDateKey(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatHours(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function calcEfficiency(focusMinutes: number, pauseMinutes: number): number {
  const gross = focusMinutes + pauseMinutes;
  return gross > 0 ? Math.round((focusMinutes / gross) * 100) : 100;
}

function getRangeStart(range: TimeRange, now = new Date()): Date {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "week") start.setDate(start.getDate() - 6);
  if (range === "month") start.setDate(start.getDate() - 29);
  return start;
}

export function filterSessionsByRange(sessions: IPomodoroModel[], range: TimeRange): IPomodoroModel[] {
  const startMs = getRangeStart(range).getTime();
  return sessions.filter((s) => toMs(s.start) >= startMs);
}



export function getSessionFocusMinutes(session: IPomodoroModel): number {
  const total = (session.progress ?? []).reduce((sum, cur) => sum + cur.duration, 0);
  return Math.round(total / 60000);
}

export function getSessionPauseSeconds(session: IPomodoroModel): number {
  const progress = session.progress ?? [];
  if (!progress.length) return 0;

  const first = progress[0];
  const last = progress[progress.length - 1];
  const durationTotals = progress.reduce((sum, cur) => sum + cur.duration, 0);

  const pauseMs = toMs(last.startPause) - toMs(first.startPause) - durationTotals + last.duration;
  return Math.max(0, pauseMs / 1000);
}


export function getTimeOfDayPeriod(date: Date | string): TimeOfDayPeriod {
  const hour = new Date(date).getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
}

export function getTimeOfDayPeriodLabel(period: TimeOfDayPeriod): string {
  switch (period) {
    case "morning":
      return "Sáng";
    case "afternoon":
      return "Chiều";
    case "evening":
      return "Tối";
    case "night":
      return "Đêm";
  }
}

const PERIOD_CONFIGS: Record<
  TimeOfDayPeriod,
  { label: string; timeRange: string; icon: TimeOfDayStats["icon"]; color: string }
> = {
  morning: { label: "Buổi sáng", timeRange: "06:00 - 12:00", icon: "sunrise", color: "#f59e0b" },
  afternoon: { label: "Buổi chiều", timeRange: "12:00 - 18:00", icon: "sun", color: "#3b82f6" },
  evening: { label: "Buổi tối", timeRange: "18:00 - 23:00", icon: "sunset", color: "#8b5cf6" },
  night: { label: "Ban đêm", timeRange: "23:00 - 06:00", icon: "moon", color: "#06b6d4" },
};

export function calculateTimeOfDayStats(sessions: IPomodoroModel[]): TimeOfDayStats[] {
  const periods: TimeOfDayPeriod[] = ["morning", "afternoon", "evening", "night"];
  const buckets = Object.fromEntries(
    periods.map((p) => [p, { focusMinutes: 0, sessionsCount: 0, pauseSeconds: 0 }])
  ) as Record<TimeOfDayPeriod, { focusMinutes: number; sessionsCount: number; pauseSeconds: number }>;

  sessions.forEach((s) => {
    const b = buckets[getTimeOfDayPeriod(s.start)];
    b.focusMinutes += getSessionFocusMinutes(s);
    b.sessionsCount += 1;
    b.pauseSeconds += getSessionPauseSeconds(s);
  });

  const totalAll = periods.reduce((sum, p) => sum + buckets[p].focusMinutes, 0);
  const maxMinutes = Math.max(...periods.map((p) => buckets[p].focusMinutes));

  return periods.map((period) => {
    const config = PERIOD_CONFIGS[period];
    const data = buckets[period];
    return {
      period,
      label: config.label,
      timeRange: config.timeRange,
      icon: config.icon,
      color: config.color,
      focusMinutes: data.focusMinutes,
      totalHoursFormatted: formatHours(data.focusMinutes),
      sessionsCount: data.sessionsCount,
      percentage: totalAll > 0 ? Math.round((data.focusMinutes / totalAll) * 100) : 0,
      efficiency: calcEfficiency(data.focusMinutes, Math.round(data.pauseSeconds / 60)),
      isPeak: maxMinutes > 0 && data.focusMinutes === maxMinutes,
    };
  });
}

export function calculateHourlyDistribution(sessions: IPomodoroModel[]): HourlyFocusPoint[] {
  const buckets: HourlyFocusPoint[] = Array.from({ length: 24 }, (_, hour) => {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return {
      hour,
      hourLabel: `${String(hour).padStart(2, "0")}:00`,
      period: getTimeOfDayPeriod(d),
      focusMinutes: 0,
      sessionsCount: 0,
    };
  });

  sessions.forEach((s) => {
    const h = new Date(s.start).getHours();
    buckets[h].focusMinutes += getSessionFocusMinutes(s);
    buckets[h].sessionsCount += 1;
  });

  return buckets;
}


function calculateTodayChartData(sessions: IPomodoroModel[]): ChartPoint[] {
  const slots = [
    { label: "08:00", from: 0, to: 9 },
    { label: "10:00", from: 9, to: 11 },
    { label: "12:00", from: 11, to: 13 },
    { label: "14:00", from: 13, to: 15 },
    { label: "16:00", from: 15, to: 17 },
    { label: "18:00", from: 17, to: 19 },
    { label: "20:00", from: 19, to: 24 },
  ];

  return slots.map((slot) => {
    const inSlot = sessions.filter((s) => {
      const h = new Date(s.start).getHours();
      return h >= slot.from && h < slot.to;
    });
    return {
      label: slot.label,
      focusMinutes: inSlot.reduce((sum, s) => sum + getSessionFocusMinutes(s), 0),
      sessions: inSlot.length,
    };
  });
}

function calculateDailyChartData(
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
    const b = buckets.get(toDateKey(s.start));
    if (b) {
      b.focusMinutes += getSessionFocusMinutes(s);
      b.sessions += 1;
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

  if (!activeDays.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

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
  return max > 0 ? WEEKDAY_NAMES[totals.indexOf(max)] : "Chưa có";
}

export function calculatePomodoroStats(
  sessions: IPomodoroModel[],
  timeRange: TimeRange = "week",
  allSessions: IPomodoroModel[] = sessions
): PomodoroStatsSummary {
  let totalFocusMinutes = 0;
  let totalPauseSeconds = 0;

  sessions.forEach((s) => {
    totalFocusMinutes += getSessionFocusMinutes(s);
    totalPauseSeconds += getSessionPauseSeconds(s);
  });

  const totalPauseMinutes = Math.round(totalPauseSeconds / 60);
  const totalSessions = sessions.length;
  const averagePauseMinutes =
    totalSessions > 0 ? Math.round((totalPauseMinutes / totalSessions) * 10) / 10 : 0;

  const dailyGoalSessions = timeRange === "today" ? 8 : timeRange === "week" ? 40 : 160;
  const goalCompletionRate = Math.min(Math.round((totalSessions / dailyGoalSessions) * 100), 100);

  const timeOfDayStats = calculateTimeOfDayStats(sessions);
  const peak = timeOfDayStats.find((p) => p.isPeak);
  const hasPeak = !!peak && peak.focusMinutes > 0;

  return {
    timeRange,
    totalFocusMinutes,
    totalFocusHours: formatHours(totalFocusMinutes),
    totalSessions,
    totalPauseMinutes,
    averagePauseMinutes,
    streakDays: calculateStreakDays(allSessions),
    focusEfficiency: calcEfficiency(totalFocusMinutes, totalPauseMinutes),
    dailyGoalSessions,
    goalCompletionRate,
    chartData: calculateChartData(sessions, timeRange),
    timeOfDayStats,
    hourlyDistribution: calculateHourlyDistribution(sessions),
    productivityInsight: {
      goldenHour: hasPeak ? `${peak!.label} (${peak!.timeRange})` : "Chưa có",
      bestDay: calculateBestDay(sessions),
      averageSessionMinutes: totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0,
      message: hasPeak
        ? `Bạn tập trung hiệu quả nhất vào ${peak!.label.toLowerCase()} (${peak!.totalHoursFormatted}), chiếm ${peak!.percentage}% tổng thời gian làm việc.`
        : "Chưa có đủ dữ liệu để phân tích thời điểm tập trung tốt nhất.",
    },
  };
}

/* ============================================================
 * Timeline
 * ============================================================ */

export function getDayTimelineData(
  sessions: IPomodoroModel[],
  targetDate: Date = new Date()
): DayTimelineSummary {
  const targetKey = toDateKey(targetDate);

  const daySessions = sessions
    .filter((s) => toDateKey(s.start) === targetKey)
    .sort((a, b) => toMs(a.start) - toMs(b.start));

  const timelineSessions: DayTimelineSession[] = daySessions.map((s) => {
    const progress = s.progress ?? [];
    const startTime = new Date(s.start);
    const focusMins = getSessionFocusMinutes(s);
    const pauseSeconds = getSessionPauseSeconds(s);
    const pauseCount = Math.max(0, progress.length - 1);
    const lastEntry = progress[progress.length - 1];
    const endTime = lastEntry
      ? new Date(toMs(lastEntry.startPause) + lastEntry.duration)
      : new Date(startTime.getTime() + 5 * 60 * 1000);
    const period = getTimeOfDayPeriod(startTime);
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const durationMinutes = Math.max(Math.round((endTime.getTime() - startTime.getTime()) / 60000), focusMins);
    const startPercent = Math.max(0, Math.min(100, (startMinutes / 1440) * 100));
    const widthPercent = Math.max(2, Math.min(100 - startPercent, (durationMinutes / 1440) * 100));
    const gross = focusMins * 60 + pauseSeconds;
    const efficiency = gross > 0 ? Math.round(((focusMins * 60) / gross) * 100) : 100;
    const timeFmt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    return {
      id: s.id,
      task: s.task ? { id: s.task.id, name: s.task.name } : undefined,
      startTime,
      endTime,
      startLabel: startTime.toLocaleTimeString("vi-VN", timeFmt),
      endLabel: endTime.toLocaleTimeString("vi-VN", timeFmt),
      period,
      periodLabel: getTimeOfDayPeriodLabel(period),
      focusMinutes: focusMins,
      pauseSeconds,
      pauseCount,
      efficiency,
      startPercent,
      widthPercent,
      progress,
    };
  });

  const totalFocusMinutes = timelineSessions.reduce((sum, s) => sum + s.focusMinutes, 0);
  const totalPauseSeconds = timelineSessions.reduce((sum, s) => sum + s.pauseSeconds, 0);
  const totalPauseMinutes = Math.round(totalPauseSeconds / 60);
  const timeOfDayStats = calculateTimeOfDayStats(daySessions);
  const peak = timeOfDayStats.find((p) => p.isPeak);

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekdayName = targetDate.toLocaleDateString("vi-VN", { weekday: "long" });
  const dayMonth = targetDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  let dateDisplay = `${weekdayName}, ${dayMonth}`;
  if (targetKey === toDateKey(now)) dateDisplay = `Hôm nay · ${dateDisplay}`;
  else if (targetKey === toDateKey(yesterday)) dateDisplay = `Hôm qua · ${dateDisplay}`;

  return {
    date: targetDate,
    dateKey: targetKey,
    dateDisplay,
    totalFocusMinutes,
    totalFocusHours: formatHours(totalFocusMinutes),
    totalSessions: timelineSessions.length,
    totalPauseMinutes,
    efficiency: calcEfficiency(totalFocusMinutes, totalPauseMinutes),
    peakPeriod: peak && peak.focusMinutes > 0 ? `${peak.label} (${peak.totalHoursFormatted})` : "Chưa có",
    sessions: timelineSessions,
    timeOfDayStats,
    hourlyDistribution: calculateHourlyDistribution(daySessions),
  };
}

export function getGroupedTimelineData(sessions: IPomodoroModel[]): OverallTimelineData {
  const dateMap = new Map<string, Date>();

  const today = new Date();
  dateMap.set(toDateKey(today), new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  sessions.forEach((s) => {
    const d = new Date(s.start);
    const key = toDateKey(d);
    if (!dateMap.has(key)) dateMap.set(key, new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  });

  const days = Array.from(dateMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, d]) => getDayTimelineData(sessions, d));

  let totalFocusMinutes = 0;
  let totalPauseSeconds = 0;
  sessions.forEach((s) => {
    totalFocusMinutes += getSessionFocusMinutes(s);
    totalPauseSeconds += getSessionPauseSeconds(s);
  });
  const totalPauseMinutes = Math.round(totalPauseSeconds / 60);

  const timeOfDayStats = calculateTimeOfDayStats(sessions);
  const peak = timeOfDayStats.find((p) => p.isPeak);

  return {
    totalFocusMinutes,
    totalFocusHours: formatHours(totalFocusMinutes),
    totalSessions: sessions.length,
    totalPauseMinutes,
    efficiency: calcEfficiency(totalFocusMinutes, totalPauseMinutes),
    peakPeriod: peak && peak.focusMinutes > 0 ? `${peak.label} (${peak.totalHoursFormatted})` : "Chưa có",
    timeOfDayStats,
    days,
  };
}

interface usePomodoroStatsOptions {
  initialRange?: TimeRange;
  initialDate?: Date;
}

export function usePomodoroStats(
  sessions: IPomodoroModel[] = [],
  { initialRange = "week", initialDate }: usePomodoroStatsOptions = {}
) {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);
  const [selectedDate, setSelectedDate] = useState<Date>(() => initialDate ?? new Date());

  const filteredSessions = useMemo(
    () => filterSessionsByRange(sessions, timeRange),
    [sessions, timeRange]
  );

  const stats = useMemo(
    () => calculatePomodoroStats(filteredSessions, timeRange, sessions),
    [filteredSessions, timeRange, sessions]
  );

  const dayTimeline = useMemo(
    () => getDayTimelineData(sessions, selectedDate),
    [sessions, selectedDate]
  );

  const groupedTimeline = useMemo(() => getGroupedTimelineData(sessions), [sessions]);

  const shiftDay = useCallback((delta: number) => {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }, []);

  const goToPrevDay = useCallback(() => shiftDay(-1), [shiftDay]);
  const goToNextDay = useCallback(() => shiftDay(1), [shiftDay]);
  const goToToday = useCallback(() => setSelectedDate(new Date()), []);

  return {
    timeRange,
    setTimeRange,
    selectedDate,
    setSelectedDate,
    stats,
    dayTimeline,
    groupedTimeline,
    filteredSessions,
    goToPrevDay,
    goToNextDay,
    goToToday,
  };
}