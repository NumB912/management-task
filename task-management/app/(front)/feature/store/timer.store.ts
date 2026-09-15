import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ITaskModel } from "../../model"

export type TimerMode = "work" | "break"
export type TimerStatus = "pause" | "progress" | "end" | "complete"

interface Duration {
  minutes: number
  seconds: number
}

interface TimerState {
  mode: TimerMode
  status: TimerStatus
  totalSeconds: number
  intervalId: ReturnType<typeof setInterval> | null
  onComplete: ((startDurations: IStartDuration[]) => void) | null
  durations: Record<TimerMode, Duration>
  minutes: number
  seconds: number
  taskFocus: ITaskModel | null,
  startDurations: IStartDuration[]
  isConfirmEndOpen: boolean
  elapsedWorkMinutes: number
  tickStartedAt: number | null
  tickInitialSeconds: number

  setTaskFocus: (task: ITaskModel) => void,
  calculateElapsedWorkMinutes: () => number

  switchMode: (mode: TimerMode) => void
  setMinutes: (minutes: number) => void
  setSeconds: (seconds: number) => void
  setDuration: (minutes: number, seconds: number) => void
  start: (onComplete?: () => void) => void
  setOnComplete: (fn: ((startDurations: IStartDuration[]) => void) | null) => void
  pause: () => void
  reset: () => void
  end: () => void
  confirmEnd: () => void
  cancelEnd: () => void
  tick: () => void
  syncTick: () => void
}

const DEFAULT_DURATIONS: Record<TimerMode, Duration> = {
  work: { minutes: 5, seconds: 0 },
  break: { minutes: 5, seconds: 0 },
}
export type IStartDuration = {
  startPause: Date,
  duration: number
}


const initialState: Pick<
  TimerState,
  | "durations"
  | "mode"
  | "status"
  | "intervalId"
  | "onComplete"
  | "totalSeconds"
  | "minutes"
  | "seconds"
  | "taskFocus"
  | "startDurations"
  | "isConfirmEndOpen"
  | "elapsedWorkMinutes"
  | "tickStartedAt"
  | "tickInitialSeconds"
