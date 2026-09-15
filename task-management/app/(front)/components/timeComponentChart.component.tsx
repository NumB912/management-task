"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { PauseChartPoint } from "../model/charPause"

const chartConfig = {
  minutes: {
    label: "Thời gian làm việc (phút)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface PauseDurationChartProps {
  data: PauseChartPoint[]
  onBarClick?: (index: number) => void
  openSessionDetail?: (index: number) => void
  activeIndex?: number | null
}

export function PauseDurationChart({
  data,
  onBarClick,
  openSessionDetail,
  activeIndex,
}: PauseDurationChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          label={{ value: "phút", angle: -90, position: "insideLeft" }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => {
                const seconds = item.payload.seconds
                return [`${value} phút (${seconds}s)`, "Thời lượng"]
              }}
            />
          }
        />
        <Bar
          dataKey="minutes"
          fill="var(--color-minutes)"
          radius={4}
          className="cursor-pointer"
          onClick={(_, index) => {
            if (typeof index === "number") {
              onBarClick?.(index)
              openSessionDetail?.(index)
            }
          }}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                activeIndex === index
                  ? "hsl(var(--primary))"
                  : "var(--color-minutes)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
