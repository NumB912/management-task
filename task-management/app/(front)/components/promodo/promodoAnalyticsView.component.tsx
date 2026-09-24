"use client";

import React, { useState, useMemo } from "react";
import { IPromodoroModel } from "../../model/promodo.model";
import {
  calculatePomodoroStats,
  TimeRange,
} from "../../feature/data/promodoMockData";
import { PomodoroStatsCards } from "./promodoStatsCards.component";
import { PomodoroFocusChart } from "./promodoFocusChart.component";
import { PomodoroTaskBreakdown } from "./promodoTaskBreakdown.component";
import { PomodoroTimeOfDayStats } from "./promodoTimeOfDayStats.component";
import { Button } from "@/components/ui/button";
import { BarChart3, Maximize2, CalendarClock } from "lucide-react";

interface PomodoroAnalyticsViewProps {
  sessions: IPromodoroModel[];
  onOpenFullModal?: () => void;
  onNavigateToTimeline?: () => void;
  isCompact?: boolean;
}

export function PomodoroAnalyticsView({
  sessions,
  onOpenFullModal,
  onNavigateToTimeline,
  isCompact = false,
}: PomodoroAnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  const stats = useMemo(() => {
    return calculatePomodoroStats(sessions, timeRange);
  }, [sessions, timeRange]);

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto pr-1">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Báo cáo & Thống kê</h3>
            <p className="text-[11px] text-muted-foreground">
              {timeRange === "today"
                ? "Dữ liệu hôm nay"
                : timeRange === "week"
                ? "Dữ liệu 7 ngày qua"
                : "Dữ liệu tháng này"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border/50">
            <Button
              variant={timeRange === "today" ? "default" : "ghost"}
              size="xs"
              className="text-xs h-6 px-2"
              onClick={() => setTimeRange("today")}
            >
              Hôm nay
            </Button>
            <Button
              variant={timeRange === "week" ? "default" : "ghost"}
              size="xs"
              className="text-xs h-6 px-2"
              onClick={() => setTimeRange("week")}
            >
              Tuần này
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "ghost"}
              size="xs"
              className="text-xs h-6 px-2"
              onClick={() => setTimeRange("month")}
            >
              Tháng này
            </Button>
          </div>

          {onNavigateToTimeline && (
            <Button
              variant="outline"
              size="xs"
              className="text-xs h-6 px-2 gap-1 text-muted-foreground hover:text-foreground"
              onClick={onNavigateToTimeline}
              title="Xem Timeline phiên làm việc"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Timeline
            </Button>
          )}

          {onOpenFullModal && (
            <Button
              variant="outline"
              size="icon-xs"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={onOpenFullModal}
              title="Xem toàn màn hình thống kê"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
      <PomodoroStatsCards stats={stats} />
      <PomodoroFocusChart data={stats.chartData} timeRange={timeRange} />
    <PomodoroTimeOfDayStats
        stats={stats.timeOfDayStats}
        hourlyDistribution={stats.hourlyDistribution}
        totalFocusMinutes={stats.totalFocusMinutes}
        showHourlyChart={timeRange === "today" || !isCompact}
      />
      {!isCompact && <PomodoroTaskBreakdown stats={stats} />}
    </div>
  );
}
