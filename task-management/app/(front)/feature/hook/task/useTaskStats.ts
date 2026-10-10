import { useMemo, useState } from "react";
// ⚠️ Chỉnh đường dẫn cho khớp dự án / adjust this path to your project
import {
  fromDateKey,
  toDateKey,
  useTodayKey,
} from "@/app/(front)/feature/hook/pomodoro/usePomodoroStats";

export type TaskRange = "week" | "month";

/**
 * Dạng tối thiểu mà thống kê cần. Hãy ánh xạ ITaskModel của bạn sang dạng này.
 * Minimal shape the stats need. Map your ITaskModel to this shape.
 */
export interface TaskStatsItem {
  id: string;
  completed: boolean;
  completedAt?: Date | string | null;
  dueDate?: Date | string | null;
  createdAt?: Date | string | null;
}

export interface TaskChartPoint {
  label: string;
  completed: number;
}

export interface TaskStatusBreakdown {
  completed: number;
  pending: number; // chưa hoàn thành, chưa quá hạn / not done, not overdue
  overdue: number; // chưa hoàn thành, đã quá hạn / not done, past due
}

export interface TaskStatsSummary {
  range: TaskRange;
  daysInRange: number;
  /** Tổng số task thuộc khoảng thời gian / total tasks belonging to the range */
  totalInRange: number;
  /** Dùng cho biểu đồ tròn / feeds the pie chart */
  statusBreakdown: TaskStatusBreakdown;
  /** completed / totalInRange (%) */
  completionRate: number;
  /** Số task hoàn thành trong khoảng (theo ngày hoàn thành) / completions by completion date */
  completedInRange: number;
  /** Trung bình task hoàn thành mỗi ngày / average completions per day */
  averageCompletedPerDay: number;
  /** Số task hoàn thành mỗi ngày / completions per day */
  chartData: TaskChartPoint[];
}

const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function calculateTaskStats(
  items: TaskStatsItem[],
  range: TaskRange = "week",
  now: Date = new Date(),
): TaskStatsSummary {
  const daysInRange = range === "week" ? 7 : 30;
  const todayKey = toDateKey(now);
  const startKey = toDateKey(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - (daysInRange - 1)),
  );

  // So sánh chuỗi YYYY-MM-DD hoạt động đúng theo thứ tự thời gian
  // Comparing YYYY-MM-DD strings sorts chronologically
  const inRange = (d?: Date | string | null) => {
    if (!d) return false;
    const k = toDateKey(d);
    return k >= startKey && k <= todayKey;
  };

  /**
   * Một task "thuộc" khoảng thời gian nếu hạn chót (hoặc ngày tạo, nếu chưa có hạn) nằm trong khoảng.
   * A task "belongs" to the range when its due date (or creation date when it has no due date) is inside it.
   * Lưu ý: task có hạn trong tương lai chưa được tính.
   * Note: tasks due in the future are not counted yet.
   */
  const anchorOf = (t: TaskStatsItem) => t.dueDate ?? t.createdAt;
  const tasksInRange = items.filter((t) => inRange(anchorOf(t)));

  const completed = tasksInRange.filter((t) => t.completed).length;
  const overdue = tasksInRange.filter(
    (t) => !t.completed && t.dueDate && toDateKey(t.dueDate) < todayKey,
  ).length;
  const pending = tasksInRange.length - completed - overdue;

  const totalInRange = tasksInRange.length;
  const completionRate = totalInRange > 0 ? Math.round((completed / totalInRange) * 100) : 0;

  // Biểu đồ theo ngày hoàn thành thực tế / chart by actual completion date
  const completions = items.filter((t) => t.completed && inRange(t.completedAt));

  const buckets = new Map<string, TaskChartPoint>();
  for (let i = daysInRange - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const label =
      range === "week"
        ? WEEKDAY_SHORT[d.getDay()]
        : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(toDateKey(d), { label, completed: 0 });
  }
  completions.forEach((t) => {
    const b = buckets.get(toDateKey(t.completedAt as Date | string));
    if (b) b.completed += 1;
  });

  return {
    range,
    daysInRange,
    totalInRange,
    statusBreakdown: { completed, pending, overdue },
    completionRate,
    completedInRange: completions.length,
    averageCompletedPerDay: Math.round((completions.length / daysInRange) * 10) / 10,
    chartData: Array.from(buckets.values()),
  };
}

export function useTaskStats(items: TaskStatsItem[] = [], initialRange: TaskRange = "week") {
  const [range, setRange] = useState<TaskRange>(initialRange);
  const todayKey = useTodayKey();
  const now = useMemo(() => fromDateKey(todayKey), [todayKey]);

  const stats = useMemo(() => calculateTaskStats(items, range, now), [items, range, now]);

  return { stats, range, setRange };
}