import { ITaskModel } from "../../model";
import { IPromodoroModel } from "../../model/promodo.model";


export function daysAgo(days: number, h = 9, m = 0, s = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, s, 0);
  return d;
}

export function todayAt(h: number, m: number, s = 0): Date {
  return daysAgo(0, h, m, s);
}

export interface ExtendedPomodoro extends IPromodoroModel {
  targetMinutes?: number;
  category?: string;
}
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
  task?: Pick<ITaskModel,"id"|"name">;
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
  progress: {
    startPause: Date;
    duration: number;
  }[];
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
  chartData: {
    label: string;
    focusMinutes: number;
    sessions: number;
  }[];
  timeOfDayStats: TimeOfDayStats[];
  hourlyDistribution: HourlyFocusPoint[];
  productivityInsight: {
    goldenHour: string;
    bestDay: string;
    averageSessionMinutes: number;
    message: string;
  };
}

const TASK_COLORS = [
  "var(--color-primary, #6366f1)",
  "var(--color-chart-1, #8b5cf6)",
  "var(--color-chart-2, #ec4899)",
  "var(--color-chart-3, #f59e0b)",
  "var(--color-chart-4, #10b981)",
  "var(--color-chart-5, #06b6d4)",
];
export function getSessionFocusMinutes(session: IPromodoroModel): number {
  return Math.round(session.progress.reduce((prev,cur)=>(prev+cur.duration),0)/(1000*60))
}
export function getSessionPauseSeconds(session: IPromodoroModel): number {
  const last = session.progress?.at(-1);
  const first = session.progress.at(0)
  if (!session.progress?.length || !session.start || !last?.startPause ||!first) {
    return 0;
  }

  const startPauseLast = last.startPause instanceof Date
    ? last.startPause.getTime()
    : new Date(last.startPause).getTime();
      const startPauseFirst = first.startPause instanceof Date
    ? first.startPause.getTime()
    : new Date(first.startPause).getTime();
  const durationTotals = session.progress.reduce((prev, cur) => prev + cur.duration, 0);
  const pauseMs = startPauseLast - startPauseFirst-durationTotals+last.duration;
return pauseMs/1000;
}
export function calculatePomodoroStats(
  sessions: IPromodoroModel[],
  timeRange: TimeRange = "week"
): PomodoroStatsSummary {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  let filteredSessions = sessions;
  let totalFocusMinutes = 0;
  let totalPauseSeconds = 0;

  filteredSessions.forEach((s) => {
    totalFocusMinutes += getSessionFocusMinutes(s);
    totalPauseSeconds += getSessionPauseSeconds(s);
  });

  const totalPauseMinutes = Math.round(totalPauseSeconds / 60);
  const totalGrossMinutes = totalFocusMinutes + totalPauseMinutes;
  const focusEfficiency =
    totalGrossMinutes > 0
      ? Math.round((totalFocusMinutes / totalGrossMinutes) * 100)
      : 100;

  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  const totalFocusHours = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const totalSessions = filteredSessions.length;
  const averagePauseMinutes =
    totalSessions > 0
      ? Math.round((totalPauseMinutes / totalSessions) * 10) / 10
      : 0;

  const dailyGoalSessions = timeRange === "today" ? 8 : timeRange === "week" ? 40 : 160;
  const goalCompletionRate = Math.min(
    Math.round((totalSessions / dailyGoalSessions) * 100),
    100
  );

  let chartData: { label: string; focusMinutes: number; sessions: number }[] = [];

  if (timeRange === "today") {
    const timeSlots = [
      { label: "08:00", hourStart: 8, hourEnd: 9 },
      { label: "10:00", hourStart: 9, hourEnd: 11 },
      { label: "12:00", hourStart: 11, hourEnd: 13 },
      { label: "14:00", hourStart: 13, hourEnd: 15 },
      { label: "16:00", hourStart: 15, hourEnd: 17 },
      { label: "18:00", hourStart: 17, hourEnd: 19 },
      { label: "20:00", hourStart: 19, hourEnd: 24 },
    ];

    chartData = timeSlots.map((slot) => {
      const slotSessions = filteredSessions.filter((s) => {
        const h = new Date(s.start).getHours();
        return h >= slot.hourStart && h < slot.hourEnd;
      });
      const mins = slotSessions.reduce((sum, s) => sum + getSessionFocusMinutes(s), 0);
      return {
        label: slot.label,
        focusMinutes: mins,
        sessions: slotSessions.length,
      };
    });
  } 


 
  const streakDays = 5;
  const timeOfDayStats = calculateTimeOfDayStats(filteredSessions);
  const hourlyDistribution = calculateHourlyDistribution(filteredSessions);

  const peakPeriod = timeOfDayStats.find((p) => p.isPeak);
  const goldenHourText = peakPeriod
    ? `${peakPeriod.label} (${peakPeriod.timeRange})`
    : "09:00 - 11:00 sáng";

  return {
    timeRange,
    totalFocusMinutes,
    totalFocusHours,
    totalSessions,
    totalPauseMinutes,
    averagePauseMinutes,
    streakDays,
    focusEfficiency,
    dailyGoalSessions,
    goalCompletionRate,
    chartData,
    timeOfDayStats,
    hourlyDistribution,
    productivityInsight: {
      goldenHour: goldenHourText,
      bestDay: "Thứ Tư",
      averageSessionMinutes: totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 5,
      message: peakPeriod && peakPeriod.focusMinutes > 0
        ? `Bạn tập trung hiệu quả nhất vào ${peakPeriod.label.toLowerCase()} (${peakPeriod.totalHoursFormatted}), chiếm ${peakPeriod.percentage}% tổng thời gian làm việc.`
        : "Bạn đạt đỉnh tập trung cao nhất vào khoảng 09:00 - 11:00. Tỷ lệ hoàn thành phiên không gián đoạn đạt 85%!",
    },
  };
}

