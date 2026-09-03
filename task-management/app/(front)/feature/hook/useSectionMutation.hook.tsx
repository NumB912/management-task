
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listKeys } from './useListQuery.hook';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from './apiErrorResponse.type';
import { ICreateSectionDTO } from '../../model/DTO/section.DTO';
import { sectionApi } from '../api/sections/sections.api';
import { workSpaceKeys } from './useWorkSpaceQuery.hook';

export const useCreateSection = (listId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateSectionDTO) => sectionApi.create(data, listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error('Create task failed:', error.response?.data?.message ?? error.message);
    },
  });
};

export const useRemoveSection = (listId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sectionApi.remove(id),
    onSuccess: (_data, id) => {
      if (listId) {
        queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
      }
      queryClient.invalidateQueries({queryKey: workSpaceKeys.index()})
    }
  });
};
export const useUpdateSection = (listId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      sectionApi.update(id, name),

    onSuccess: (_data, { id, name }) => {
      if (!listId) return;

      queryClient.setQueryData(listKeys.detail(listId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          sections: old.sections.map((s: any) =>
            s.id === id ? { ...s, name } : s
          ),
        };
      });
    },
  });
};

export const useChangePositionSection = (listId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderMainId,
      orderChangeId,
    }: {
      orderMainId: string;
      orderChangeId: string;
    }) => sectionApi.changePosition(orderMainId, orderChangeId),

    onMutate: async ({ orderMainId, orderChangeId }) => {
      if (!listId) return;

      await queryClient.cancelQueries({ queryKey: listKeys.detail(listId) });

      const previousList = queryClient.getQueryData(listKeys.detail(listId));

      queryClient.setQueryData(listKeys.detail(listId), (old: any) => {
        if (!old) return old;

        const mainSection = old.sections.find((s: any) => s.id === orderMainId);
        const changeSection = old.sections.find((s: any) => s.id === orderChangeId);

        if (!mainSection || !changeSection) return old;
        return {
          ...old,
          sections: old.sections.map((s: any) => {
            if (s.id === orderMainId) {
              return { ...s, order: changeSection.order };
            }
            if (s.id === orderChangeId) {
              return { ...s, order: mainSection.order };
            }
            return s;
          }),
        };
      });
      return { previousList };
    },

    onError: (_err, _variables, context) => {
      if (!listId || !context?.previousList) return;
      queryClient.setQueryData(listKeys.detail(listId), context.previousList);
    },

    onSettled: () => {
      if (!listId) return;
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
      queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
    },
  });
};