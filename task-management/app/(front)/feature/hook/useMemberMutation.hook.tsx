import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberApi } from "../api/member/member.api";
import { IMemberModel, IStatusMember } from "../../model/member.model";

interface AcceptOrDenyParams {
  listId: string;
  status: IStatusMember;
}

export const useAcceptOrDenyInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, status }: AcceptOrDenyParams) =>
      MemberApi.acceptOrNotWithInvite(listId, { status }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },

    onError: (error) => {
      console.error("[useAcceptOrDenyInvite] Lỗi khi cập nhật status:", error);
    },
  });
};