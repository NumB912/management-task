import { BadRequestException } from '@nestjs/common';

const DAY = 86400000;
export const round = (n: number) => Math.round(n * 100) / 100;
export function statisticsPeriod(
  query: Record<string, unknown>,
  now = new Date(),
) {
  const range = query.range ?? 'week';
  if (range !== 'week' && range !== 'month')
    throw new BadRequestException('range phải là week hoặc month');
  const offset =
    query.utcOffsetMinutes === undefined ? 420 : Number(query.utcOffsetMinutes);
  if (!Number.isInteger(offset) || offset < -720 || offset > 840)
    throw new BadRequestException(
      'utcOffsetMinutes phải là số nguyên từ -720 đến 840',
    );
  const key = (date: Date) =>
    new Date(date.getTime() + offset * 60000).toISOString().slice(0, 10);
  const date = query.date ?? key(now);
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new BadRequestException('date phải có dạng YYYY-MM-DD');
  const anchor = new Date(`${date}T00:00:00Z`);
  if (
    !Number.isFinite(anchor.getTime()) ||
    anchor.toISOString().slice(0, 10) !== date
  )
    throw new BadRequestException('date không hợp lệ');

  const startLocal = new Date(anchor);
  if (range === 'week')
    startLocal.setUTCDate(
      startLocal.getUTCDate() - ((startLocal.getUTCDay() + 6) % 7),
    );
  else startLocal.setUTCDate(1);
  const endLocal = new Date(startLocal);
  if (range === 'week') endLocal.setUTCDate(endLocal.getUTCDate() + 7);
  else endLocal.setUTCMonth(endLocal.getUTCMonth() + 1);
  const start = new Date(startLocal.getTime() - offset * 60000);
  const end = new Date(endLocal.getTime() - offset * 60000);
  const days = Array.from(
    { length: (end.getTime() - start.getTime()) / DAY },
    (_, i) => key(new Date(start.getTime() + i * DAY)),
  );
  return {
    range,
    start,
    end,
    days,
    offset,
    key,
    contains: (d?: Date | null) => !!d && d >= start && d < end,
  };
}
export type StatisticsPeriod = ReturnType<typeof statisticsPeriod>;
export const periodMetadata = (p: StatisticsPeriod) => ({
  range: p.range,
  start: p.start.toISOString(),
  endExclusive: p.end.toISOString(),
  utcOffsetMinutes: p.offset,
  daysInRange: p.days.length,
});

export interface TaskStatisticsRecord {
  created_at: Date;
  status: string;
  done_at?: Date | null;
  ruleData?: {
    end_date?: Date | null;
    start_date?: Date | null;
    endTimer?: number | null;
    timer?: number | null;
    priority?: number;
  };
}
export function taskDeadline(task: TaskStatisticsRecord, p: StatisticsPeriod) {
  const rule = task.ruleData;
  const date = rule?.end_date ?? rule?.start_date;
  if (!date) return null;
  const seconds = rule?.end_date ? rule.endTimer : rule?.timer;
  const midnight =
    new Date(`${p.key(date)}T00:00:00Z`).getTime() - p.offset * 60000;
  return new Date(midnight + (seconds == null ? DAY - 1 : seconds * 1000));
}

export function calculateTaskStatistics(
  tasks: TaskStatisticsRecord[],
  p: StatisticsPeriod,
  now = new Date(),
) {
  const summary = {
    totalTasks: 0,
    completedTasks: 0,
    incompleteTasks: 0,
    pendingTasks: 0,
    wontDoTasks: 0,
    overdueTasks: 0,
    completedOnTime: 0,
    completedLate: 0,
    completedWithoutDeadline: 0,
    completedUnknownTime: 0,
    completedInRange: 0,
    completionRate: 0,
    averageCompletedPerDay: 0,
    averageCompletionHours: null as number | null,
  };
  const daily = p.days.map((date) => ({
    date,
    totalTasks: 0,
    completedTasks: 0,
    incompleteTasks: 0,
    completedInRange: 0,
  }));
  const buckets = new Map(daily.map((d) => [d.date, d]));
  const byPriority = [1, 2, 3, 4].map((priority) => ({
    priority,
    totalTasks: 0,
    completedTasks: 0,
    incompleteTasks: 0,
  }));
  let duration = 0,
    durationCount = 0;
  for (const task of tasks) {
    const done = task.status === 'done';
    if (done && p.contains(task.done_at)) {
      summary.completedInRange++;
      buckets.get(p.key(task.done_at!))!.completedInRange++;
      if (task.done_at! >= task.created_at) {
        duration += task.done_at!.getTime() - task.created_at.getTime();
        durationCount++;
      }
    }
    const anchor =
      task.ruleData?.end_date ?? task.ruleData?.start_date ?? task.created_at;
    if (!p.contains(anchor)) continue;
    const bucket = buckets.get(p.key(anchor))!;
    const priority = byPriority.find(
      (b) => b.priority === (task.ruleData?.priority ?? 4),
    )!;
    summary.totalTasks++;
    bucket.totalTasks++;
    priority.totalTasks++;
    const deadline = taskDeadline(task, p);
    if (done) {
      summary.completedTasks++;
      bucket.completedTasks++;
      priority.completedTasks++;
      if (!deadline) summary.completedWithoutDeadline++;
      else if (!task.done_at) summary.completedUnknownTime++;
      else if (task.done_at <= deadline) summary.completedOnTime++;
      else summary.completedLate++;
    } else {
      summary.incompleteTasks++;
      bucket.incompleteTasks++;
      priority.incompleteTasks++;
      if (task.status === "won't do") summary.wontDoTasks++;
      else {
        summary.pendingTasks++;
        if (deadline && deadline < now) summary.overdueTasks++;
      }
    }
  }
  summary.completionRate = summary.totalTasks
    ? round((summary.completedTasks / summary.totalTasks) * 100)
    : 0;
  summary.averageCompletedPerDay = round(
    summary.completedInRange / p.days.length,
  );
  summary.averageCompletionHours = durationCount
    ? round(duration / durationCount / 3600000)
    : null;
  return { period: periodMetadata(p), summary, daily, byPriority };
}

