import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTimerStore } from "../../store/timer.store";

const formatTime = (value: number) => value.toString().padStart(2, "0");

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
    stop,
    next,
    confirmEnd,
    setMinutes,
    setSeconds,
    minutes,
    seconds,
    durations,
    startDurations,
    setOnComplete,
    isConfirmEndOpen,
    elapsedWorkMinutes,
    elapsedWorkSeconds,
    setIsOpenEnd,
    tick,
  } = useTimerStore(
    useShallow((state) => (state)),
  );

  const toggle = useCallback(() => {
    if (status === "complete") {
      reset();
      return;
    }
    status === "progress" ? pause() : start();
  }, [status, pause, start, reset]);

  const toWork = useCallback(() => switchMode("work"), [switchMode]);
  const toBreak = useCallback(() => switchMode("break"), [switchMode]);

  return {
    mode,
    isWork: mode == "work",
    isBreak: mode == "break",
    status,
    totalSeconds,
    next,
    totalDurationWork: startDurations.reduce(
      (prev, cur) => prev + cur.duration,
      0,
    ),
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
    stop,
    confirmEnd,
    setIsOpenEnd,
    setSeconds,
    setMinutes,
    pause,
    reset,
    durations,
    startDurations,
    minutes,
    seconds,
    isConfirmEndOpen,
    elapsedWorkSeconds,
    elapsedWorkMinutes,
    tick
  };
};
