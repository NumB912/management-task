import { useCallback } from "react"
import { useShallow } from "zustand/react/shallow"
import { useTimerStore } from "../../store/timer.store"

const formatTime = (value: number) => value.toString().padStart(2, "0")

export const useTimer = () => {
  const {
    mode,
    totalSeconds,
    status,
    switchMode,
    setDuration,
    start,
    pause,
    reset,
    end,
    confirmEnd,
    cancelEnd,
    setMinutes,
    setSeconds,
    minutes,
    seconds,
    durations,
    startDurations,
    setOnComplete,
    isConfirmEndOpen,
    elapsedWorkMinutes,
sysnTick
  } = useTimerStore(
    useShallow((state) => ({
      mode: state.mode,
      totalSeconds: state.totalSeconds,
      status: state.status,
      switchMode: state.switchMode,
      setDuration: state.setDuration,
      start: state.start,
      pause: state.pause,
      reset: state.reset,
      end: state.end,
      confirmEnd: state.confirmEnd,
      cancelEnd: state.cancelEnd,
      setMinutes: state.setMinutes,
      setSeconds: state.setSeconds,
      minutes: state.minutes,
      seconds: state.seconds,
      durations: state.durations,
      startDurations:state.startDurations,
      setOnComplete: state.setOnComplete,
      isConfirmEndOpen: state.isConfirmEndOpen,
      elapsedWorkMinutes: state.elapsedWorkMinutes,
      sysnTick:state.syncTick
    })),
  )

  const toggle = useCallback(() => {
    if (status === "complete") {
      reset()
      return
    }
    status === "progress" ? pause() : start()
  }, [status, pause, start, reset])

  const toWork = useCallback(() => switchMode("work"), [switchMode])
  const toBreak = useCallback(() => switchMode("break"), [switchMode])

  return {
    mode,
    isWork: mode == "work",
    isBreak: mode == "break",
    status,
    next: () => {
      reset()
      if (mode == "work") {
        end()
        switchMode("break")
      } else {
        switchMode("work")
      }
    },
    formattedMinutes: formatTime(Math.floor(totalSeconds / 60)),
    formattedSeconds: formatTime(Math.floor(totalSeconds % 60)),
    otherModeDuration: mode === "work" ? durations.break : durations.work,
    switchMode,
    toWork,
    toBreak,
    setDuration,
    toggle,
    start,
    setOnComplete,
    end,
    confirmEnd,
    cancelEnd,
    setSeconds,
    setMinutes,
    pause,
    reset,
    durations,
    startDurations,
    minutes,
    seconds,
    isConfirmEndOpen,
    elapsedWorkMinutes,sysnTick
  }
}