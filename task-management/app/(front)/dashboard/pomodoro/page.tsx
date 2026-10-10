"use client";
import { Play, Pause, SkipForward, PlayCircle, Check, CircleAlert, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { IPomodoroModel, ITaskModel } from "../../model";
import { ListCombobox } from "../../components/task/combobox/task.combobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { IStartDuration, useTimerStore } from "../../feature/store/timer.store";
import { usePomodoroQuery } from "../../feature/hook/pomodoro/usePomodoroQuery.hook";
import { useTimer } from "../../feature/hook/pomodoro/pomodoroTimer.hook";
import { PomodoroDetailDialog } from "../../components/Pomodoro.component";
import { PomodoroTimelineView } from "../../components/pomodoro/pomodoroTimelineView.component";
import { useCreatePomodoro, useDeletePomodoro, useEditPomodoro } from "../../feature/hook/pomodoro/usePomodoroMutation";
import { getTodayStats } from "../../feature/hook/pomodoro/usePomodoroStats";
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
    stop,
    reset,
    setDuration,
    minutes,
    toWork,
    toBreak,
    next,
    start,
    confirmEnd,
    setOnComplete,
    isConfirmEndOpen,
    elapsedWorkMinutes,
    elapsedWorkSeconds,
    totalDurationWork,
    setIsOpenEnd,
  } = useTimer()

  
  const { data: sessions = [] } = usePomodoroQuery()
  const { mutate: deletePomodoro } = useDeletePomodoro()
  const {mutate:updatePomodoro} = useEditPomodoro()
  const {mutate:createPomodoro} = useCreatePomodoro()
  const [defaultMinute, setDefaultMinute] = useState<number>(minutes)
  const [openDrop, setOpenDrop] = useState<boolean>(false)
  const [taskFocus, setTaskFocus] = useState<
    Pick<ITaskModel, "id" | "name"> | undefined
  >(undefined)
  const [detailSession, setDetailSession] = useState<IPomodoroModel | null>(
    null,
  )
  const presets = PRESETS[mode];
  const complete = useCallback(
    async (startDurations: IStartDuration[]) => {
      const now = new Date();
      const sessionDurationMins = minutes > 0 ? minutes : 5;
      createPomodoro({
        task: taskFocus?.id,
        progress: startDurations ?? [],
        totalDuration: totalDurationWork,
        start: new Date(now.getTime() - sessionDurationMins * 60 * 1000),
      });
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
                  setDefaultMinute(Math.min(Math.max(raw, 0), 300));
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
                onClick={stop}
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
          <PomodoroTimelineView
            sessions={sessions}
            onSelectpomodoro={(id: string) =>
              setDetailSession(sessions.find((s) => s.id === id) ?? null)
            }
          />
        </div>
      </div>

      <PomodoroDetailDialog
        deletepomodoro={async (id: string) => deletePomodoro(id)}
        editTask={async (
          id: string,
          task: Pick<ITaskModel, "id" | "name">,
        ) => updatePomodoro({
          id:id,
           data:{
              task:task
           }
        })}
        session={detailSession}
        onClose={() => {
          setDetailSession(null);
        }}
      />

      <AlertDialog open={isConfirmEndOpen} onOpenChange={setIsOpenEnd}>
        <AlertDialogContent className="space-y-3 rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác nhận kết thúc phiên làm việc
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đã làm việc được{" "}
              <strong>
                {elapsedWorkMinutes} phút {elapsedWorkSeconds} giây
              </strong>
              . Phải trên 5 phút mới lưu vào được
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="bg-transparent! px-2">
            <AlertDialogAction variant={"ghost"} className="rounded-sm" onClick={() => {reset()}}><ArchiveRestore/> Đặt lại</AlertDialogAction>
            <AlertDialogAction onClick={() => {
              start()
            }} className="rounded-sm"><PlayCircle/>Tiếp tục</AlertDialogAction>
            <AlertDialogAction onClick={confirmEnd} className="rounded-sm "><Check/>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Page;
