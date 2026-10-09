"use client";

import { useEffect, useState } from "react";
import { Flag, ListTodo, Pause, Pencil, Timer, Trash2, X } from "lucide-react";

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { ITaskModel } from "../model";
import { IPomodoroModel } from "../model/pomodoro.model";
import { ListCombobox } from "./task/combobox/task.combobox"; 

import {
  getSessionFocusMinutes,
  getSessionPauseSeconds,
  getTimeOfDayPeriod,
  getTimeOfDayPeriodLabel,
} from "../feature/hook/pomodoro/usePomodoroStats";

interface Props {
  session: IPomodoroModel | null;
  onClose: () => void;
  deletepomodoro: (id: string) => Promise<void>;
  editTask: (id: string, task: Pick<ITaskModel,"id"|"name">) => Promise<void>;
}

const toMs = (d: Date | string) => new Date(d).getTime();

const formatClock = (d: Date | string) =>
  new Date(d).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatDuration = (ms: number) => {
  const totalSec = Math.max(0, Math.round(ms / 1000));

  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
};

export const PomodoroDetailDialog = ({
  session,
  onClose,
  deletepomodoro,
  editTask,
}: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskPodoromo,setTaskPodoromo] = useState(session?.task)
  if (!session) {
    return <Dialog open={false} onOpenChange={onClose} />;
  }
  const progress = session.progress ?? [];
  const focusMinutes = getSessionFocusMinutes(session);
  const pauseSeconds = getSessionPauseSeconds(session);
  const gross = focusMinutes * 60 + pauseSeconds;
  const first = progress[0];
  const last = progress[progress.length - 1];

  const startTime = first
    ? new Date(first.startPause)
    : new Date(session.start);
  const endTime = last
    ? new Date(toMs(last.startPause) + last.duration)
    : startTime;

  const periodLabel = getTimeOfDayPeriodLabel(getTimeOfDayPeriod(startTime));

  const dateLabel = startTime.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const busy = isDeleting || isSavingTask;

  const handleSelectTask = async (task: Pick<ITaskModel,"id"|"name"> | undefined) => {
    if (!task || !session.id || isSavingTask) return;
    if (task.id === session.task?.id) {
      return;
    }
    setTaskPodoromo({
      id:task.id,
      name:task.name
    })
    try {
      setIsSavingTask(true);
      await editTask(session.id, task);
    } catch (error) {
      console.error("Edit Pomodoro task failed:", error);
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleDelete = async () => {
    if (!session.id || isDeleting) return;

    try {
      setIsDeleting(true);
      await deletepomodoro(session.id);
      setDeleteOpen(false);
      onClose();
    } catch (error) {
      console.error("Delete Pomodoro failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open && !busy) onClose();
        }}
      >
        <DialogContent className="max-w-md! w-full max-h-[85dvh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <DialogTitle className="flex items-center gap-2">
                  <Timer className="size-5 shrink-0" />

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="min-w-0 flex-1 max-w-xs">
                        <ListCombobox
                          value={taskPodoromo as ITaskModel | undefined}
                          onSelect={handleSelectTask}
                        />
                      </div>
                    </div>
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs">
                  {isSavingTask
                    ? "Đang lưu..."
                    : `${dateLabel} · ${periodLabel}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex w-full min-h-0 flex-col overflow-y-auto pr-1">
            <div className="min-w-0">
              <div className="mb-4 flex items-center gap-2">
                <ListTodo className="size-4" />
                <span className="text-xs text-muted-foreground">
                  {progress.length} đoạn tập trung
                </span>
              </div>

              {progress.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Phiên này chưa có dữ liệu chi tiết.
                  </p>
                </div>
              ) : (
                <div className="max-h-100 overflow-y-auto">
                  <div className="relative flex flex-col gap-4">
                    <div className="absolute bottom-4 left-1.75 top-4 w-px bg-border" />

                    {progress.map((p, i) => {
                      const prev = progress[i - 1];

                      const gapMs = prev
                        ? toMs(p.startPause) -
                          (toMs(prev.startPause) + prev.duration)
                        : 0;
                      return (
                        <div key={i} className="relative pl-7">
                          <div className="absolute left-0 top-3 z-10 flex size-4 items-center justify-center rounded-full border bg-background">
                            <div className="size-1.5 rounded-full bg-foreground" />
                          </div>

                          {i > 0 && gapMs > 1000 && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Pause className="size-3" />
                              <span>Tạm dừng {formatDuration(gapMs)}</span>
                            </div>
                          )}

                          <div className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/40">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Đoạn #{i + 1}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ·
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatClock(p.startPause)}
                                  </span>
                                </div>

                                <div className="mt-1 text-sm font-medium">
                                  Tập trung
                                </div>
                              </div>

                              <div className="shrink-0 text-sm font-semibold tabular-nums">
                                {formatDuration(p.duration)}
                              </div>
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      5,
                                      (p.duration /
                                        Math.max(1, focusMinutes * 60 * 1000)) *
                                        100,
                                    ),
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="relative flex min-h-8 items-center pl-7">
                      <div className="absolute left-0 top-1/2 z-10 flex size-4 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Flag className="size-2.5" />
                      </div>

                      <div className="flex w-full items-center justify-between text-xs">
                        <span className="font-medium">Kết thúc</span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatClock(endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={busy}
              onClick={() => setDeleteOpen(true)}
              className="shrink-0 rounded-full bg-transparent! px-3 py-2 text-muted-foreground hover:border-0! hover:bg-destructive/10! hover:text-destructive"
              title="Xóa phiên Pomodoro"
            >
              <Trash2 className="size-4" />
            </Button>

            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                Tổng thời gian
              </div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-primary">
                {formatDuration(gross * 1000)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phiên Pomodoro?</AlertDialogTitle>

            <AlertDialogDescription>
              Bạn có chắc muốn xóa phiên Pomodoro này không? Dữ liệu timeline và
              thống kê của phiên này sẽ bị xóa và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa phiên"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};