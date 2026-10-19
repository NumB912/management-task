"use client";
import React, { useEffect, useState } from "react";
import { CircleAlert, LoaderCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SidebarProvider } from "@/components/ui/sidebar";
import { HeaderProvider } from "../providers/header.provider";
import { AuthProvider } from "../providers/auth.provider";
import { useWorkspace } from "../feature/hook/useWorkSpaceQuery.hook";
import { useWorkspaceStore } from "../feature/store/workspace.state";
import useUserState from "../feature/store/user/user.state";
import ProfileDialog from "../components/auth/profile/profileDialog";
import { useRouter } from "next/navigation";
import { AudioProvider, useAudio } from "../providers/audio.provider";
import { useTimerWorker } from "../feature/store/pomodoro/useTimerWork";
import { useTimer } from "../feature/hook/pomodoro/pomodoroTimer.hook";
import { toast } from "sonner";
import Side from "../components/side.component";
import { useTimerStore } from "../feature/store/pomodoro/timer.store";
import { TaskStatusBatchProvider } from "../providers/task.provider";
import Image from "next/image";

type Props = { children: React.ReactNode; modal: React.ReactNode };

function DashboardContent({ children, modal }: Props) {
  const hydrate = useWorkspaceStore((s) => s.hydrate);
  const { data, isSuccess, isError, isFetching, failureCount, refetch } = useWorkspace();
  const [hasHydratedWorkspace, setHasHydratedWorkspace] = useState(false);
  const [isManualRetry, setIsManualRetry] = useState(false);
  const { user, setOpen, open, status } = useUserState();
  const onLogout = useUserState((state) => state.logout);
  const { isWork, status: statusPromodo, tick } = useTimer();
  const { playTick } = useAudio();
  const route = useRouter();
  const endTime = useTimerStore((s) =>
    s.tickStartedAt !== null
      ? s.tickStartedAt + s.tickInitialSeconds * 1000
      : null,
  );

  useTimerWorker({
    status: statusPromodo,
    isWork,
    endTime,
    onTick: () => tick(),
    onDone: () => {
      playTick();
      toast.info("Xong nhiệm vụ rồi nghỉ ngơi chút thôi",{
        position:"top-right"
      }) 
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      hydrate({
        lists: data.lists ?? [],
        filters: data.filters ?? [],
        inbox:
          data.lists.find((l) => l.name.toLocaleLowerCase() === "inbox")?.id ??
          null,
        tags: data.tags ?? [],
        notifications:data.notifications,
        colors:data.colors
      });
      setHasHydratedWorkspace(true);
    }
  }, [isSuccess, data, hydrate]);

  useEffect(() => {
    if (status === "unauthenticated") route.replace("/auth/login");
  }, [route, status]);

  if (!hasHydratedWorkspace) {
    const hasFailed = isError && !isFetching;
    const isRetrying = isManualRetry || failureCount > 0;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        {hasFailed ? (
          <>
            <CircleAlert aria-hidden="true" className="size-10 text-destructive" />
            <p role="alert" className="text-sm text-muted-foreground">
              Không thể tải dữ liệu workspace sau các lần thử lại.
            </p>
            <Button variant="outline" onClick={() => {
              setIsManualRetry(true);
              void refetch();
            }}>
              <RotateCcw aria-hidden="true" />
              Thử lại
            </Button>
          </>
        ) : (
          <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col items-center gap-5">
            <div className="relative flex size-20 items-center justify-center">
              <div aria-hidden="true" className="absolute inset-0 rounded-full border-4 border-primary/10" />
            <Image width={100} height={100} src={"/watting.gif"} alt="watting-image"/>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isRetrying ? "Đang thử lại..." : "Đang tải workspace..."}
              </p>
              <p className="text-xs text-muted-foreground">
                {failureCount > 0
                  ? `Kết nối gặp lỗi. Tự động thử lại lần ${Math.min(failureCount, 3)}/3`
                  : isManualRetry
                    ? "Đang kết nối lại và tải dữ liệu của bạn"
                    : "Đang chuẩn bị dữ liệu của bạn"}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <SidebarProvider className="overflow-hidden">
      <Side />
      <AuthProvider>
        <HeaderProvider>
          <main className="flex-1 min-w-0">
            {children}
            {modal}
          </main>
        </HeaderProvider>
      </AuthProvider>
      <ProfileDialog
        open={open}
        onOpenChange={setOpen}
        onLogout={onLogout}
        email={user?.email ?? ""}
        name={user?.name ?? ""}
        avatar={user?.avatar}
      />
    </SidebarProvider>
  );
}

export default function layout(props: Props) {
  return (
    <AudioProvider>
      <TaskStatusBatchProvider>
      <DashboardContent {...props} />
      </TaskStatusBatchProvider>
    </AudioProvider>
  );
}
