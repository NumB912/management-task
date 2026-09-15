"use client";

import React from "react";
import { Sunrise, Sun, Sunset, Moon, Sparkles, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { TimeOfDayStats, HourlyFocusPoint } from "../../feature/data/promodoMockData";

interface PomodoroTimeOfDayStatsProps {
  stats: TimeOfDayStats[];
  hourlyDistribution?: HourlyFocusPoint[];
  totalFocusMinutes?: number;
  className?: string;
  showHourlyChart?: boolean;
}

const PERIOD_ICONS = {
  sunrise: Sunrise,
  sun: Sun,
  sunset: Sunset,
  moon: Moon,
};

export function PomodoroTimeOfDayStats({
  stats,
  hourlyDistribution = [],
  totalFocusMinutes = 0,
  className = "",
  showHourlyChart = true,
}: PomodoroTimeOfDayStatsProps) {
  // Tìm mốc giờ có thời gian tập trung cao nhất để tính thang đo biểu đồ
  const activeHourly = hourlyDistribution.filter((h) => h.hour >= 6 && h.hour <= 23);
  const maxHourlyMinutes = Math.max(...activeHourly.map((h) => h.focusMinutes), 30);

  return (
    <Card className={`border border-border/60 shadow-xs ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Thời gian tập trung trong ngày</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Phân tích nhịp độ làm việc qua các buổi Sáng · Chiều · Tối · Đêm
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] font-normal gap-1">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500/20" />
            Nhịp sinh học
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* 4 Cards biểu diễn 4 buổi trong ngày */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {stats.map((period) => {
            const IconComponent = PERIOD_ICONS[period.icon] || Sun;
            const hasData = period.focusMinutes > 0;

            return (
              <div
                key={period.period}
                className={`relative p-3 rounded-lg border transition-all ${
                  period.isPeak && hasData
                    ? "bg-primary/5 border-primary/40 shadow-xs ring-1 ring-primary/20"
                    : "bg-card border-border/60 hover:border-border"
                }`}
              >
                {/* Badge khung giờ đỉnh cao */}
                {period.isPeak && hasData && (
                  <div className="absolute -top-2 right-2">
                    <Badge
                      variant="default"
                      className="text-[9px] h-4 px-1.5 py-0 gap-0.5 bg-primary text-primary-foreground font-semibold shadow-xs"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Đỉnh cao
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div
                    className="p-1.5 rounded-md flex items-center justify-center"
                    style={{
                      backgroundColor: `${period.color}15`,
                      color: period.color,
                    }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {period.timeRange}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{period.label}</span>
                    <span className="text-[11px] font-bold text-foreground">
                      {period.totalHoursFormatted}
                    </span>
                  </div>

                  {/* Thanh tiến độ tỷ lệ % */}
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(period.percentage, hasData ? 5 : 0)}%`,
                        backgroundColor: period.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span>{period.sessionsCount} phiên</span>
                    <span className="font-medium text-foreground">{period.percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Biểu đồ thanh phân bổ 18 khung giờ (06:00 -> 23:00) */}
        {showHourlyChart && activeHourly.length > 0 && (
          <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Mật độ tập trung theo từng giờ (06:00 - 23:00)
              </span>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Sáng
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Chiều
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" /> Tối
                </span>
              </div>
            </div>

            {/* Thanh trực quan hóa theo cột giờ */}
            <div className="h-16 flex items-end gap-1 pt-2 w-full">
              {activeHourly.map((point) => {
                const heightPercent = point.focusMinutes > 0
                  ? Math.max(15, (point.focusMinutes / maxHourlyMinutes) * 100)
                  : 6;

                const barColor =
                  point.period === "morning"
                    ? "#f59e0b"
                    : point.period === "afternoon"
                    ? "#3b82f6"
                    : point.period === "evening"
                    ? "#8b5cf6"
                    : "#06b6d4";

                return (
                  <div
                    key={point.hour}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  >
                    {/* Tooltip khi hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-20 whitespace-nowrap">
                      <div className="bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded shadow-md border">
                        {point.hourLabel}: {point.focusMinutes} phút ({point.sessionsCount} phiên)
                      </div>
                      <div className="w-1.5 h-1.5 bg-popover rotate-45 -mt-1 border-r border-b" />
                    </div>

                    <div
                      className="w-full rounded-t transition-all group-hover:brightness-125"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: point.focusMinutes > 0 ? barColor : "var(--muted)",
                        opacity: point.focusMinutes > 0 ? 0.9 : 0.4,
                      }}
                    />
                    <span className="text-[9px] text-muted-foreground/80 mt-1 font-mono">
                      {point.hour % 2 === 0 ? point.hour : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