export interface PomodoroStatisticsRecord {
  start: Date;
  task?: { toString(): string } | null;
  taskName?: string | null;
  progress?: { startPause: Date; duration: number }[];
}
export function calculatePomodoroStatistics(
  sessions: PomodoroStatisticsRecord[],
  p: StatisticsPeriod,
) {
  const daily = p.days.map((date) => ({
    date,
    sessions: 0,
    focusMinutes: 0,
    pauseMinutes: 0,
  }));
  const buckets = new Map(daily.map((d) => [d.date, d]));
  const byTask = new Map<
    string | null,
    {
      taskId: string | null;
      taskName: string | null;
      sessions: number;
      focusMinutes: number;
      pauseMinutes: number;
    }
  >();
  let totalSessions = 0,
    focusMs = 0,
    pauseMs = 0;
  for (const session of sessions) {
    if (!p.contains(session.start)) continue;
    const progress = session.progress ?? [];
    const focus = progress.reduce(
      (sum, entry) => sum + Math.max(0, entry.duration),
      0,
    );
    const first = progress[0],
      last = progress[progress.length - 1];
    const pause =
      first && last
        ? Math.max(
            0,
            last.startPause.getTime() +
              last.duration -
              first.startPause.getTime() -
              focus,
          )
        : 0;
    totalSessions++;
    focusMs += focus;
    pauseMs += pause;
    const bucket = buckets.get(p.key(session.start))!;
    bucket.sessions++;
    bucket.focusMinutes += focus / 60000;
    bucket.pauseMinutes += pause / 60000;
    const taskId = session.task?.toString() ?? null;
    const task = byTask.get(taskId) ?? {
      taskId,
      taskName: session.taskName ?? null,
      sessions: 0,
      focusMinutes: 0,
      pauseMinutes: 0,
    };
    task.sessions++;
    task.focusMinutes += focus / 60000;
    task.pauseMinutes += pause / 60000;
    byTask.set(taskId, task);
  }
  const activeDays = daily.filter((d) => d.focusMinutes > 0).length;
  const best = daily.reduce<(typeof daily)[number] | null>(
    (best, d) => (d.focusMinutes > (best?.focusMinutes ?? 0) ? d : best),
    null,
  );
  return {
    period: periodMetadata(p),
    summary: {
      totalSessions,
      totalTasks: [...byTask.keys()].filter((id) => id !== null).length,
      totalFocusMinutes: round(focusMs / 60000),
      totalPauseMinutes: round(pauseMs / 60000),
      averageFocusMinutesPerSession: totalSessions
        ? round(focusMs / 60000 / totalSessions)
        : 0,
      averageFocusMinutesPerDay: round(focusMs / 60000 / p.days.length),
      activeDays,
      bestDay: best?.date ?? null,
    },
    daily: daily.map((d) => ({
      ...d,
      focusMinutes: round(d.focusMinutes),
      pauseMinutes: round(d.pauseMinutes),
    })),
    byTask: [...byTask.values()]
      .sort(
        (a, b) => b.sessions - a.sessions || b.focusMinutes - a.focusMinutes,
      )
      .map((d) => ({
        ...d,
        focusMinutes: round(d.focusMinutes),
        pauseMinutes: round(d.pauseMinutes),
        totalMinutes: round(d.focusMinutes + d.pauseMinutes),
      })),
  };
}
