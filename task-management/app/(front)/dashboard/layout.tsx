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
import { useProfile } from "../states/profile.state";
const layout = ({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) => {
  const hydrate = useWorkspaceStore((s) => s.hydrate);
  const { data, isSuccess,isLoading } = useWorkspace();
  const {user,setOpen,open} = useUserState()
  const onLogout = useUserState((state)=>state.logout)
  useEffect(() => {
    if (isSuccess && data) {
      hydrate({
        lists: data.lists ?? [],
        filters: data.filters ?? [],
        inbox:
          data.lists.find(
            (list) => list.name.toLocaleLowerCase() == "inbox",
          )?.id ?? null,
        tags: data.tags ?? [],
      });
    }
  }, [isSuccess, data, hydrate]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSuccess) {
    return null;
  }



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
        <ProfileDialog open={open} onOpenChange={setOpen} onSave={(name)=>{}} onLogout={onLogout} email={user?.email??""} name={user?.name??""} avatar={user?.avatar}/>
      </AuthProvider>
    </SidebarProvider>
  );
};

export default layout;
