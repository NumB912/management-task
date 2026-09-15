
import { PauseChartPoint } from "../model/charPause";
import { ITime } from "../model/type/type";

export const TIME_OPTIONS: {
  title: ITime,
  value: number
}[] = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = String((i % 2) * 30).padStart(2, "0");
  return {
    title: `${h}:${m}` as ITime,
    value: i * 30 * 60,
  };
});

export function todayAt(h: number, m: number, s = 0): Date {
  const d = new Date()
  d.setHours(h, m, s, 0)
  return d
}

export interface PauseEvent {
  duration: number 
  startPause: Date | string
}
export function transformPauseEventsToChartData(
  events: PauseEvent[]
): PauseChartPoint[] {
  return events.map((e, idx) => {
    const durationSec = e.duration > 10000 ? Math.round(e.duration / 1000) : e.duration
    const date = new Date(e.startPause)
    return {
      label: `H${idx + 1} (${date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })})`,
      minutes: Math.round((durationSec / 60) * 10) / 10,
      seconds: durationSec,
    }
  })
}