import { axiosInstance } from "@/app/(front)/lib/axios";
import type {
  PomodoroStatistics,
  StatisticsQuery,
  TaskStatistics,
} from "@/app/(front)/model/statistics.model";
export const statisticsApi = {
  tasks: async (params: StatisticsQuery, signal?: AbortSignal) => {
    const res = await axiosInstance.get<{ data: TaskStatistics }>(
      "/statistics/tasks",
      { params, signal },
    );
    return res.data.data;
  },
  pomodoro: async (params: StatisticsQuery, signal?: AbortSignal) => {
    const res = await axiosInstance.get<{ data: PomodoroStatistics }>(
      "/statistics/pomodoro",
      { params, signal },
    );
    return res.data.data;
  },
};
