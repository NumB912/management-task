"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { BarChart3 } from "lucide-react";
import { TimeRange } from "../../feature/data/promodoMockData";

const chartConfig = {
  focusMinutes: {
    label: "Thời gian tập trung",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface PomodoroFocusChartProps {
  data: {
    label: string;
    focusMinutes: number;
    sessions: number;
  }[];
  timeRange: TimeRange;
}

export function PomodoroFocusChart({ data, timeRange }: PomodoroFocusChartProps) {
  const title =
    timeRange === "today"
      ? "Thời gian tập trung theo khung giờ hôm nay"
      : timeRange === "week"
      ? "Thời gian tập trung theo các ngày trong tuần"
      : "Thời gian tập trung theo tuần trong tháng";

  const description =
    timeRange === "today"
      ? "Số phút tập trung trong các khoảng thời gian sáng - chiều - tối"
      : timeRange === "week"
      ? "Biểu đồ so sánh thời lượng làm việc từ Thứ Hai đến Chủ Nhật"
      : "Tổng thời gian tập trung phân bổ qua 4 tuần của tháng";

  const maxMinutes = Math.max(...data.map((d) => d.focusMinutes), 60);

  return (
    <Card className="border border-border/60 shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              unit="m"
              domain={[0, Math.ceil(maxMinutes / 30) * 30]}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as {
                  label: string;
                  focusMinutes: number;
                  sessions: number;
                };
                const h = Math.floor(point.focusMinutes / 60);
                const m = point.focusMinutes % 60;
                const formattedTime = h > 0 ? `${h}h ${m}m` : `${m} phút`;

                return (
                  <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
                    <div className="font-semibold text-foreground mb-1">{point.label}</div>
                    <div className="flex items-center justify-between gap-4 text-muted-foreground">
                      <span>Tập trung:</span>
                      <span className="font-bold text-primary">{formattedTime}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-muted-foreground mt-0.5">
                      <span>Số phiên:</span>
                      <span className="font-medium text-foreground">{point.sessions} phiên</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="focusMinutes"
              fill="var(--color-primary, #6366f1)"
              radius={[6, 6, 2, 2]}
              maxBarSize={44}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
