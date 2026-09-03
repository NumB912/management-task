
import { ICreateTaskWithSectionDTO } from '@/app/(front)/model/DTO/task.DTO';
import { useCreateTask, useCreateTaskWithSection } from './useTaskMutation.hook';

export const useCreateTaskFactory = (listId: string, sectionId?: string) => {
  const createTask = useCreateTask(listId);
  const createTaskWithSection = useCreateTaskWithSection(listId, sectionId ?? '');

  const mutate = (data: ICreateTaskWithSectionDTO) => {
    if (sectionId) {
      createTaskWithSection.mutate(data);
    } else {
      createTask.mutate(data);
    }
  };

  const isPending = sectionId
    ? createTaskWithSection.isPending
    : createTask.isPending;

  return { mutate, isPending };
};