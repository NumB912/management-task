import { IPromodoroModel } from "../model/promodo.model"

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.round((seconds % 60*100))/100
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function formatTimer(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${String(Math.floor(h%12==0?12:h%12)).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12?"PM":"AM"}`;
}

export function getTotalPauseDuration(progress: IPromodoroModel["progress"]): number {
  return progress.reduce((sum, p) => sum + p.duration, 0)
}
