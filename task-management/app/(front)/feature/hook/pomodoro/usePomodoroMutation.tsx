import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "../apiErrorResponse.type";
import { pomodoroApi } from "../../api/pomodoro/pomodoro.api";
import { ICreatepomodoroDTO } from "@/app/(front)/model/DTO/pomodoro.DTO";
import { IPomodoroModel } from "@/app/(front)/model";

export const KEY_POMODORO = ["pomodoro"];

type Ctx = { previous?: IPomodoroModel[] };

export const useCreatePomodoro = () => {
  const queryClient = useQueryClient();

  return useMutation<IPomodoroModel, AxiosError<ApiErrorResponse>, ICreatepomodoroDTO, Ctx>({
    mutationFn: (data) => pomodoroApi.create(data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: KEY_POMODORO });
      const previous = queryClient.getQueryData<IPomodoroModel[]>(KEY_POMODORO);

      queryClient.setQueryData<IPomodoroModel[]>(KEY_POMODORO, (old = []) => [
        ...old,
        { ...data, id: `temp-${Date.now()}` } as IPomodoroModel,
      ]);

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(KEY_POMODORO, ctx.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY_POMODORO });
    },
  });
};

export const useEditPomodoro = () => {
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    AxiosError<ApiErrorResponse>,
    { id: string; data: Pick<IPomodoroModel,"id"|"task"> },
    Ctx
  >({
    mutationFn: ({ id, data }) => pomodoroApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: KEY_POMODORO });
      const previous = queryClient.getQueryData<IPomodoroModel[]>(KEY_POMODORO);

      queryClient.setQueryData<IPomodoroModel[]>(KEY_POMODORO, (old = []) =>
        old.map((item) => (item.id === id ? { ...item, ...data } : item))
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(KEY_POMODORO, ctx.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY_POMODORO });
    },
  });
};

export const useDeletePomodoro = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, string, Ctx>({
    mutationFn: (id) => pomodoroApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY_POMODORO });
      const previous = queryClient.getQueryData<IPomodoroModel[]>(KEY_POMODORO);

      queryClient.setQueryData<IPomodoroModel[]>(KEY_POMODORO, (old = []) =>
        old.filter((item) => item.id !== id)
      );

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(KEY_POMODORO, ctx.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY_POMODORO });
    },
  });
};