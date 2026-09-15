import { AxiosError } from "axios";
import { IWorkspaceGetDTO } from "../../model/DTO/workspaceGet.DTO";
import { ApiErrorResponse } from "./apiErrorResponse.type";
import { workSpaceKeys } from "./useWorkSpaceQuery.hook";
import { filterApi } from "../api/filters/filter.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IFilterModel } from "../../model/filter.model";

type UpdateFilterContext = {
  previousWorkspace: IWorkspaceGetDTO | undefined;
};

type UpdateFilterVariables = {
  id: string;
  data: Partial<IFilterModel>;
};

export const useUpdateFilter = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiErrorResponse>, UpdateFilterVariables, UpdateFilterContext>({
    mutationFn: async ({ id, data }): Promise<void> => {
      await filterApi.update(id, data);
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: workSpaceKeys.index() });
      const previousWorkspace = queryClient.getQueryData<IWorkspaceGetDTO>(
        workSpaceKeys.index()
      );

      queryClient.setQueryData<IWorkspaceGetDTO>(workSpaceKeys.index(), (old) => {
        if (!old) return old;
        return {
          ...old,
          filters: old.filters?.map((f) =>
            f.id === id ? { ...f, ...data } : f
          ),
        };
      });

      return { previousWorkspace };
    },

    onError: (error, _variables, context) => {
      if (context?.previousWorkspace) {
        queryClient.setQueryData(workSpaceKeys.index(), context.previousWorkspace);
      }
      console.error("Update filter failed:", error.response?.data?.message ?? error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
    },
  });
};