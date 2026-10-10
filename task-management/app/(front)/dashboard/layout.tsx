"use client";
import React, { useEffect } from "react";
import Side from "../component/side.component";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HeaderProvider } from "../providers/header.provider";
import { AuthProvider } from "../providers/auth.provider";
import { useWorkspace } from "../feature/hook/useWorkSpaceQuery.hook";
import { useWorkspaceStore } from "../states/workspace.state";
import useUserState from "../states/user/user.state";
import ProfileDialog from "../components/auth/profile/profileDialog";
import { useRouter } from "next/navigation";
import { AudioProvider, useAudio } from "../providers/audio.provider";
import { useTimerWorker } from "../feature/store/useTimerWork";
import { useTimerStore } from "../feature/store/timer.store";
import { useTimer } from "../feature/hook/pomodoro/pomodoroTimer.hook";
import { toast } from "sonner";

type Props = { children: React.ReactNode; modal: React.ReactNode };

function DashboardContent({ children, modal }: Props) {
  const hydrate = useWorkspaceStore((s) => s.hydrate);
  const { data, isSuccess, isLoading } = useWorkspace();
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
      });
    }
  }, [isSuccess, data, hydrate]);

  useEffect(() => {
    if (status === "unauthenticated") route.replace("/auth/login");
  }, [route, status]);

  if (isLoading) return <div>Loading...</div>;
  if (!isSuccess) return null;

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
      <DashboardContent {...props} />
    </AudioProvider>
  );
}