export function getTimeOfDayPeriod(date: Date | string): TimeOfDayPeriod {
  const d = new Date(date);
  const hour = d.getHours();
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


export function calculateTimeOfDayStats(sessions: IPromodoroModel[]): TimeOfDayStats[] {
  const periodConfigs: Record<
    TimeOfDayPeriod,
    { label: string; timeRange: string; icon: "sunrise" | "sun" | "sunset" | "moon"; color: string }
  > = {
    morning: { label: "Buổi sáng", timeRange: "06:00 - 12:00", icon: "sunrise", color: "#f59e0b" },
    afternoon: { label: "Buổi chiều", timeRange: "12:00 - 18:00", icon: "sun", color: "#3b82f6" },
    evening: { label: "Buổi tối", timeRange: "18:00 - 23:00", icon: "sunset", color: "#8b5cf6" },
    night: { label: "Ban đêm", timeRange: "23:00 - 06:00", icon: "moon", color: "#06b6d4" },
  };

  const buckets: Record<TimeOfDayPeriod, { focusMinutes: number; sessionsCount: number; pauseSeconds: number }> = {
    morning: { focusMinutes: 0, sessionsCount: 0, pauseSeconds: 0 },
    afternoon: { focusMinutes: 0, sessionsCount: 0, pauseSeconds: 0 },
    evening: { focusMinutes: 0, sessionsCount: 0, pauseSeconds: 0 },
    night: { focusMinutes: 0, sessionsCount: 0, pauseSeconds: 0 },
  };

  sessions.forEach((s) => {
    const period = getTimeOfDayPeriod(s.start);
    const focusMins = getSessionFocusMinutes(s);
    const pauseSecs = getSessionPauseSeconds(s);

    buckets[period].focusMinutes += focusMins;
    buckets[period].sessionsCount += 1;
    buckets[period].pauseSeconds += pauseSecs;
  });

  const totalAllMinutes = Object.values(buckets).reduce((sum, b) => sum + b.focusMinutes, 0);
  const maxMinutes = Math.max(...Object.values(buckets).map((b) => b.focusMinutes));

  return (["morning", "afternoon", "evening", "night"] as TimeOfDayPeriod[]).map((period) => {
    const config = periodConfigs[period];
    const data = buckets[period];
    const hours = Math.floor(data.focusMinutes / 60);
    const mins = data.focusMinutes % 60;
    const totalHoursFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    const percentage = totalAllMinutes > 0 ? Math.round((data.focusMinutes / totalAllMinutes) * 100) : 0;
    const grossMinutes = data.focusMinutes + Math.round(data.pauseSeconds / 60);
    const efficiency = grossMinutes > 0 ? Math.round((data.focusMinutes / grossMinutes) * 100) : 100;

    return {
      period,
      label: config.label,
      timeRange: config.timeRange,
      icon: config.icon,
      color: config.color,
      focusMinutes: data.focusMinutes,
      totalHoursFormatted,
      sessionsCount: data.sessionsCount,
      percentage,
      efficiency,
      isPeak: maxMinutes > 0 && data.focusMinutes === maxMinutes,
    };
  });
}

export function calculateHourlyDistribution(sessions: IPromodoroModel[]): HourlyFocusPoint[] {
  const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => {
    const hourDate = new Date();
    hourDate.setHours(hour, 0, 0, 0);
    return {
      hour,
      hourLabel: `${hour < 10 ? "0" + hour : hour}:00`,
      period: getTimeOfDayPeriod(hourDate),
      focusMinutes: 0,
      sessionsCount: 0,
    };
  });

  sessions.forEach((s) => {
    const startHour = new Date(s.start).getHours();
    if (startHour >= 0 && startHour < 24) {
      hourlyBuckets[startHour].focusMinutes += getSessionFocusMinutes(s);
      hourlyBuckets[startHour].sessionsCount += 1;
    }
  });

  return hourlyBuckets;
}

