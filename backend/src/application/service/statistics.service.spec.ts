import { describe, expect, it } from 'vitest';
import {
  calculatePomodoroStatistics,
  calculateTaskStatistics,
  statisticsPeriod,
} from './statistics.service.js';

describe('statistics periods', () => {
  it('uses Monday and Vietnam midnight across year boundaries', () => {
    const p = statisticsPeriod({ date: '2026-01-01' });
    expect(p.start.toISOString()).toBe('2025-12-28T17:00:00.000Z');
    expect(p.end.toISOString()).toBe('2026-01-04T17:00:00.000Z');
    expect(p.days).toHaveLength(7);
    expect(p.contains(p.end)).toBe(false);
  });
  it('handles leap months and rejects invalid queries', () => {
    expect(
      statisticsPeriod({ range: 'month', date: '2028-02-10' }).days,
    ).toHaveLength(29);
    for (const query of [
      { range: 'day' },
      { date: '2026-02-30' },
      { date: ['2026-01-01'] },
      { utcOffsetMinutes: 'abc' },
    ])
      expect(() => statisticsPeriod(query)).toThrow();
  });
});

describe('task statistics', () => {
  const p = statisticsPeriod({ date: '2026-10-14' });
  const created_at = new Date('2026-10-12T00:00:00Z');
  const due = new Date('2026-10-12T17:00:00Z');
  it('separates cohorts, real completion dates, deadlines, and priority', () => {
    const result = calculateTaskStatistics(
      [
        {
          created_at,
          status: 'done',
          done_at: new Date('2026-10-13T03:00:00Z'),
          ruleData: { end_date: due, endTimer: 36000, priority: 1 },
        },
        {
          created_at,
          status: 'done',
          done_at: new Date('2026-10-13T03:00:01Z'),
          ruleData: { end_date: due, endTimer: 36000, priority: 2 },
        },
        {
          created_at,
          status: 'pending',
          ruleData: { end_date: due, priority: 3 },
        },
        { created_at, status: "won't do" },
        { created_at, status: 'done' },
        {
          created_at: new Date('2026-09-01T00:00:00Z'),
          status: 'done',
          done_at: created_at,
        },
      ],
      p,
      new Date('2026-10-14T00:00:00Z'),
    );
    expect(result.summary).toMatchObject({
      totalTasks: 5,
      completedTasks: 3,
      incompleteTasks: 2,
      pendingTasks: 1,
      wontDoTasks: 1,
      overdueTasks: 1,
      completedOnTime: 1,
      completedLate: 1,
      completedWithoutDeadline: 1,
      completedInRange: 3,
      completionRate: 60,
      averageCompletedPerDay: 0.43,
    });
    expect(result.daily.reduce((n, d) => n + d.totalTasks, 0)).toBe(5);
    expect(result.byPriority.map((d) => d.totalTasks)).toEqual([1, 1, 1, 2]);
  });
  it('does not classify date-only deadlines early and reports missing timestamps', () => {
    const result = calculateTaskStatistics(
      [
        { created_at, status: 'done', ruleData: { end_date: due } },
        { created_at, status: 'pending', ruleData: { end_date: due } },
      ],
      p,
      new Date('2026-10-13T16:59:59Z'),
    );
    expect(result.summary.completedUnknownTime).toBe(1);
    expect(result.summary.overdueTasks).toBe(0);
    expect(result.summary.averageCompletionHours).toBeNull();
  });
  it('returns zero-filled buckets for empty data', () => {
    const result = calculateTaskStatistics([], p);
    expect(result.daily).toHaveLength(7);
    expect(result.summary.completionRate).toBe(0);
    expect(result.byPriority).toHaveLength(4);
  });
});

describe('pomodoro statistics', () => {
  it('sums focus in milliseconds, calculates gaps, and groups by local day and task', () => {
    const p = statisticsPeriod({ date: '2026-10-14' });
    const result = calculatePomodoroStatistics(
      [
        {
          start: new Date('2026-10-13T18:00:00Z'),
          task: 'task-1',
          progress: [
            { startPause: new Date('2026-10-13T18:00:00Z'), duration: 60000 },
            { startPause: new Date('2026-10-13T18:02:00Z'), duration: 120000 },
          ],
        },
        { start: p.start, progress: [] },
        { start: p.end, progress: [] },
      ],
      p,
    );
    expect(result.summary).toMatchObject({
      totalSessions: 2,
      totalTasks: 1,
      totalFocusMinutes: 3,
      totalPauseMinutes: 1,
      averageFocusMinutesPerSession: 1.5,
      activeDays: 1,
      bestDay: '2026-10-14',
    });
    expect(
      result.daily.find((d) => d.date === '2026-10-14')?.focusMinutes,
    ).toBe(3);
    expect(result.byTask).toContainEqual({
      taskId: 'task-1',
      taskName: null,
      sessions: 1,
      focusMinutes: 3,
      pauseMinutes: 1,
      totalMinutes: 4,
    });
    expect(calculatePomodoroStatistics([], p).summary.bestDay).toBeNull();
  });
  it('counts unique tasks and combines repeated sessions without counting unassigned sessions as tasks', () => {
    const p = statisticsPeriod({ date: '2026-10-14' });
    const result = calculatePomodoroStatistics(
      [
        {
          start: p.start,
          task: 'a',
          taskName: 'Task A',
          progress: [{ startPause: p.start, duration: 60000 }],
        },
        {
          start: p.start,
          task: 'a',
          taskName: 'Task A',
          progress: [{ startPause: p.start, duration: 120000 }],
        },
        { start: p.start, task: 'b', progress: [] },
        { start: p.start, progress: [] },
      ],
      p,
    );
    expect(result.summary.totalTasks).toBe(2);
    expect(result.summary.totalSessions).toBe(4);
    expect(result.byTask[0]).toMatchObject({
      taskId: 'a',
      taskName: 'Task A',
      sessions: 2,
      focusMinutes: 3,
      totalMinutes: 3,
    });
    expect(result.byTask.reduce((sum, task) => sum + task.sessions, 0)).toBe(4);
    expect(calculatePomodoroStatistics([], p).summary.totalTasks).toBe(0);
  });
});
