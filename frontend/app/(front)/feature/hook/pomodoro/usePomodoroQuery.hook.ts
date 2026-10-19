
import { useQuery } from '@tanstack/react-query';
import { pomodoroApi } from '../../api/pomodoro/pomodoro.api';
export const usePomodoroQuery = () => {
  return useQuery({
    queryKey: ["pomodoro"],
    queryFn: () => pomodoroApi.getAll(),
  });
};