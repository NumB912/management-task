"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { PomodoroStatsSummary } from "../../feature/data/promodoMockData";
import { Lightbulb, Target, CheckCircle, Clock, ListTodo } from "lucide-react";

interface PomodoroTaskBreakdownProps {
  stats: PomodoroStatsSummary;
}

export function PomodoroTaskBreakdown({ stats }: PomodoroTaskBreakdownProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      {/* 1. Phân bổ thời gian theo nhiệm vụ */}
      <Card className="border border-border/60 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Phân bổ theo nhiệm vụ</CardTitle>
                <CardDescription className="text-xs">Top các tác vụ được tập trung nhiều nhất</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px] font-normal">
              {stats.taskBreakdown.length} tác vụ
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {stats.taskBreakdown.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Chưa có tác vụ nào trong khoảng thời gian này
            </div>
          ) : (
            stats.taskBreakdown.map((item, idx) => {
              const h = Math.floor(item.minutes / 60);
              const m = item.minutes % 60;
              const formattedDuration = h > 0 ? `${h}h ${m}m` : `${m}m`;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[70%]">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium truncate text-foreground" title={item.task}>
                        {item.task}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                      <span>{formattedDuration}</span>
                      <span className="font-semibold text-foreground">{item.percentage}%</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 2. Gợi ý & Đánh giá năng suất */}
      <Card className="border border-border/60 shadow-xs flex flex-col justify-between">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Đánh giá & Năng suất</CardTitle>
                <CardDescription className="text-xs">Phân tích nhịp độ và khung giờ làm việc</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Khung giờ vàng</span>
              </div>
              <div className="font-semibold text-xs text-foreground">
                {stats.productivityInsight.goldenHour}
              </div>
            </div>

            <div className="p-2.5 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ngày năng suất nhất</span>
              </div>
              <div className="font-semibold text-xs text-foreground">
                {stats.productivityInsight.bestDay}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-muted-foreground leading-relaxed">
                {stats.productivityInsight.message}
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground border-t">
            <span>Thời lượng phiên TB:</span>
            <span className="font-semibold text-foreground">
              {stats.productivityInsight.averageSessionMinutes} phút / phiên
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
