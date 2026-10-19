
import { ICreateTaskWithSectionDTO } from '@/app/(front)/model/DTO/task.DTO';
import { useCreateTask } from './useTaskMutation.hook';

export const useCreateTaskFactory = () => {
  const createTask = useCreateTask();
  const mutate = (data: ICreateTaskWithSectionDTO) => {
    createTask.mutate(data);
  };
  return { mutate};
};