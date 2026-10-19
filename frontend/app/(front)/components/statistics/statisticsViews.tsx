"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ListTodo, Timer } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  PomodoroStatistics,
  TaskStatistics,
} from "../../model/statistics.model";
const number = (value: number) =>
  value?.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
const shortDate = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;
function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">
          {typeof value === "number" ? number(value) : value}
        </div>
        {detail && (
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        )}
      </CardContent>
    </Card>
  );
}
const taskConfig = {
  totalTasks: { label: "Tổng nhiệm vụ", color: "var(--chart-1)" },
  completedInRange: { label: "Hoàn thành", color: "var(--chart-2)" },
} satisfies ChartConfig;
const priorityConfig = {
  completedTasks: { label: "Hoàn thành", color: "var(--chart-2)" },
  incompleteTasks: { label: "Chưa hoàn thành", color: "var(--chart-4)" },
} satisfies ChartConfig;
const pomodoroTaskLabel = (task: PomodoroStatistics["byTask"][number]) =>
  task.taskId
    ? task.taskName || "Task đã xóa hoặc không còn quyền truy cập"
    : "Không có task";
export function TaskApiStatsView({ data }: { data: TaskStatistics }) {
  const s = data.summary;
  return (
    <div className="space-y-5">
      {s.totalTasks === 0 && s.completedInRange === 0 && (
        <p className="rounded-lg border p-4 text-sm text-muted-foreground">
          Chưa có nhiệm vụ trong kỳ đã chọn.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Tổng nhiệm vụ"
          value={s.totalTasks}
          detail={`${number(s.completionRate)}% hoàn thành`}
        />
        <Metric
          label="Đã hoàn thành"
          value={s.completedTasks}
          detail={`${number(s.completedInRange)} nhiệm vụ hoàn thành trong kỳ`}
        />
        <Metric
          label="Chưa hoàn thành"
          value={s.incompleteTasks}
          detail={`${number(s.pendingTasks)} đang chờ · ${number(s.wontDoTasks)} không thực hiện`}
        />
        <Metric
          label="Trung bình hoàn thành"
          value={`${number(s.averageCompletedPerDay)} / ngày`}
          detail={`Tính trên ${data.period.daysInRange} ngày trong kỳ`}
        />
        <Metric label="Hoàn thành đúng hạn" value={s.completedOnTime} />
        <Metric label="Hoàn thành trễ hạn" value={s.completedLate} />
        <Metric
          label="Đang quá hạn"
          value={s.overdueTasks}
          detail="Nhiệm vụ đang chờ đã quá hạn"
        />
        <Metric
          label="Thời gian hoàn thành trung bình"
          value={
            s.averageCompletionHours === null
              ? "Chưa có"
              : `${number(s.averageCompletionHours)} giờ`
          }
          detail="Từ lúc tạo đến lúc hoàn thành"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {s.completedWithoutDeadline} nhiệm vụ hoàn thành không có hạn chót ·{" "}
        {s.completedUnknownTime} nhiệm vụ thiếu thời điểm hoàn thành.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Nhiệm vụ theo ngày</CardTitle>
          <CardDescription>
            Tổng nhiệm vụ theo ngày hạn chót, ngày bắt đầu hoặc ngày tạo. Hoàn
            thành theo ngày hoàn thành thực tế.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={taskConfig} className="h-72 w-full">
            <BarChart data={data.daily} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
              />
              <YAxis allowDecimals={false} width={35} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => shortDate(String(value))}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="totalTasks"
                fill="var(--color-totalTasks)"
                radius={4}
              />
              <Bar
                dataKey="completedInRange"
                fill="var(--color-completedInRange)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Nhiệm vụ theo độ ưu tiên</CardTitle>
          <CardDescription>
            Số nhiệm vụ hoàn thành và chưa hoàn thành ở từng mức P1–P4.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={priorityConfig} className="h-64 w-full">
            <BarChart data={data.byPriority}  accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="priority"
                tickFormatter={(value) => `P${value}`}
                tickLine={false}
                axisLine={false}
              />
              <YAxis allowDecimals={false} width={35} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Ưu tiên ${value}`}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="completedTasks"
                stackId="priority"
                fill="var(--color-completedTasks)"
              />
              <Bar
                dataKey="incompleteTasks"
                stackId="priority"
                fill="var(--color-incompleteTasks)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
            {data.byPriority.map((p) => (
              <p key={p.priority}>
                <span className="text-muted-foreground">P{p.priority}: </span>
                <strong>{number(p.totalTasks)}</strong>
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export function PomodoroApiStatsView({ data }: { data: PomodoroStatistics }) {
  const s = data.summary;
  return (
    <div className="space-y-5">
      {s.totalSessions === 0 && (
        <p className="rounded-lg border p-4 text-sm text-muted-foreground">
          Chưa có phiên Pomodoro trong kỳ đã chọn.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Số phiên Pomodoro" value={s.totalSessions} />
        <Metric
          label="Nhiệm vụ dùng Pomodoro"
          value={s.totalTasks}
          detail="Mỗi nhiệm vụ được tính một lần trong kỳ"
        />
        <Metric
          label="Thời gian tập trung"
          value={`${number(s.totalFocusMinutes)} phút`}
        />
        <Metric
          label="Thời gian nghỉ"
          value={`${number(s.totalPauseMinutes)} phút`}
        />
        <Metric
          label="Trung bình mỗi phiên"
          value={`${number(s.averageFocusMinutesPerSession)} phút`}
        />
        <Metric
          label="Trung bình mỗi ngày"
          value={`${number(s.averageFocusMinutesPerDay)} phút`}
          detail={`Tính trên ${data.period.daysInRange} ngày trong kỳ`}
        />
        <Metric label="Ngày có tập trung" value={s.activeDays} />
        <Metric
          label="Ngày tập trung nhiều nhất"
          value={s.bestDay ? shortDate(s.bestDay) : "Chưa có"}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nhiệm vụ dùng Pomodoro</CardTitle>
          <CardDescription>
            Phần trăm tập trung trên tổng thời gian của từng task trong kỳ đã
            chọn.
          </CardDescription>
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-emerald-500" />
              Thời gian tập trung
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-amber-400" />
              Thời gian nghỉ
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {data.byTask.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Chưa có phiên Pomodoro trong kỳ này.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.byTask.map((task) => {
                const total = task.focusMinutes + task.pauseMinutes;
                const focusPercent =
                  total > 0
                    ? Math.min(
                        100,
                        Math.max(0, (task.focusMinutes / total) * 100),
                      )
                    : 0;
                const Icon = task.taskId ? ListTodo : Timer;
                const label = pomodoroTaskLabel(task);
                return (
                  <div
                    key={task.taskId ?? "unassigned"}
                    className="flex min-w-0 flex-col items-center gap-3 rounded-xl border bg-muted/10 p-4 text-center"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <p className="min-h-10 w-full break-words text-sm font-medium">
                      {label}
                    </p>
                    <div className="text-xl font-bold tabular-nums">
                      {number(focusPercent)}%
                      <p className="text-xs font-normal text-muted-foreground">
                        tập trung
                      </p>
                    </div>
                    <div
                      role="img"
                      aria-label={`${label}: ${number(task.focusMinutes)} phút tập trung, ${number(task.pauseMinutes)} phút nghỉ, ${number(focusPercent)} phần trăm tập trung`}
                      className="flex h-36 w-12 flex-col justify-end overflow-hidden rounded-lg bg-muted"
                    >
                      {total > 0 && (
                        <>
                          <div
                            className="w-full shrink-0 bg-amber-400"
                            style={{ height: `${100 - focusPercent}%` }}
                          />
                          <div
                            className="w-full shrink-0 bg-emerald-500"
                            style={{ height: `${focusPercent}%` }}
                          />
                        </>
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold tabular-nums">
                        {number(task.totalMinutes)} phút
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tổng thời gian · {number(task.sessions)} Pomodoro
                      </p>
                    </div>
                    <div className="w-full space-y-1 border-t pt-2 text-xs text-muted-foreground">
                      <p className="flex items-center justify-between gap-1">
                        <span>Tập trung</span>
                        <span className="tabular-nums">
                          {number(task.focusMinutes)} phút
                        </span>
                      </p>
                      <p className="flex items-center justify-between gap-1">
                        <span>Nghỉ</span>
                        <span className="tabular-nums">
                          {number(task.pauseMinutes)} phút
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết từng ngày</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Ngày</th>
                <th className="text-right">Số phiên</th>
                <th className="text-right">Tập trung (phút)</th>
                <th className="text-right">Nghỉ (phút)</th>
              </tr>
            </thead>
            <tbody>
              {data.daily.map((day) => (
                <tr key={day.date} className="border-b last:border-0">
                  <td className="py-2">{shortDate(day.date)}</td>
                  <td className="text-right">{day.sessions}</td>
                  <td className="text-right">{number(day.focusMinutes)}</td>
                  <td className="text-right">{number(day.pauseMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
