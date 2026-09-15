"use client"

import { useState, useMemo } from "react"
import { Clock, Pause, CheckCircle2, Zap, Timer, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IPromodoroModel } from "../model/promodo.model"
import { formatDuration, getTotalPauseDuration } from "../utils/formatTimer"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { pomodoroToTimelineData } from "../model/charPause"
import { getSessionFocusMinutes } from "../feature/data/promodoMockData"
import { PauseDurationChart } from "./timeComponentChart.component"
import { transformPauseEventsToChartData } from "../utils/timeOption.utils"

interface PomodoroSessionCardProps {
  session: IPromodoroModel
}

interface ProgressIntervalDetail {
  index: number
  start: Date
  end: Date
  durationSec: number
  pauseAfterSec?: number
}

export function PomodoroSessionCard({ session }: PomodoroSessionCardProps) {
  const [isOpenDetails, setIsOpenDetails] = useState(false)
  const [selectedIntervalIndex, setSelectedIntervalIndex] = useState<number | null>(null)

  const progressDetails = useMemo<ProgressIntervalDetail[]>(() => {
    if (!session.progress || session.progress.length === 0) return []

    return session.progress.map((p, idx) => {
      const durationSec = p.duration > 10000 ? Math.round(p.duration / 1000) : p.duration
      const start = new Date(p.startPause)
      const end = new Date(start.getTime() + durationSec * 1000)

      let pauseAfterSec: number | undefined = undefined
      if (idx < session.progress.length - 1) {
        const nextStart = new Date(session.progress[idx + 1].startPause)
        const gapMs = nextStart.getTime() - end.getTime()
        if (gapMs > 0) {
          pauseAfterSec = Math.round(gapMs / 1000)
        }
      }

      return {
        index: idx + 1,
        start,
        end,
        durationSec,
        pauseAfterSec,
      }
    })
  }, [session.progress])

  const totalFocusFromProgress = useMemo(() => {
    return progressDetails.reduce((sum, item) => sum + item.durationSec, 0)
  }, [progressDetails])

  const totalPauseFromGaps = useMemo(() => {
    return progressDetails.reduce((sum, item) => sum + (item.pauseAfterSec ?? 0), 0)
  }, [progressDetails])

  const pauseIntervalCount = useMemo(() => {
    return progressDetails.filter((item) => (item.pauseAfterSec ?? 0) > 0).length
  }, [progressDetails])

  const focusMins = getSessionFocusMinutes(session)
  const legacyTotalPause = getTotalPauseDuration(session.progress)

  const effectiveFocusSeconds = totalFocusFromProgress > 0
    ? totalFocusFromProgress
    : focusMins * 60

  const effectivePauseSeconds = totalPauseFromGaps > 0
    ? totalPauseFromGaps
    : legacyTotalPause

  const effectivePauseCount = totalPauseFromGaps > 0
    ? pauseIntervalCount
    : session.progress.length

  const totalSeconds = session.progress.reduce((prev,cur)=>prev+cur.duration,0)

  const startLabel = new Date(session.start).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const dateLabel = new Date(session.start).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  return (
    <Card className="border border-border/60 shadow-xs hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            {session.task && (
              <p className="mt-0.5 text-xs text-muted-foreground font-normal">{session.task.name}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="gap-1 text-xs font-normal">
          <Clock className="h-3 w-3" />
          {dateLabel} · {startLabel}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 w-full">
        <div className="grid grid-cols-3 gap-2 rounded-lg border p-3 text-center bg-muted/20">
          <div>
            <p className="text-[11px] text-muted-foreground">Tổng thời gian</p>
            <p className="text-base font-bold text-foreground mt-0.5">
              {formatDuration(totalSeconds)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">
              <Zap className="mr-1 inline h-3 w-3 text-emerald-500" />
              Tập trung
            </p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatDuration(effectiveFocusSeconds)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">
              <Pause className="mr-1 inline h-3 w-3 text-amber-500" />
              {effectivePauseCount} lần tạm dừng
            </p>
            <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {formatDuration(effectivePauseSeconds)}
            </p>
          </div>
        </div>

        {/* Khu vực Progress & Biểu đồ với tương tác click */}
        {session.progress && session.progress.length > 0 ? (
          <div className="space-y-2.5">
            <div
              className="flex items-center justify-between cursor-pointer group select-none p-1.5 -mx-1.5 rounded-lg hover:bg-muted/40 transition-colors"
              onClick={() => setIsOpenDetails((prev) => !prev)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  Tiến trình làm việc ({progressDetails.length} hiệp)
                </span>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                  {isOpenDetails ? "Click để thu gọn" : "Click xem chi tiết"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground group-hover:text-foreground"
                aria-label="Toggle progress details"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isOpenDetails && "rotate-180"
                  )}
                />
              </Button>
            </div>

            <div className="h-[180px] w-full border rounded-lg p-2 bg-background">
              <PauseDurationChart
                data={transformPauseEventsToChartData(session.progress)}
                activeIndex={selectedIntervalIndex}
                onBarClick={(idx: number) => {
                  setSelectedIntervalIndex(idx)
                  setIsOpenDetails(true)
                }}
              />
            </div>

            {/* Chi tiết từng hiệp làm việc và khoảng nghỉ khi mở rộng */}
            {isOpenDetails && (
              <div className="rounded-lg border bg-muted/20 p-3 space-y-2.5 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/50 text-[11px] text-muted-foreground">
                  <span className="font-medium">Chi tiết từng hiệp làm việc & khoảng nghỉ</span>
                  <span>
                    {progressDetails.length} hiệp
                    {effectivePauseCount > 0 ? ` · ${effectivePauseCount} lần nghỉ` : ""}
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {progressDetails.map((item, idx) => {
                    const isSelected = selectedIntervalIndex === idx
                    return (
                      <div key={idx} className="space-y-1.5">
                        {/* Thẻ hiệp làm việc */}
                        <div
                          onClick={() => setSelectedIntervalIndex(isSelected ? null : idx)}
                          className={cn(
                            "p-2.5 rounded-lg border text-xs cursor-pointer transition-all",
                            isSelected
                              ? "border-primary/80 bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                              : "border-border/60 bg-card hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {item.index}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  <span>Hiệp {item.index}</span>
                                  <span className="text-[10px] text-muted-foreground font-normal">
                                    ({item.start.toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })}
                                    {" → "}
                                    {item.end.toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })})
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                                <Zap className="w-3.5 h-3.5" />
                                <span>{formatDuration(item.durationSec)}</span>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                                  isSelected && "rotate-180 text-primary"
                                )}
                              />
                            </div>
                          </div>

                          {/* Chi tiết mở rộng khi click vào item */}
                          {isSelected && (
                            <div className="mt-2.5 pt-2.5 border-t border-border/50 space-y-2 animate-in fade-in-50 duration-150">
                              <div className="grid grid-cols-3 gap-2 p-2 rounded-md bg-background/80 border border-border/50 text-center">
                                <div>
                                  <p className="text-[10px] text-muted-foreground">Bắt đầu</p>
                                  <p className="font-semibold text-foreground text-[11px] mt-0.5">
                                    {item.start.toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">Kết thúc</p>
                                  <p className="font-semibold text-foreground text-[11px] mt-0.5">
                                    {item.end.toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">Tỷ lệ phiên</p>
                                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px] mt-0.5">
                                    {effectiveFocusSeconds > 0
                                      ? `${Math.min(100, Math.round((item.durationSec / effectiveFocusSeconds) * 100))}%`
                                      : "100%"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                                <span>Thời lượng chính xác:</span>
                                <span className="font-mono font-medium text-foreground">
                                  {item.durationSec}s ({formatDuration(item.durationSec)})
                                </span>
                              </div>

                              {item.pauseAfterSec !== undefined && item.pauseAfterSec > 0 ? (
                                <div className="flex items-center justify-between p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">
                                  <div className="flex items-center gap-1.5">
                                    <Pause className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>Tạm dừng nghỉ sau hiệp này:</span>
                                  </div>
                                  <span className="font-bold">{formatDuration(item.pauseAfterSec)}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30 border border-border/40 text-[11px] text-muted-foreground">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span>
                                    {idx === progressDetails.length - 1
                                      ? "Hoàn tất phiên Pomodoro"
                                      : "Tiếp tục sang hiệp sau liền mạch"}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Khoảng nghỉ giữa các hiệp */}
                        {item.pauseAfterSec !== undefined && item.pauseAfterSec > 0 && (
                          <div className="flex items-center gap-2 pl-4 py-1 text-[11px] text-amber-600 dark:text-amber-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <Pause className="w-3 h-3" />
                            <span>Tạm dừng nghỉ: {formatDuration(item.pauseAfterSec)}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground bg-emerald-500/5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            Không có lần tạm dừng nào — hoàn thành liền mạch
          </div>
        )}
      </CardContent>
    </Card>
  )
}
