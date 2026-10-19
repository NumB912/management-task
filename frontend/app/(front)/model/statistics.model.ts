export type StatisticsRange = "week" | "month";
export interface StatisticsQuery {
  range: StatisticsRange;
  date: string;
  utcOffsetMinutes: number;
}
export interface StatisticsPeriod {
  range: StatisticsRange;
  start: string;
  endExclusive: string;
  utcOffsetMinutes: number;
  daysInRange: number;
}
export interface TaskStatistics {
  period: StatisticsPeriod;
  summary: {
    totalTasks: number;
    completedTasks: number;
    incompleteTasks: number;
    pendingTasks: number;
    wontDoTasks: number;
    overdueTasks: number;
    completedOnTime: number;
    completedLate: number;
    completedWithoutDeadline: number;
    completedUnknownTime: number;
    completedInRange: number;
    completionRate: number;
    averageCompletedPerDay: number;
    averageCompletionHours: number | null;
  };
  daily: {
    date: string;
    totalTasks: number;
    completedTasks: number;
    incompleteTasks: number;
    completedInRange: number;
  }[];
  byPriority: {
    priority: number;
    totalTasks: number;
    completedTasks: number;
    incompleteTasks: number;
  }[];
}
export interface PomodoroStatistics {
  period: StatisticsPeriod;
  summary: {
    totalSessions: number;
    totalTasks: number;
    totalFocusMinutes: number;
    totalPauseMinutes: number;
    averageFocusMinutesPerSession: number;
    averageFocusMinutesPerDay: number;
    activeDays: number;
    bestDay: string | null;
  };
  daily: {
    date: string;
    sessions: number;
    focusMinutes: number;
    pauseMinutes: number;
  }[];
  byTask: {
    taskId: string | null;
    taskName: string | null;
    sessions: number;
    focusMinutes: number;
    pauseMinutes: number;
    totalMinutes: number;
  }[];
}
