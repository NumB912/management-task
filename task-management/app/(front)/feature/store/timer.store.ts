import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ITaskModel } from "../../model";

export type TimerMode = "work" | "break";
export type TimerStatus = "pause" | "progress" | "end" | "complete";

interface Duration {
  minutes: number;
  seconds: number;
}

interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  totalSeconds: number;
  intervalId: ReturnType<typeof setInterval> | null;
  onComplete: ((startDurations: IStartDuration[]) => void) | null;
  durations: Record<TimerMode, Duration>;
  minutes: number;
  seconds: number;
  taskFocus: ITaskModel | null;
  startDurations: IStartDuration[];
  isConfirmEndOpen: boolean;
  elapsedWorkMinutes: number;
  elapsedWorkSeconds: number;
  tickStartedAt: number | null;
  tickInitialSeconds: number;

  setTaskFocus: (task: ITaskModel) => void;
  calculateElapsedWorkSeconds: () => {seconds:number,minutes:number};
  switchMode: (mode: TimerMode) => void;
  setMinutes: (minutes: number) => void;
  setSeconds: (seconds: number) => void;
  setDuration: (minutes: number, seconds: number) => void;
  start: (onComplete?: () => void) => void;
  setOnComplete: (
    fn: ((startDurations: IStartDuration[]) => void) | null,
  ) => void;
  pause: () => void;
  reset: () => void;
  stop: () => void;
  next:()=>void;
  setIsOpenEnd: (isOpenEnd: boolean) => void;
  confirmEnd: () => void;
  tick: () => void;
  syncTick: () => void;
}

const DEFAULT_DURATIONS: Record<TimerMode, Duration> = {
  work: { minutes: 5, seconds: 0 },
  break: { minutes: 5, seconds: 0 },
};
export type IStartDuration = {
  startPause: Date;
  duration: number;
};

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
  | "elapsedWorkSeconds"
