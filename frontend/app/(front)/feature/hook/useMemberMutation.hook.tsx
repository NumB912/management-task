import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberApi } from "../api/member/member.api";
import { IMemberModel, IRoleMember, IStatusMember } from "../../model/member.model";
import { ApiError } from "../../lib/axios";

interface AcceptOrDenyParams {
  listId: string;
  status: IStatusMember;
}

interface InviteMemberParams {
  listId:string,
  email:string[]
}

interface RemoveMemberParams {
  listId:string,
  email:string
}

interface ExitMemberParams{
  listId:string
}

interface UpdateMemberParams {
  listId: string;
  email: string;
  role:IRoleMember;
}

export const useAcceptOrDenyInvite = () => {
  const queryClient = useQueryClient();

  return useMutation<IMemberModel, ApiError, AcceptOrDenyParams>({
    mutationFn: ({ listId, status }: AcceptOrDenyParams) =>
      MemberApi.acceptOrNotWithInvite(listId, { status }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};

export const useInvite = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, ApiError, InviteMemberParams>({
    mutationFn: ({ listId,email }: InviteMemberParams) =>
      MemberApi.inviteMember(listId,email),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, ApiError, RemoveMemberParams>({
    mutationFn: ({ listId,email }: RemoveMemberParams) =>
      MemberApi.removeMember(email,listId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};

export const useExitMember = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, ApiError,ExitMemberParams>({
    mutationFn: ({ listId }: ExitMemberParams) =>
      MemberApi.exitMember(listId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};

export const useUpdateMember = ()=>{
  const queryClient = useQueryClient();
  return useMutation<IMemberModel, ApiError, UpdateMemberParams>({
    mutationFn: ({ listId, email, role }) =>
      MemberApi.updateMember(email,listId,role),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}