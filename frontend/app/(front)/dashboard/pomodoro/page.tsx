"use client";
import {
  Play,
  Pause,
  SkipForward,
  PlayCircle,
  Check,
  CircleAlert,
  ArchiveRestore,
} from "lucide-react";
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
import {
  IStartDuration,
  useTimerStore,
} from "../../feature/store/pomodoro/timer.store";
import { usePomodoroQuery } from "../../feature/hook/pomodoro/usePomodoroQuery.hook";
import { useTimer } from "../../feature/hook/pomodoro/pomodoroTimer.hook";
import { PomodoroDetailDialog } from "../../components/Pomodoro.component";
import { PomodoroTimelineView } from "../../components/pomodoro/pomodoroTimelineView.component";
import {
  useCreatePomodoro,
  useDeletePomodoro,
  useEditPomodoro,
} from "../../feature/hook/pomodoro/usePomodoroMutation";
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
  } = useTimer();

  const { data: sessions = [] } = usePomodoroQuery();
  const { mutate: deletePomodoro } = useDeletePomodoro();
  const { mutate: updatePomodoro } = useEditPomodoro();
  const { mutate: createPomodoro } = useCreatePomodoro();
  const [defaultMinute, setDefaultMinute] = useState<number>(minutes);
  const [openDrop, setOpenDrop] = useState<boolean>(false);
  const [taskFocus, setTaskFocus] = useState<
    Pick<ITaskModel, "id" | "name"> | undefined
  >(undefined);
  const [detailSession, setDetailSession] = useState<IPomodoroModel | null>(
    null,
  );
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
    <div className="flex h-dvh w-full min-w-0 flex-col overflow-y-auto overflow-x-hidden bg-background xl:flex-row xl:overflow-hidden">
      <div className="flex min-w-0 shrink-0 flex-col items-center justify-center gap-5 px-3 py-8 sm:gap-6 sm:p-6 xl:flex-1 xl:overflow-y-auto">
        <div className="focus flex w-full min-w-0 max-w-xs flex-col items-center gap-3">
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

        <div className="flex w-full min-w-0 items-center justify-center font-mono tabular-nums tracking-tight">
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
                className="h-auto max-w-full gap-1 px-0 py-2 text-[clamp(2.75rem,12vw,6rem)] font-bold leading-none focus:bg-transparent! hover:bg-transparent! disabled:opacity-100 sm:gap-2"
              >
                {formattedMinutes} <span className="text-[0.7em]">:</span>{" "}
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

        <div className="flex flex-wrap justify-center gap-2">
          {presets?.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              size="sm"
              className="min-h-10 min-w-14"
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

      <div className="report flex w-full min-w-0 shrink-0 flex-col border-t border-border/50 bg-card/30 p-3 sm:p-5 xl:h-full xl:w-1/2 xl:max-w-150 xl:border-t-0 xl:border-l xl:overflow-hidden">
        <div className="min-h-0 min-w-0 xl:flex-1">
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
        editTask={async (id: string, task: Pick<ITaskModel, "id" | "name">) =>
          updatePomodoro({
            id: id,
            data: {
              task: task,
            },
          })
        }
        session={detailSession}
        onClose={() => {
          setDetailSession(null);
        }}
      />

      <AlertDialog open={isConfirmEndOpen} onOpenChange={setIsOpenEnd}>
        <AlertDialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] space-y-3 overflow-y-auto rounded-md sm:max-w-lg">
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
          <AlertDialogFooter className="flex flex-col gap-2 bg-transparent! px-2 sm:flex-row sm:flex-wrap">
            <AlertDialogAction
              variant={"ghost"}
              className="rounded-sm"
              onClick={() => {
                reset();
              }}
            >
              <ArchiveRestore /> Đặt lại
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                start();
              }}
              className="rounded-sm"
            >
              <PlayCircle />
              Tiếp tục
            </AlertDialogAction>
            <AlertDialogAction onClick={confirmEnd} className="rounded-sm ">
              <Check />
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Page;
