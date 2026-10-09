import { axiosInstance } from "@/app/(front)/lib/axios";
import { ICreatepomodoroDTO } from "@/app/(front)/model/DTO/pomodoro.DTO";
import { IPomodoroModel } from "@/app/(front)/model/pomodoro.model";
export const pomodoroApi = {
  getAll: async (): Promise<IPomodoroModel[]> => {
    const res = await axiosInstance.get<{
      data: IPomodoroModel[];
    }>(`/pomodoro`);
    return res.data.data;
  },
  delete: async (id: string): Promise<boolean> => {
    const res = await axiosInstance.delete<boolean>(`/pomodoro/${id}`);
    return res.data;
  },
  update: async (
    id: string,
    data: Pick<IPomodoroModel, "id" | "task">,
  ): Promise<boolean> => {
    const res = await axiosInstance.patch<boolean>(`/pomodoro/${id}`, data);
    return res.data;
  },
  create: async (data: ICreatepomodoroDTO): Promise<IPomodoroModel> => {
    const res = await axiosInstance.post<{ data: IPomodoroModel }>(
      "/pomodoro",
      data,
    );
    return res.data.data;
  },
};
