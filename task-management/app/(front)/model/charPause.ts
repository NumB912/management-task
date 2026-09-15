import { IPomodoro } from "./promodo.model"

export interface PauseChartPoint {
  label: string  
  minutes: number 
  seconds: number 
}

export interface PauseRangePoint {
  label: string       
  startLabel: string   
  endLabel: string     
  range: [number, number]
}
function minutesSinceMidnight(date: Date) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
}

export function pomodoroToTimelineData(pomo: IPomodoro): PauseRangePoint[] {
  return pomo.progress
    .map(({ startPause, duration }) => {
      const start = new Date(startPause)
      const end = new Date(start.getTime() + duration * 1000)

      const fmt = (d: Date) =>
        d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

      return {
        label: `${fmt(start)} → ${fmt(end)}`,
        startLabel: fmt(start),
        endLabel: fmt(end),
        range: [minutesSinceMidnight(start), minutesSinceMidnight(end)] as [number, number],
      }
    })
    .sort((a, b) => a.range[0] - b.range[0])
}