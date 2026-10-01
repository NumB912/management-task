import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useExitMember } from "./useMemberMutation.hook";
import { useWorkspaceStore } from "../../states/workspace.state";
import { useShallow } from "zustand/react/shallow";

const useExitMemberHook = () => {
  const router = useRouter();
  const params = useParams<{ listId?: string }>();
  const qc = useQueryClient();
  const lists = useWorkspaceStore(useShallow((state)=>state.listIndex))
  const { mutate: exitMember, isPending } = useExitMember();
  const addList = useWorkspaceStore((state) => state.addList);
  const removeList = useWorkspaceStore((state) => state.removelistIndex);
  const handleExitMember = useCallback(
    (listId: string) => {
      if (!listId || isPending) return; 
      const prev = lists[listId]
      removeList(listId)
      exitMember({
        listId:listId
      }, {
        onSuccess: () => {
          if (params?.listId === listId) {
            router.replace("/dashboard");
          }
          toast.success("Đã rời khỏi danh sách");
        },
        onError: (error: any) => {
          toast.error(error?.message ?? "Không thể rời khỏi danh sách");
          addList({
            id:prev.id,
            members:prev.members,
            name:prev.name,
            sections:prev.sections,
            isShareList:prev.isShareList,
            user:prev.user
          })
        },
      });
    },
    [exitMember, isPending, removeList, qc, router, params?.listId],
  );

  return {
    handleExitMember,
    isPending,
  };
};

export default useExitMemberHook;