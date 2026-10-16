import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../../api/statistics/statistics.api";
import type { StatisticsQuery } from "@/app/(front)/model/statistics.model";
import useUserState from "../../store/user/user.state";
export function useStatistics(
  params: StatisticsQuery,
  section: "task" | "pomodoro",
) {
  const userId = useUserState((state) => state.user?.id);
  const tasks = useQuery({
    queryKey: ["statistics", userId, "tasks", params],
    queryFn: ({ signal }) => statisticsApi.tasks(params, signal),
    enabled: Boolean(userId && params.date && section === "task"),
    staleTime: 0,
  });
  const pomodoro = useQuery({
    queryKey: ["statistics", userId, "pomodoro", params],
    queryFn: ({ signal }) => statisticsApi.pomodoro(params, signal),
    enabled: Boolean(userId && params.date && section === "pomodoro"),
    staleTime: 0,
  });
  return { tasks, pomodoro };
}
