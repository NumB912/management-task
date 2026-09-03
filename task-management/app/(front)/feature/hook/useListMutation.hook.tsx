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
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiErrorResponse>, string, DeleteListContext>({
    mutationFn: async (id: string): Promise<void> => {
      await listApi.delete(id);
    },

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: workSpaceKeys.index() });

      const previousWorkspace = queryClient.getQueryData<IWorkspaceGetDTO>(
        workSpaceKeys.index()
      );

      queryClient.setQueryData<IWorkspaceGetDTO>(workSpaceKeys.index(), (old) => {
        if (!old) return old;
        return {
          ...old,
          lists: old.lists.filter((data) => data.list.id !== id),
        };
      });

      return { previousWorkspace };
    },

    onError: (error, _id, context) => {
      if (context?.previousWorkspace) {
        queryClient.setQueryData(workSpaceKeys.index(), context.previousWorkspace);
      }
      console.error('Delete list failed:', error.response?.data?.message ?? error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
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

    onMutate: async ({ id, name }: UpdateListDTO) => {
      await queryClient.cancelQueries({ queryKey: workSpaceKeys.index() });

      const previousWorkspace = queryClient.getQueryData<IWorkspaceGetDTO>(
        workSpaceKeys.index()
      );

      queryClient.setQueryData<IWorkspaceGetDTO>(workSpaceKeys.index(), (old) => {
        if (!old) return old;
        return {
          ...old,
          lists: old.lists.map((data) =>
            data.list.id === id
              ? { ...data, list: { ...data.list, name } }
              : data
          ),
        };
      });

      return { previousWorkspace };
    },

    onError: (error, _variables, context) => {
      if (context?.previousWorkspace) {
        queryClient.setQueryData(workSpaceKeys.index(), context.previousWorkspace);
      }
      console.error('Update list failed:', error.response?.data?.message ?? error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
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