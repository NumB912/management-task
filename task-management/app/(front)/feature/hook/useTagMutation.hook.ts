
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listKeys } from './useListQuery.hook';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from './apiErrorResponse.type';
import { tagApi } from '../api/tags/tag.api';
import { ICreateTagDTO } from '../../model/DTO/tag.DTO';
import { workSpaceKeys } from './useWorkSpaceQuery.hook';

export const useCreateTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ICreateTagDTO) => tagApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: listKeys.all });
            queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error('Create task failed:', error.response?.data?.message ?? error.message);
        },
    });
};

export const useRemoveTagOnlyMe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => tagApi.removeOnlyMe(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: listKeys.all });
            queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
        },
    });
};

export const useRemoveTagWithShare = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => tagApi.removeWithShare(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: listKeys.all });
            queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
        },
    });
};

export const useUpdateTagWithShare = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            tagApi.updateShareWithMe(id, {
                name: name
            }),

        onSuccess: (_data, { id, name }) => {
            queryClient.invalidateQueries({ queryKey: listKeys.all });
            queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
        },
    });
};


export const useUpdateTagOnlyMe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            tagApi.updateOnlyMe(id, {
                name: name
            }),

        onSuccess: (_data, { id, name }) => {
            queryClient.invalidateQueries({ queryKey: listKeys.all });
            queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
        },
    });
};
