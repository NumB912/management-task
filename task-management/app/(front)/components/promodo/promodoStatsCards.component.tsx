"use client";

import React from "react";
import { Clock, CheckCircle2, Flame, TrendingUp, Sparkles, Pause } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { PomodoroStatsSummary } from "../../feature/data/promodoMockData";

interface PomodoroStatsCardsProps {
  stats: PomodoroStatsSummary;
}

export function PomodoroStatsCards({ stats }: PomodoroStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      <Card className="relative overflow-hidden border border-border/60 shadow-xs hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Thời gian tập trung</span>
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.totalFocusHours}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                +18%
              </Badge>
              <span className="text-[11px] text-muted-foreground">so với kỳ trước</span>
            </div>
          </div>
        </CardContent>
      </Card>


      <Card className="relative overflow-hidden border border-border/60 shadow-xs hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Phiên hoàn thành</span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-1">
              {stats.totalSessions}
              <span className="text-xs font-normal text-muted-foreground">
                / {stats.dailyGoalSessions} phiên
              </span>
            </div>
            {/* Thanh tiến độ */}
            <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.goalCompletionRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-muted-foreground">Tiến độ mục tiêu</span>
              <span className="text-[10px] font-semibold text-foreground">{stats.goalCompletionRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Chuỗi ngày liên tiếp */}
      <Card className="relative overflow-hidden border border-border/60 shadow-xs hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Chuỗi liên tiếp</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500/20" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-1">
              {stats.streakDays}
              <span className="text-xs font-normal text-muted-foreground">ngày liên tục</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Đang duy trì phong độ rất tốt!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Tỷ lệ tập trung thực tế */}
      <Card className="relative overflow-hidden border border-border/60 shadow-xs hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tỷ lệ tập trung</span>
            <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.focusEfficiency}%
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
              <Pause className="w-3 h-3" />
              <span>Nghỉ TB {stats.averagePauseMinutes}m / phiên</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
