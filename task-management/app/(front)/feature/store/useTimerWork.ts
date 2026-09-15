
"use client";

import { useEffect, useRef } from "react";
import { TimerStatus, useTimerStore } from "./timer.store";

interface UseTimerWorkerParams {
  status: TimerStatus;
  isWork: boolean;
  endTime: number | null;
  onTick: () => void;
  onDone?: () => void;
}

const DEFAULT_TITLE = "Pomodoro Timer";

export function useTimerWorker({ status, isWork, endTime, onTick, onDone }: UseTimerWorkerParams) {
  const workerRef = useRef<Worker | null>(null);
  const statusRef = useRef(status);
  const isWorkRef = useRef(isWork);
  const onTickRef = useRef(onTick);
  const onDoneRef = useRef(onDone);
  statusRef.current = status;
  isWorkRef.current = isWork;
  onTickRef.current = onTick;
  onDoneRef.current = onDone;

  const updateTitle = (remainingMs: number) => {
    const st = statusRef.current;
    if (st == "end" || st == "complete") {
      document.title = DEFAULT_TITLE;
      return;
    }
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = (totalSeconds-1) % 60;
    const icon = st === "pause" ? "⏸" : isWorkRef.current ? "🍅" : "☕";
    document.title = `${icon} ${m}:${s.toString().padStart(2, "0")} - ${isWorkRef.current ? "Làm việc" : "Nghỉ"}`;
  };

  useEffect(() => {
    const worker = new Worker("/timeWorker.js");
    workerRef.current = worker;
    worker.onmessage = (e) => {
      const { type, remaining } = e.data;
      if (type === "TICK") {
        onTickRef.current();
        updateTitle(remaining);
      }
      if (type === "DONE") {
        onDoneRef.current?.();
      }
    };

    return () => {
      worker.terminate();
      document.title = DEFAULT_TITLE;
    };
  }, []);

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;
    if (status === "progress" && endTime !== null) {
      worker.postMessage({ type: "START", payload: { endTime } });
    } else {
      worker.postMessage({ type: "STOP" });
      if (status === "progress") {
        const remainingMs = useTimerStore.getState().totalSeconds-1 * 1000;
        updateTitle(remainingMs);
      } else {
        document.title = DEFAULT_TITLE;
      }
    }
  }, [status, endTime]);
}