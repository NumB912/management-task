"use client";
import { useState, useSyncExternalStore } from "react";
import { ChartColumn, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PomodoroApiStatsView, TaskApiStatsView } from "../../components/statistics/statisticsViews";
import { StatisticsRange } from "../../model/statistics.model";
import { useStatistics } from "../../feature/hook/statistics/useStatistics";

function vietnamToday() {
  return new Date(Date.now() + 420 * 60000).toISOString().slice(0, 10);
}
const subscribeDate = () => () => {};
const serverDate = () => "";
const displayDate = (iso: string) =>
  new Date(new Date(iso).getTime() + 420 * 60000)
    .toISOString()
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");
export default function StatsPage() {
  const [section, setSection] = useState<"task" | "pomodoro">("task");
  const [range, setRange] = useState<StatisticsRange>("week");
  const today = useSyncExternalStore(subscribeDate, vietnamToday, serverDate);
  const [selectedDate, setDate] = useState("");
  const date = selectedDate || today;
  const { tasks, pomodoro } = useStatistics(
    { range, date, utcOffsetMinutes: 420 },
    section,
  );
  const active = section === "task" ? tasks : pomodoro;
  const period = active.data?.period;
  return (
    <div className="flex h-dvh w-full flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <ChartColumn aria-hidden="true" />
        Thống kê
      </h1>
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={section}
            onValueChange={(v) => {
              if (v === "task" || v === "pomodoro") setSection(v);
            }}
          >
            <TabsList className="p-1">
              <TabsTrigger value="task" className={section=="task"?`bg-white!`:""}>Nhiệm vụ</TabsTrigger>
              <TabsTrigger value="pomodoro" className={section=="pomodoro"?`bg-white!`:""}>Pomodoro</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={range}
              onValueChange={(v) => {
                if (v === "week" || v === "month") setRange(v);
              }}
            >
              <TabsList>
                <TabsTrigger value="week" className={range=="week"?`bg-white!`:""}>Theo tuần</TabsTrigger>
                <TabsTrigger value="month" className={range=="month"?`bg-white!`:""}>Theo tháng</TabsTrigger>
              </TabsList>
            </Tabs>
            <label className="flex items-center gap-2 text-sm">
              Ngày trong kỳ
              <input
                type="date"
                aria-label="Chọn ngày trong kỳ thống kê"
                value={date}
                onChange={(e) => {
                  if (e.target.value) setDate(e.target.value);
                }}
                className="h-9 rounded-md border bg-background px-2"
              />
            </label>
            <Button
              variant="outline"
              disabled={!date || active.isFetching}
              onClick={() => void active.refetch()}
            >
              <RefreshCw className={active.isFetching ? "animate-spin" : ""} />
              Làm mới
            </Button>
          </div>
        </div>
        {period && (
          <p className="text-sm text-muted-foreground">
            {range === "week" ? "Tuần" : "Tháng"}: {displayDate(period.start)} –{" "}
            {displayDate(
              new Date(
                new Date(period.endExclusive).getTime() - 1,
              ).toISOString(),
            )}{" "}
            · Giờ Việt Nam
          </p>
        )}
        <div aria-live="polite" aria-busy={active.isFetching}>
          {!date || active.isPending ? (
            <div
              role="status"
              className="rounded-lg border p-12 text-center text-muted-foreground"
            >
              Đang tải thống kê…
            </div>
          ) : active.isError ? (
            <div
              role="alert"
              className="space-y-3 rounded-lg border border-destructive/30 p-6"
            >
              <p>Không thể tải thống kê. Vui lòng thử lại.</p>
              <Button
                variant="outline"
                disabled={active.isFetching}
                onClick={() => void active.refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : section === "task" && tasks.data ? (
            <TaskApiStatsView data={tasks.data} />
          ) : section === "pomodoro" && pomodoro.data ? (
            <PomodoroApiStatsView data={pomodoro.data} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
