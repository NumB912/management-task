"use client";

import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis } from "recharts";
import { AlarmClock, CalendarClock, CheckCircle2, ListChecks, type LucideIcon } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TaskStatsItem,
  useTaskStats,
  type TaskRange,
  type TaskStatusBreakdown,
} from "../../feature/hook/task/useTaskStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const RANGE_LABELS: Record<TaskRange, string> = {
  week: "1 tuần",
  month: "1 tháng",
};

type StatusKey = keyof TaskStatusBreakdown;

const STATUS_META: Record<StatusKey, { label: string; color: string; icon: LucideIcon }> = {
  completed: { label: "Hoàn thành", color: "var(--chart-2)", icon: CheckCircle2 },
  pending: { label: "Chưa hoàn thành", color: "var(--chart-4)", icon: CalendarClock },
  overdue: { label: "Quá hạn", color: "var(--destructive)", icon: AlarmClock },
};

const STATUS_ORDER: StatusKey[] = ["completed", "pending", "overdue"];

const pieConfig = {
  count: { label: "Số task" },
  completed: { label: STATUS_META.completed.label, color: STATUS_META.completed.color },
  pending: { label: STATUS_META.pending.label, color: STATUS_META.pending.color },
  overdue: { label: STATUS_META.overdue.label, color: STATUS_META.overdue.color },
} satisfies ChartConfig;

const barConfig = {
  completed: { label: "Hoàn thành", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function TaskStatsView({ tasks }: Readonly<{ tasks: TaskStatsItem[] }>) {
  const { stats, range, setRange } = useTaskStats(tasks);

  const pieData = useMemo(
    () =>
      STATUS_ORDER.map((key) => ({
        status: key,
        count: stats.statusBreakdown[key],
        fill: `var(--color-${key})`,
      })),
    [stats.statusBreakdown],
  );

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Chưa có công việc nào để thống kê.
        </CardContent>
      </Card>
    );
  }

  const rangeLabel = RANGE_LABELS[range];

  return (
    <div className="flex flex-col gap-6">
      {/* Chọn khoảng thời gian / Range switch */}
      <div className="flex justify-end">
        <Tabs value={range} onValueChange={(v) => setRange(v as TaskRange)}>
          <TabsList>
            {(Object.keys(RANGE_LABELS) as TaskRange[]).map((r) => (
              <TabsTrigger key={r} value={r}>
                {RANGE_LABELS[r]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Cột trái: tổng số task + trung bình hoàn thành / Left: total + average */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">
                Tổng số task ({rangeLabel})
              </CardDescription>
              <ListChecks className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalInRange}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.statusBreakdown.completed} hoàn thành · tỉ lệ {stats.completionRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">
                Trung bình hoàn thành ({rangeLabel})
              </CardDescription>
              <CheckCircle2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.averageCompletedPerDay.toLocaleString("vi-VN")}
                <span className="ml-1 text-sm font-medium text-muted-foreground">task/ngày</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.completedInRange} task trong {stats.daysInRange} ngày
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: biểu đồ tròn / Right: pie chart */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Trạng thái task</CardTitle>
            <CardDescription>
              {rangeLabel} · tính theo hạn chót (hoặc ngày tạo nếu chưa có hạn)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.totalInRange === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Không có task nào trong khoảng này.
              </div>
            ) : (
              <>
                <ChartContainer config={pieConfig} className="mx-auto aspect-square max-h-56">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="status" />} />
                    <Pie data={pieData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={4}>
                      <Label
                        content={({ viewBox }) => {
                          if (!viewBox || !("cx" in viewBox)) return null;
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {stats.totalInRange}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy ?? 0) + 22}
                                className="fill-muted-foreground text-xs"
                              >
                                task
                              </tspan>
                            </text>
                          );
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>

                {/* Chú thích / Legend */}
                <ul className="space-y-2">
                  {STATUS_ORDER.map((key) => {
                    const meta = STATUS_META[key];
                    const count = stats.statusBreakdown[key];
                    const percent =
                      stats.totalInRange > 0 ? Math.round((count / stats.totalInRange) * 100) : 0;
                    const Icon = meta.icon;
                    return (
                      <li key={key} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Icon className="size-4" style={{ color: meta.color }} />
                          {meta.label}
                        </span>
                        <span className="text-muted-foreground">
                          {count} · {percent}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ hoàn thành theo ngày / Daily completion chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task hoàn thành theo ngày</CardTitle>
          <CardDescription>{rangeLabel} · số task hoàn thành mỗi ngày</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-64 w-full">
            <BarChart data={stats.chartData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}