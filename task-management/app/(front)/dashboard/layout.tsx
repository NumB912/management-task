"use client";
import React, { useEffect } from "react";
import Side from "../component/side.component";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HeaderProvider } from "../providers/header.provider";
import { AuthProvider } from "../providers/auth.provider";
import { useWorkspace } from "../feature/hook/useWorkSpaceQuery.hook";
import { useWorkspaceStore } from "../states/workspace.state";
const layout = ({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) => {
  const hydrate = useWorkspaceStore((s) => s.hydrate);
  const { data, isSuccess } = useWorkspace();
  useEffect(() => {
    if (isSuccess && data) {
      hydrate({
        lists: data.lists ?? [],
        filters: data.filters ?? [],
        inbox:
          data.lists.find(
            (list) => list.list.name.toLocaleLowerCase() === "inbox",
          )?.list.id ?? null,
        tags: data.tags ?? [],
      });
    }
  }, [isSuccess, data, hydrate]);

  return (
    <SidebarProvider className="overflow-hidden">
      <AuthProvider>
        <Side />
        <HeaderProvider>
          <main className="flex-1 min-w-0">
            {children}

            {modal}
          </main>
        </HeaderProvider>
      </AuthProvider>
    </SidebarProvider>
  );
};

export default layout;
