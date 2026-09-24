"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  Clock,
  CalendarDays,
  LayoutDashboard,
  Zap,
  CheckCircle2,
  Calendar1,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDuration } from "../../utils/formatTimer";
import {
  getGroupedTimelineData,
  TimeOfDayPeriod,
} from "../../feature/data/promodoMockData";
import { IPromodoroModel } from "../../model/promodo.model";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { vi } from "date-fns/locale";

interface PomodoroTimelineViewProps {
  sessions: IPromodoroModel[];
  className?: string;
}

const PERIOD_COLORS: Record<TimeOfDayPeriod, string> = {
  morning: "#f59e0b",
  afternoon: "#3b82f6",
  evening: "#8b5cf6",
  night: "#06b6d4",
};

export function PomodoroTimelineView({
  sessions,
  className = "",
}: Readonly<PomodoroTimelineViewProps>) {
  const [startDate, setStartDate] = useState<Date>();
  const [openStartDate, setOpenStartDate] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<Date>();
  const [openEndDate, setOpenEndDate] = useState<boolean>(false);
  const overallData = useMemo(() => {
    return getGroupedTimelineData(sessions);
  }, [sessions]);
  const [openDays, setOpenDays] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (overallData.days.length > 0) {
      initial[overallData.days[0].dateKey] = true;
    }
    return initial;
  });
  const [openSessionDetail, setOpenSessionDetail] = useState<
    Record<string, boolean>
  >({});
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const toggleSessionDetail = (sessionId: string) => {
    setOpenSessionDetail((prev) => ({
      ...prev,
      [sessionId]: !prev?.[sessionId],
    }));
  };
  const toggleDay = (dateKey: string) => {
    setOpenDays((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };
  const rulerHours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
  const peakPeriodInfo = overallData.timeOfDayStats.find((p) => p.isPeak);
  return (
    <div className={`flex flex-col gap-4 w-full h-dvh pr-1 overflow-y-auto ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
            <span>Tổng quan</span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {overallData.days.length} ngày ghi nhận
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-3 rounded-lg border bg-card/60 shadow-2xs space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Thời gian tập trung
            </span>
            <div className="text-xl font-extrabold text-foreground">
              {overallData.totalFocusHours}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {overallData.totalSessions} phiên
            </div>
          </div>

          <div className="p-3 rounded-lg border bg-card/60 shadow-2xs space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Hiệu suất
            </span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {overallData.efficiency}%
            </div>
            <div className="text-[11px] text-muted-foreground">
              Nghỉ {overallData.totalPauseMinutes}m
            </div>
          </div>

          <div className="p-3 rounded-lg border bg-card/60 shadow-2xs space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Khung giờ vàng
            </span>
            <div
              className="text-sm font-bold text-foreground truncate"
              title={overallData.peakPeriod}
            >
              {overallData.peakPeriod}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Tập trung tốt nhất
            </div>
          </div>

          <div className="p-3 rounded-lg border bg-card/60 shadow-2xs space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Buổi nhiều nhất
            </span>
            <div className="text-sm font-bold text-foreground truncate">
              {peakPeriodInfo?.label || "Buổi sáng"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {peakPeriodInfo?.sessionsCount || 0} phiên (
              {peakPeriodInfo?.percentage || 0}%)
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Thời gian trong ngày</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {overallData.timeOfDayStats.map((p) => (
              <div
                key={p.period}
                className="p-2.5 rounded-lg border bg-card/40 border-border/50 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">
                    {p.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {p.timeRange}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="font-bold text-sm text-foreground">
                    {p.totalHoursFormatted}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {p.sessionsCount} phiên ({p.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2 h-fit">
        <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            <span>Lịch sử các ngày</span>
          </div>
          <div className="flex items-center gap-0.5 text-xs">
              <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
            <PopoverTrigger asChild>
              <Button    variant="ghost"
              size="xs"
              className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground">
                <Calendar1 className="mr-1 h-4 w-4" />
                <span>
                  {startDate ? startDate.toLocaleDateString() : "Ngày bắt đầu"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  if (date && endDate && endDate < date) {
                    setEndDate(undefined);
                  }
                  setOpenStartDate(false);
                }}
                disabled={endDate ? { after: endDate } : undefined}
                className="rounded-lg border bg-white w-fit p-4"
                classNames={{
                  day: "p-1",
                  today: "p-1",
                }}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
          <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
            <PopoverTrigger asChild>
              <Button    variant="ghost"
              size="xs"
              className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground">
                <Calendar1 className="h-4 w-4" />
                <span>
                  {endDate ? endDate.toLocaleDateString() : "Ngày kết thúc"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setOpenEndDate(false);
                }}
                disabled={startDate ? { before: startDate } : undefined}
                className="rounded-lg border bg-white w-fit p-4"
                classNames={{
                  day: "p-1",
                  today: "p-1",
                }}
                locale={vi}
              />
            </PopoverContent>
          </Popover>

          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="xs"
              className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
            >
              Xóa lọc
            </Button>
          )}
          </div>
        </div>

        <div className="space-y-2 w-full">
          {overallData.days.map((day) => {
            const isOpen = !!openDays[day.dateKey];

            return (
              <Collapsible
                key={day.dateKey}
                open={isOpen}
                onOpenChange={() => toggleDay(day.dateKey)}
                className="border border-border/60 rounded-lg overflow-hidden bg-card/40 transition-all hover:border-border"
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full p-3 flex items-center justify-between gap-2 text-left hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar1 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-bold text-[12px]">
                        {day.dateDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium h-5 px-1.5"
                      >
                        {day.totalFocusHours}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {day.totalSessions} phiên
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-foreground" : ""
                        }`}
                      />
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-3 pt-1 space-y-3 border-t h-full! border-border/40 bg-background/50">
                    {day.totalSessions === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        Không có phiên Pomodoro trong ngày này
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Thước đo 24h</span>
                            <span>Hover xem chi tiết</span>
                          </div>

                          <div className="relative h-7 w-full bg-muted/40 rounded border border-border/50 overflow-hidden flex items-center">
                            {rulerHours.map((h) => {
                              const posPercent = (h / 24) * 100;
                              return (
                                <div
                                  key={h}
                                  className="absolute top-0 bottom-0 w-px bg-border/40 pointer-events-none"
                                  style={{ left: `${posPercent}%` }}
                                />
                              );
                            })}

                            {day.sessions.map((s) => {
                              const isHovered = hoveredSessionId === s.id;
                              const blockColor =
                                PERIOD_COLORS[s.period] || "#6366f1";

                              return (
                                <div
                                  key={s.id}
                                  onMouseEnter={() => setHoveredSessionId(s.id)}
                                  onMouseLeave={() => setHoveredSessionId(null)}
                                  className={`absolute top-1 bottom-1 rounded transition-all cursor-pointer flex items-center justify-center group ${
                                    isHovered
                                      ? "ring-2 ring-foreground z-20 brightness-110 scale-y-105"
                                      : "z-10 shadow-2xs"
                                  }`}
                                  style={{
                                    left: `${s.startPercent}%`,
                                    width: `${Math.max(s.widthPercent, 1.8)}%`,
                                    backgroundColor: blockColor,
                                  }}
                                >
                                  <div className="absolute bottom-full mb-2 left-1/2-translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                                    <div className="bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-xl border border-border space-y-0.5">
                                      <div className="text-[8px] text-foreground">
                                        {s.task?.name ?? "Không xác định"}
                                      </div>
                                      <div className="text-[11px] text-muted-foreground">
                                        {s.startLabel} - {s.endLabel} (
                                        {s.focusMinutes}m tập trung)
                                      </div>
                                      {s.pauseCount > 0 && (
                                        <div className="text-[10px] text-amber-500">
                                          Nghỉ {s.pauseCount} lần (
                                          {Math.round(s.pauseSeconds / 60)}m)
                                        </div>
                                      )}
                                    </div>
                                    <div className="w-2 h-2 bg-popover rotate-45 -mt-1 border-r border-b" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="relative h-3 w-full text-[9px] text-muted-foreground font-mono">
                            {rulerHours.map((h) => {
                              const posPercent = (h / 24) * 100;
                              return (
                                <span
                                  key={h}
                                  className="absolute -translate-x-1/2"
                                  style={{ left: `${posPercent}%` }}
                                >
                                  {h < 10 ? `0${h}:00` : `${h}:00`}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 overflow-y-auto h-full min-h-50">
                          {day.sessions.map((session) => {
                            const isHovered = hoveredSessionId === session.id;
                            const isDetailOpen =
                              !!openSessionDetail[session.id];

                            return (
                              <div
                                key={session.id}
                                onMouseEnter={() =>
                                  setHoveredSessionId(session.id)
                                }
                                onMouseLeave={() => setHoveredSessionId(null)}
                                className={`p-2.5 rounded-lg border text-xs transition-all cursor-pointer select-none ${
                                  isHovered || isDetailOpen
                                    ? "border-primary/60 bg-card shadow-2xs"
                                    : "border-border/60 bg-card/50 hover:border-border"
                                }`}
                                onClick={() => toggleSessionDetail(session.id)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-semibold text-xs text-foreground truncate">
                                        {session.task?.name ?? "Không xác định"}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono">
                                      {session.startLabel} — {session.endLabel}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="text-right">
                                      <span className="text-xs font-bold text-primary block">
                                        {session.focusMinutes}m
                                      </span>
                                      <span className="text-[9px] text-muted-foreground">
                                        tập trung
                                      </span>
                                    </div>
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                                        isDetailOpen
                                          ? "rotate-180 text-primary"
                                          : ""
                                      }`}
                                    />
                                  </div>
                                </div>

                                {session.pauseCount > 0 ? (
                                  <div className="text-[10px] text-muted-foreground mt-1 pt-1 border-t border-border/40 flex items-center justify-between">
                                    <span>
                                      Tạm dừng {session.pauseCount} lần{" "}
                                      {formatDuration(session.pauseSeconds)}
                                    </span>
                                    <span>Hiệu suất {session.efficiency}%</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 pt-1 border-t border-border/40">
                                    Tập trung liền mạch 100%
                                  </div>
                                )}

                                {isDetailOpen && (
                                  <div className="mt-2.5 pt-2.5 border-t border-border/50 space-y-2 animate-in fade-in-50 duration-150">
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 border-b border-border/40">
                                      <span className="font-semibold text-foreground">
                                        Chi tiết tiến trình (Progress)
                                      </span>
                                      <span>
                                        {(session.progress ?? []).length} hiệp
                                        ghi nhận
                                      </span>
                                    </div>

                                    {session.progress &&
                                    session.progress.length > 1 ? (
                                      <div className="space-y-1.5 pt-0.5">
                                        {session.progress.map((p, pIdx) => {
                                          const startPauseDate =
                                            p.startPause instanceof Date
                                              ? p.startPause
                                              : new Date(p.startPause);
                                          const pEnd = new Date(
                                            startPauseDate.getTime() +
                                              p.duration,
                                          );
                                          const pStart = new Date(
                                            startPauseDate,
                                          );
                                          return (
                                            <div
                                              key={pIdx}
                                              className="space-y-1"
                                            >
                                              <div className="flex items-center justify-between p-2 rounded-md bg-muted/40 border border-border/40 text-[11px]">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[9px] shrink-0">
                                                    {pIdx + 1}
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-foreground">
                                                      Hiệp {pIdx + 1}:{" "}
                                                    </span>
                                                    <span className="text-muted-foreground font-mono text-[10px]">
                                                      {pStart.toLocaleTimeString(
                                                        "vi-VN",
                                                        {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                          second: "2-digit",
                                                        },
                                                      )}
                                                      {" - "}
                                                      {pEnd.toLocaleTimeString(
                                                        "vi-VN",
                                                        {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                          second: "2-digit",
                                                        },
                                                      )}
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                                                  <Zap className="w-3 h-3" />
                                                  <span>
                                                    {formatDuration(
                                                      p.duration / 1000,
                                                    )}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 p-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                        <span>
                                          Phiên tập trung hoàn thành liền mạch,
                                          không có lần tạm dừng nào
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
