"use client"

import { IPomodoroModel } from "../model/pomodoro.model"
import { PomodoroSessionCard } from "./PomodoroCard.component"


export function PomodoroSessionList({ sessions }: { sessions: IPomodoroModel[] }) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có phiên Pomodoro nào hôm nay
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {sessions
        .slice()
        .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
        .map((s) => (
          <PomodoroSessionCard key={s.id} session={s} />
        ))}
    </div>
  )
}