> = {
  mode: "work",
  status: "end",
  taskFocus: null,
  intervalId: null,
  onComplete: null,
  durations: DEFAULT_DURATIONS,
  totalSeconds:
    DEFAULT_DURATIONS.work.minutes * 60 + DEFAULT_DURATIONS.work.seconds,
  minutes: DEFAULT_DURATIONS.work.minutes,
  seconds: DEFAULT_DURATIONS.work.seconds,
  startDurations: [],
  isConfirmEndOpen: false,
  elapsedWorkMinutes: 0,
  elapsedWorkSeconds: 0,
  tickStartedAt: null,
  tickInitialSeconds:
    DEFAULT_DURATIONS.work.minutes * 60 + DEFAULT_DURATIONS.work.seconds,
};
const closeLastSegment = (
  list: IStartDuration[],
  endMs: number,
): IStartDuration[] => {
  const i = list.length - 1;
  if (i < 0 || list[i].duration > 0) return list;
  const startMs = new Date(list[i].startPause).getTime();
  return list.map((d, idx) =>
    idx === i ? { ...d, duration: Math.max(endMs - startMs, 0) } : d,
  );
};
export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      switchMode: (mode) => {
        const { status, intervalId, durations } = get();

        if (status === "progress") return;
        if (intervalId) clearInterval(intervalId);

        const d = durations[mode];
        set({
          mode,
          status: "end",
          intervalId: null,
          minutes: d.minutes,
          seconds: d.seconds,
          totalSeconds: d.minutes * 60 + d.seconds,
          tickStartedAt: null,
          tickInitialSeconds: d.minutes * 60 + d.seconds,
        });
      },
      setOnComplete(fn) {
        set({ onComplete: fn });
      },
      setDuration: (minutesArg, secondsArg) => {
        const { status, mode, durations } = get();
        if (status === "progress") return;
        const clampedMinutes = Math.max(minutesArg, 5);
        const clampedSeconds = Math.min(Math.max(secondsArg, 0), 59);
        set({
          minutes: clampedMinutes,
          seconds: clampedSeconds,
          totalSeconds: clampedMinutes * 60 + clampedSeconds,
          durations: {
            ...durations,
            [mode]: { minutes: clampedMinutes, seconds: clampedSeconds },
          },
        });
      },

      setMinutes(minutesArg) {
        const { status, seconds, mode, durations } = get();
        if (status === "progress") return;
        const clampedMinutes = Math.max(minutesArg, 0);
        set({
          minutes: clampedMinutes,
          totalSeconds: clampedMinutes * 60 + seconds,
          durations: {
            ...durations,
            [mode]: { minutes: clampedMinutes, seconds },
          },
        });
      },

      setTaskFocus(task) {
        set({ taskFocus: task });
      },

      calculateElapsedWorkSeconds() {
        const { startDurations, mode, status } = get();
        let totalElapsed = 0;
        for (const entry of startDurations) {
          totalElapsed += entry.duration;
        }
        if (
          status === "progress" &&
          mode === "work" &&
          startDurations.length > 0
        ) {
          const last = startDurations[startDurations.length - 1];
          const currentElapsed = Date.now() - last.startPause.getTime();
          totalElapsed += currentElapsed;
        }

        const minutes = Math.floor(totalElapsed / 60000);
        const seconds = Math.floor((totalElapsed % 60000) / 1000);
        set({ elapsedWorkMinutes: minutes, elapsedWorkSeconds: seconds });
        return {minutes,seconds};
      },

      setSeconds(secondsArg) {
        const { status, minutes, mode, durations } = get();
        if (status === "progress") return;
        const clampedSeconds = Math.min(Math.max(secondsArg, 0), 59);
        set({
          seconds: clampedSeconds,
          totalSeconds: minutes * 60 + clampedSeconds,
          durations: {
            ...durations,
            [mode]: { minutes, seconds: clampedSeconds },
          },
        });
      },

      start: (onComplete) => {
        const {
          intervalId,
          totalSeconds,
          onComplete: existing,
          startDurations,
          mode,
        } = get();
        if (intervalId || totalSeconds <= 0) return;
        const nextStartDurations =
          mode === "work"
            ? [...startDurations, { duration: 0, startPause: new Date() }]
            : startDurations;

        set({
          status: "progress",
          onComplete: onComplete ?? existing,
          tickStartedAt: Date.now(),
          tickInitialSeconds: totalSeconds,
          startDurations: nextStartDurations,
        });
      },

      pause: () => {
        const { status, mode, startDurations, tickStartedAt, tickInitialSeconds } =
          get();
        if (status !== "progress" || tickStartedAt === null) return;
 
        const now = Date.now();
        const remaining = Math.max(
          tickInitialSeconds - (now - tickStartedAt) / 1000,
          0,
        );
     if (remaining <= 0) {
          get().tick();
          return;
        }
 
        let next = startDurations;
        if (mode === "work" && startDurations.length > 0) {
          const last = startDurations[startDurations.length - 1];
          const elapsed = now - new Date(last.startPause).getTime();
          next =
            elapsed >= 1000
              ? closeLastSegment(startDurations, now)
              : startDurations.slice(0, -1);
        }
 
        set({
          status: "pause",
          intervalId: null,
          tickStartedAt: null,
          totalSeconds: remaining,
          tickInitialSeconds: remaining,
          startDurations: next,
        });
      },
      setIsOpenEnd: (open) => {
        set({ isConfirmEndOpen: open });
      },
      reset: () => {
        const { minutes, seconds,intervalId } = get();
        if (intervalId) clearInterval(intervalId);
        set({
          status: "end",
          intervalId: null,
          totalSeconds: minutes * 60 + seconds,
          tickStartedAt: null,
          tickInitialSeconds: minutes * 60 + seconds,
          startDurations: [],
        });
      },

      tick: () => {
        const {
          status,
          onComplete,
          mode,
          durations,
          tickStartedAt,
          tickInitialSeconds,
          startDurations,
        } = get();
        if (status !== "progress" || tickStartedAt === null) return;
 
        const endAt = tickStartedAt + tickInitialSeconds * 1000;
        const remaining = Math.max((endAt - Date.now()) / 1000, 0);
 
        if (remaining > 0) {
          set({ totalSeconds: remaining });
          return;
        }
 
        if (mode === "work" && startDurations.length > 0) {
          const finalized = closeLastSegment(startDurations, endAt);
          onComplete?.(finalized);
        }
 
        const nextMode: TimerMode = mode === "work" ? "break" : "work";
        const d = durations[nextMode];
        const nextTotal = d.minutes * 60 + d.seconds;
 
        set({
          mode: nextMode,
          status: "end",
          minutes: d.minutes,
          seconds: d.seconds,
          totalSeconds: nextTotal,
          tickInitialSeconds: nextTotal,
          tickStartedAt: null,
          intervalId: null,
          startDurations: [],
          elapsedWorkMinutes: 0,
          elapsedWorkSeconds: 0,
        });
      },
      syncTick: () => {
        const { status } = get();
        if (status === "progress") {
          get().tick();
        }
      },
    next: () => {
      const {switchMode,mode,reset,confirmEnd} = get()
      if (mode == "work") {
        confirmEnd()
        switchMode("break");
      } else {
        switchMode("work");
      }
      reset();
    },
      stop() {
        const { calculateElapsedWorkSeconds,confirmEnd,totalSeconds } = get();
        const minute = calculateElapsedWorkSeconds().minutes
        const second = calculateElapsedWorkSeconds().seconds
        const clapTotalSecond = second+minute*60
        if (minute <= 5 || clapTotalSecond<=totalSeconds) {
          set({ isConfirmEndOpen: true });
          return;
        }
        confirmEnd()
      },

      confirmEnd() {
        const {
          onComplete,
          intervalId,
          minutes,
          seconds,
          startDurations,
          calculateElapsedWorkSeconds,
        } = get();
        const elapsedMinutes = calculateElapsedWorkSeconds().minutes;
        if (intervalId) clearInterval(intervalId);
        if (elapsedMinutes >= 5) {
          onComplete?.(startDurations);
        }

        set({
          status: "end",
          intervalId: null,
          totalSeconds: minutes * 60 + seconds,
          tickStartedAt: null,
          tickInitialSeconds: minutes * 60 + seconds,
          startDurations: [],
          isConfirmEndOpen: false,
          elapsedWorkMinutes: 0,
        });
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
        startDurations: state.startDurations,
      }),

      onRehydrateStorage(state) {
        if (state && state.startDurations.length > 0) {
          const last = state.startDurations[state.startDurations.length - 1];
          if (last.duration === 0) {
            const now = Date.now();
            const elapsed = now - new Date(last.startPause).getTime();
            state.startDurations = [
              ...state.startDurations.slice(0, -1),
              { ...last, duration: elapsed },
            ];
          }
        }
      },
    },
  ),
);
