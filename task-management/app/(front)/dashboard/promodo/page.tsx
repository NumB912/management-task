"use client";
import { Play, Pause, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimer } from "../../feature/hook/promodo/promodo.hook";
import { useEffect, useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ITaskModel } from "../../model";
import { ListCombobox } from "../../components/task/combobox/task.combobox";

import { IPromodoroModel } from "../../model/promodo.model";
import { PomodoroTimelineView } from "../../components/promodo/promodoTimelineView.component";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { promodoApi } from "../../feature/api/promodo/promodo.api";
import { IStartDuration, useTimerStore } from "../../feature/store/timer.store";
import { usePromodo } from "../../feature/hook/promodo/usePromodoQuery.hook";
import { useTimerWorker } from "../../feature/store/useTimerWork";

const PRESETS = {
  work: [
    { label: "25m", minutes: 25 },
    { label: "15m", minutes: 15 },
    { label: "5m", minutes: 5 },
  ],
  break: [
    { label: "5m", minutes: 5 },
    { label: "10m", minutes: 10 },
    { label: "15m", minutes: 15 },
  ],
};

const Page = () => {
  const {
    mode,
    isWork,
    status,
    formattedMinutes,
    formattedSeconds,
    toggle,
    end,
    confirmEnd,
    cancelEnd,
    setDuration,
    minutes,
    toWork,
    toBreak,
    next,
    setOnComplete,
    isConfirmEndOpen,
    elapsedWorkMinutes,
  } = useTimer();
  const [defaultMinute, setDefaultMinute] = useState<number>(minutes);
  const [openDrop, setOpenDrop] = useState<boolean>(false);
  const [taskFocus, setTaskFocus] = useState<ITaskModel | undefined>(undefined);
  const [sessions, setSessions] = useState<IPromodoroModel[]>([]);
  const { data, isSuccess } = usePromodo();
  const endTime = useTimerStore((s) =>
    s.tickStartedAt !== null
      ? s.tickStartedAt + s.tickInitialSeconds * 1000
      : null,
  );

  useTimerWorker({
    status,
    isWork,
    endTime,
    onTick: () => useTimerStore.getState().tick(),
    onDone: () => {
      console.log("hello");
    },
  });
  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    setSessions(data);
  }, [data]);

  const presets = PRESETS[mode];
  const complete = useCallback(
    async (startDurations: IStartDuration[]) => {
      const now = new Date();
      const sessionDurationMins = minutes > 0 ? minutes : 25;
      const newSession = await promodoApi.create({
        task: taskFocus?.id,
        progress: startDurations ?? [],
        start: new Date(now.getTime() - sessionDurationMins * 60 * 1000),
      });
      setSessions((prev) => [newSession, ...prev]);
    },
    [isWork, minutes, taskFocus],
  );

  useEffect(() => {
    setOnComplete(complete);
  }, [complete, setOnComplete]);

  return (
    <div className="w-full h-full min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-background">
      <div className="flex flex-col items-center justify-center flex-1/2 p-6 gap-6 overflow-y-auto ">
        <div className="focus flex flex-col gap-2 w-full max-w-xs items-center">
          <ListCombobox onSelect={setTaskFocus} value={taskFocus} />
          <div className="flex gap-2">
            <Button
              variant={isWork ? "default" : "outline"}
              size="sm"
              disabled={status === "progress"}
              onClick={toWork}
            >
              Làm việc
            </Button>
            <Button
              variant={!isWork ? "default" : "outline"}
              size="sm"
              disabled={status === "progress"}
              onClick={toBreak}
            >
              Nghỉ
            </Button>
          </div>
        </div>

        <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {status === "progress"
            ? isWork
              ? "Đang làm việc"
              : "Đang nghỉ"
            : status === "pause"
              ? "Tạm dừng"
              : status === "complete"
                ? "Hoàn thành"
                : isWork
                  ? "Sẵn sàng làm việc"
                  : "Sẵn sàng nghỉ"}
        </span>

        <div className="flex gap-1 font-mono tabular-nums tracking-tight items-center">
          <DropdownMenu
            open={openDrop}
            onOpenChange={(open) => {
              if (open) setDefaultMinute(minutes);
              setOpenDrop(open);
            }}
          >
            <DropdownMenuTrigger
              asChild
              disabled={status === "progress"}
              className="hover:bg-transparent! focus:outline-0 data-[state=open]:bg-transparent!"
            >
              <Button
                variant="ghost"
                className="text-8xl focus:bg-transparent! hover:bg-transparent! disabled:opacity-100 font-bold"
              >
                {formattedMinutes} <span className="text-6xl">:</span>{" "}
                {formattedSeconds}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="p-3 flex flex-col gap-2 mt-8 min-w-20 max-w-50!"
              align="center"
              side="bottom"
            >
              <Input
                value={defaultMinute}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  setDefaultMinute(Math.min(Math.max(raw,0),300));
                }}
              />
              <div className="flex gap-2 items-end justify-end">
                <Button
                  variant={"outline"}
                  className="rounded flex-1"
                  onClick={() => setOpenDrop(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="rounded flex-1"
                  onClick={() => {
                    setDuration(defaultMinute, 0);
                    setOpenDrop(false);
                  }}
                >
                  Sửa
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          {presets.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              size="sm"
              disabled={status === "progress"}
              onClick={() => setDuration(p.minutes, 0)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-md"
              onClick={toggle}
              aria-label={status === "progress" ? "Pause" : "Start"}
            >
              {status === "progress" ? (
                <Pause className="size-6" />
              ) : (
                <Play className="size-6" />
              )}
            </Button>
            {status === "pause" && (
              <Button
                size="lg"
                variant={"outline"}
                className="w-16 h-16 rounded-full font-bold shadow-xs"
                onClick={end}
                aria-label={"end"}
              >
                Dừng
              </Button>
            )}
            {status === "progress" && (
              <Button
                size="lg"
                variant={"outline"}
                className="w-16 h-16 rounded-full font-bold shadow-xs"
                onClick={next}
                aria-label={"next"}
              >
                <SkipForward />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="report flex-1/2 w-full lg:w-120 xl:w-135 2xl:w-150 max-h-dvh border-t lg:border-t-0 lg:border-l border-border/50 bg-card/30 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 min-h-0 pr-1">
          <PomodoroTimelineView sessions={sessions} />
        </div>
      </div>

      <AlertDialog open={isConfirmEndOpen} onOpenChange={cancelEnd}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác nhận kết thúc phiên làm việc
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đã làm việc được <strong>{elapsedWorkMinutes} phút</strong>.
              Bạn có chắc chắn muốn kết thúc phiên lsàm việc này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelEnd}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEnd}>
              Xác nhận kết thúc
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Page;
