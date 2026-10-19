import { MutationFunctionContext, QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { listApi } from "../api/list/list.api";
import { ICreateListDTO } from "../../model/DTO/list.DTO";
import { workSpaceKeys } from "./useWorkSpaceQuery.hook";
import { ApiErrorResponse } from "./apiErrorResponse.type";
import { AxiosError } from "axios";
import { IWorkspaceGetDTO } from "../../model/DTO/workspaceGet.DTO";
import { listKeys } from "./useListQuery.hook";

export const useCreateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateListDTO) => listApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error('Create task failed:', error.response?.data?.message ?? error.message);
    },
  });
};

type DeleteListContext = {
  previousWorkspace: IWorkspaceGetDTO | undefined;
};

export const useDeleteList = () => {
  return useMutation<void, AxiosError<ApiErrorResponse>, string, DeleteListContext>({
    mutationFn: async (id: string): Promise<void> => {
      await listApi.delete(id);
    },
  });
};


type UpdateListDTO = {
  id: string;
  name: string;
};

type UpdateListContext = {
  previousWorkspace: IWorkspaceGetDTO | undefined;
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiErrorResponse>, UpdateListDTO, UpdateListContext>({
    mutationFn: async ({ id, name }: UpdateListDTO): Promise<void> => {
      await listApi.update(id, name);
    },
  });
};

export const useChangePosition = (listId:string)=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fromId, toId }: { fromId: string; toId: string }) =>listApi.changePosition(listId, fromId, toId),
    // onSuccess:()=>{
    //   queryClient.invalidateQueries({
    //      queryKey:listKeys.detail(listId)
    //   })
    // }
  })
}