export function getDayTimelineData(sessions: IPromodoroModel[], targetDate: Date = new Date()): DayTimelineSummary {
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  const daySessions = sessions
    .filter((s) => {
      const d = new Date(s.start);
      return d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() === targetDay;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const timelineSessions: DayTimelineSession[] = daySessions.map((s) => {
    const startTime = new Date(s.start);
    const focusMins = getSessionFocusMinutes(s);
    const pauseSeconds = getSessionPauseSeconds(s);
    const pauseCount = (s.progress ?? []).length-1;
    const lastEntry = s.progress[s.progress.length - 1];
    const endTime = lastEntry
  ? new Date(new Date(lastEntry.startPause).getTime() + lastEntry.duration)
  : new Date(new Date(s.start).getTime() + 5 * 60 * 1000);
    const period = getTimeOfDayPeriod(startTime);
    const periodLabel = getTimeOfDayPeriodLabel(period);
    const startMinutesFromMidnight = startTime.getHours() * 60 + startTime.getMinutes();
    const durationMinutes = Math.max(
      Math.round((endTime.getTime() - startTime.getTime()) / 60000),
      focusMins
    );

    const startPercent = Math.max(0, Math.min(100, (startMinutesFromMidnight / 1440) * 100));
    const widthPercent = Math.max(2.0, Math.min(100 - startPercent, (durationMinutes / 1440) * 100));

    const totalGrossSeconds = focusMins * 60 + pauseSeconds;
    const efficiency = totalGrossSeconds > 0 ? Math.round(((focusMins * 60) / totalGrossSeconds) * 100) : 100;

    const startLabel = startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const endLabel = endTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    return {
      id: s.id,
      task: s.task ? { id: s.task.id, name: s.task.name } : undefined,
      startTime,
      endTime,
      startLabel,
      endLabel,
      period,
      periodLabel,
      focusMinutes: focusMins,
      pauseSeconds,
      pauseCount,
      efficiency,
      startPercent,
      widthPercent,
      progress: s.progress ?? [],
    };
  });

  const totalFocusMinutes = timelineSessions.reduce((sum, s) => sum + s.focusMinutes, 0);
  const totalPauseSeconds = timelineSessions.reduce((sum, s) => sum + s.pauseSeconds, 0);
  const totalPauseMinutes = Math.round(totalPauseSeconds / 60);
  const totalSessions = timelineSessions.length;

  const totalGrossMins = totalFocusMinutes + totalPauseMinutes;
  const efficiency = totalGrossMins > 0 ? Math.round((totalFocusMinutes / totalGrossMins) * 100) : 100;

  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  const totalFocusHours = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const timeOfDayStats = calculateTimeOfDayStats(daySessions);
  const hourlyDistribution = calculateHourlyDistribution(daySessions);
  const peak = timeOfDayStats.find((p) => p.isPeak);
  const peakPeriod = peak && peak.focusMinutes > 0 ? `${peak.label} (${peak.totalHoursFormatted})` : "Chưa có";
  const now = new Date();
  const isToday =
    now.getFullYear() === targetYear && now.getMonth() === targetMonth && now.getDate() === targetDay;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    yesterday.getFullYear() === targetYear &&
    yesterday.getMonth() === targetMonth &&
    yesterday.getDate() === targetDay;

  const weekdayName = targetDate.toLocaleDateString("vi-VN", { weekday: "long" });
  const dayMonth = targetDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  let dateDisplay = `${weekdayName}, ${dayMonth}`;
  if (isToday) dateDisplay = `Hôm nay · ${dateDisplay}`;
  else if (isYesterday) dateDisplay = `Hôm qua · ${dateDisplay}`;

  const dateKey = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;

  return {
    date: targetDate,
    dateKey,
    dateDisplay,
    totalFocusMinutes,
    totalFocusHours,
    totalSessions,
    totalPauseMinutes,
    efficiency,
    peakPeriod,
    sessions: timelineSessions,
    timeOfDayStats,
    hourlyDistribution,
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

export function getGroupedTimelineData(sessions: IPromodoroModel[]): OverallTimelineData {
  const dateMap = new Map<string, Date>();

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  dateMap.set(todayKey, new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  sessions.forEach((s) => {
    const d = new Date(s.start);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!dateMap.has(key)) {
      dateMap.set(key, new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    }
  });

  const sortedDates = Array.from(dateMap.entries())
    .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
    .map(([_, d]) => d);


  const days = sortedDates.map((targetDate) => getDayTimelineData(sessions, targetDate));

  let totalFocusMinutes = 0;
  let totalPauseSeconds = 0;

  sessions.forEach((s) => {
    totalFocusMinutes += getSessionFocusMinutes(s);
    totalPauseSeconds += getSessionPauseSeconds(s);
  });

  const totalPauseMinutes = Math.round(totalPauseSeconds / 60);
  const totalSessions = sessions.length;
  const totalGrossMins = totalFocusMinutes + totalPauseMinutes;
  const efficiency = totalGrossMins > 0 ? Math.round((totalFocusMinutes / totalGrossMins) * 100) : 100;

  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  const totalFocusHours = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const timeOfDayStats = calculateTimeOfDayStats(sessions);
  const peak = timeOfDayStats.find((p) => p.isPeak);
  const peakPeriod = peak && peak.focusMinutes > 0 ? `${peak.label} (${peak.totalHoursFormatted})` : "Chưa có";

  return {
    totalFocusMinutes,
    totalFocusHours,
    totalSessions,
    totalPauseMinutes,
    efficiency,
    peakPeriod,
    timeOfDayStats,
    days,
  };
}