> = {
  mode: "work",
  status: "end",
  taskFocus: null,
  intervalId: null,
  onComplete: null,
  durations: DEFAULT_DURATIONS,
  totalSeconds: DEFAULT_DURATIONS.work.minutes * 60 + DEFAULT_DURATIONS.work.seconds,
  minutes: DEFAULT_DURATIONS.work.minutes,
  seconds: DEFAULT_DURATIONS.work.seconds,
  startDurations: [],
  isConfirmEndOpen: false,
  elapsedWorkMinutes: 0,
  tickStartedAt: null,
  tickInitialSeconds: DEFAULT_DURATIONS.work.minutes * 60 + DEFAULT_DURATIONS.work.seconds,
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...initialState,

      switchMode: (mode) => {
        const { status, intervalId, durations } = get()

        if (status === "progress") return
        if (intervalId) clearInterval(intervalId)

        const d = durations[mode]
        set({
          mode,
          status: "end",
          intervalId: null,
          minutes: d.minutes,
          seconds: d.seconds,
          totalSeconds: d.minutes * 60 + d.seconds,
          tickStartedAt: null,
          tickInitialSeconds: d.minutes * 60 + d.seconds,
        })
      },
      setOnComplete(fn) {
        set({ onComplete: fn })
      },
      setDuration: (minutesArg, secondsArg) => {
        const { status, mode, durations } = get()
        if (status === "progress") return
        const clampedMinutes = Math.max(minutesArg, 5)
        const clampedSeconds = Math.min(Math.max(secondsArg, 0), 59)
        set({
          minutes: clampedMinutes,
          seconds: clampedSeconds,
          totalSeconds: clampedMinutes * 60 + clampedSeconds,
          durations: {
            ...durations,
            [mode]: { minutes: clampedMinutes, seconds: clampedSeconds },
          },
        })
      },

      setMinutes(minutesArg) {
        const { status, seconds, mode, durations } = get()
        if (status === "progress") return
        const clampedMinutes = Math.max(minutesArg, 0)
        set({
          minutes: clampedMinutes,
          totalSeconds: clampedMinutes * 60 + seconds,
          durations: {
            ...durations,
            [mode]: { minutes: clampedMinutes, seconds },
          },
        })
      },

      setTaskFocus(task) {
        set({ taskFocus: task })
      },

      calculateElapsedWorkMinutes() {
        const { startDurations, mode, status } = get()
        let totalElapsed = 0

        for (const entry of startDurations) {
          totalElapsed += entry.duration
        }

        if (status === "progress" && mode === "work" && startDurations.length > 0) {
          const last = startDurations[startDurations.length - 1]
          const currentElapsed = Date.now() - last.startPause.getTime()
          totalElapsed += currentElapsed
        }

        const minutes = Math.floor(totalElapsed / 60000)
        set({ elapsedWorkMinutes: minutes })
        return minutes
      },

      setSeconds(secondsArg) {
        const { status, minutes, mode, durations } = get()
        if (status === "progress") return
        const clampedSeconds = Math.min(Math.max(secondsArg, 0), 59)
        set({
          seconds: clampedSeconds,
          totalSeconds: minutes * 60 + clampedSeconds,
          durations: {
            ...durations,
            [mode]: { minutes, seconds: clampedSeconds },
          },
        })
      },

      start: (onComplete) => {
        const { intervalId, totalSeconds, onComplete: existing, startDurations, mode } = get()
        if (intervalId || totalSeconds <= 0) return
        const nextStartDurations =
          mode === "work"
            ? [...startDurations, { duration: 0, startPause: new Date() }]
            : startDurations

        set({
          status: "progress",
          onComplete: onComplete ?? existing,
          tickStartedAt: Date.now(),
          tickInitialSeconds: totalSeconds,
          startDurations: nextStartDurations,
        })
      },

      pause: () => {
        const {startDurations, status, mode } = get()
        let updatedDurations = startDurations
        if (status === "progress" && startDurations.length > 0) {
          const last = startDurations[startDurations.length - 1]
          const elapsed = Date.now() - last.startPause.getTime()
          if (elapsed >= 1000 && mode == "work") {
            updatedDurations = [
              ...startDurations.slice(0, -1),
              { ...last, duration: elapsed },
            ]
          }
        }
        set({
          status: "pause",
          intervalId: null,
          tickStartedAt: null,
          startDurations: updatedDurations,
        })
      },

      reset: () => {
        const {  minutes, seconds } = get()
        set({
          status: "end",
          intervalId: null,
          totalSeconds: minutes * 60 + seconds,
          tickStartedAt: null,
          tickInitialSeconds: minutes * 60 + seconds,
          startDurations: [],
        })
      },

      tick: () => {
        const { onComplete, mode, minutes, seconds, tickStartedAt, tickInitialSeconds, startDurations,totalSeconds } = get()
        if (tickStartedAt === null) return
        const elapsedSeconds = (Date.now() - tickStartedAt) / 1000
        const newTotalSeconds = Math.max(tickInitialSeconds - elapsedSeconds, 0)
        if (newTotalSeconds <= 0) {
          if (mode === "work") {
            const now = new Date()
            const lastIndex = startDurations.length - 1
            const lastDuration = now.getTime() - startDurations[lastIndex].startPause.getTime()
            const last: IStartDuration[] = startDurations.map((duration, index) =>
              index === lastIndex
                ? { ...duration, duration: lastDuration }
                : duration
            )
            set({ totalSeconds: 0, status: "complete" })
            onComplete?.(last)
            set({ startDurations: [] })
          }

          set({
            mode: mode === "break" ? "work" : "break",
            minutes: minutes,
            seconds: seconds,
            totalSeconds: minutes * 60 + seconds,
            status: "end",
            intervalId: null,
            tickStartedAt: null,
            tickInitialSeconds: minutes * 60 + seconds,
          })
          return
        }

        set({ totalSeconds: newTotalSeconds })
      },
      syncTick: () => {
        const { status } = get()
        if (status === "progress") {
          get().tick()
        }
      },

      end() {
        const { calculateElapsedWorkMinutes } = get()
        const elapsedMinutes = calculateElapsedWorkMinutes()
        if (elapsedMinutes >= 5) {
          set({ isConfirmEndOpen: true })
          return
        }
        get().confirmEnd()
      },

      confirmEnd() {
        const { onComplete, intervalId, minutes, seconds } = get()
        if (intervalId) clearInterval(intervalId)
          
        onComplete?.(this.startDurations)
        set({
          status: "end",
          intervalId: null,
          totalSeconds: minutes * 60 + seconds,
          tickStartedAt: null,
          tickInitialSeconds: minutes * 60 + seconds,
          startDurations: [],
          isConfirmEndOpen: false,
          elapsedWorkMinutes: 0
        })
      },

      cancelEnd() {
        set({ isConfirmEndOpen: false, elapsedWorkMinutes: 0 })
      },
    }),
    {
      name: "pomodoro-timer",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        totalSeconds: state.totalSeconds,
        minutes: state.minutes,
        seconds: state.seconds,
        durations: state.durations,
        startDurations: state.startDurations
      }),

      onRehydrateStorage(state) {
        if (state && state.startDurations.length > 0) {
          const last = state.startDurations[state.startDurations.length - 1]
          if (last.duration === 0) {
            const now = Date.now()
            const elapsed = now - new Date(last.startPause).getTime()
            state.startDurations = [
              ...state.startDurations.slice(0, -1),
              { ...last, duration: elapsed },
            ]
          }
        }
      },
    }
  )
)
