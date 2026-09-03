import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ICreateTaskDTO, ICreateTaskWithSectionDTO, IUpdateTaskDTO } from '../../model/DTO/task.DTO';
import { taskApi } from '../api/task/task.api';
import { listKeys } from './useListQuery.hook';
import { taskKeys } from './useTaskQuery.hook';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from './apiErrorResponse.type';
import { IRuleModel } from '../../model/rule/rule.model';
import { useWorkspaceStore } from '../../states/workspace.state';
import { todayKeys } from './useToday.hook';
import { inboxKeys } from './useInbox.hook';
import { IListModel, ITaskModel } from '../../model';
import { workSpaceKeys } from './useWorkSpaceQuery.hook';
import { tagKeys } from './tagQuery.hook';

const setTaskIntoList = (
  listId: string,
  taskId: string,
  updateTask: Partial<IUpdateTaskDTO>,
) => {
  const { listTaskInfo, setListInfo } = useWorkspaceStore.getState();

  const currentList = listTaskInfo[listId]?.list;
  if (!currentList?.sections) return;

  const updatedSections: typeof currentList.sections = currentList.sections.map((section) => ({
    ...section,
    tasks: (section.tasks ?? []).map((task) =>
      task.id === taskId ? ({ ...task, ...updateTask } as ITaskModel) : task,
    ) as ITaskModel[],
  }));

  setListInfo(listId, {
    list: {
      ...currentList,
      sections: updatedSections,
    },
  });
};

const isSameDayAsToday = (date?: string | Date | null): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

function getRelevantQueryKeys({
  listId,
  data,
  listTaskInfo,
}: {
  listId: string;
  data: Partial<IUpdateTaskDTO>;
  listTaskInfo: Record<string, any>;
}) {
  const newListId = data.list;
  const listChanged = !!newListId && newListId !== listId;
  const listContentChanged =
    'description' in data || 'status' in data || 'title' in data ||
    'dueDate' in data || 'rule' in data || 'completed' in data;

  const isCurrentListInbox =
    listTaskInfo[listId]?.list.name.toLocaleLowerCase() === 'inbox';
  const isNewListInbox =
    !!newListId && listTaskInfo[newListId]?.list.name.toLocaleLowerCase() === 'inbox';

  const isNowToday = isSameDayAsToday(data.rule?.start_date);
  const affectsToday =
    isNowToday || 'dueDate' in data || 'rule' in data || 'completed' in data || 'status' in data;

  return {
    lists: listChanged
      ? [listKeys.detail(listId), listKeys.detail(newListId!)]
      : listContentChanged
        ? [listKeys.detail(listId)]
        : [],
    inbox: isCurrentListInbox || isNewListInbox ? [inboxKeys.all] : [],
    today: affectsToday ? [todayKeys.today] : [],
    upComming: affectsToday ? [todayKeys.upComming] : [],
  };
}

function getRelevantQueryKeysForCreate({
  listId,
  data,
  listTaskInfo,
}: {
  listId: string;
  data: { rule?: { start_date?: null | Date }; list?: string };
  listTaskInfo: Record<string, any>;
}) {
  const targetListId = data.list ?? listId;
  const isTargetListInbox = listTaskInfo[targetListId]?.list.name.toLocaleLowerCase() === 'inbox';
  return {
    list: listKeys.detail(targetListId),
    inbox: isTargetListInbox ? [inboxKeys.all] : [],
  };
}

export const useCreateTask = (listId: string) => {
  const queryClient = useQueryClient();

  const { listTaskInfo,incrementListCount } = useWorkspaceStore();
  return useMutation({
    mutationFn: (data: ICreateTaskDTO) => taskApi.create(data, listId),
    onSuccess: (_response, variables) => {
      const { list, inbox } = getRelevantQueryKeysForCreate({
        listId,
        data: variables,
        listTaskInfo,
      });

      if(variables.rule.tags){
        queryClient.invalidateQueries({queryKey:tagKeys.all})
      }
      
      queryClient.invalidateQueries({ queryKey: list });
      inbox.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      queryClient.invalidateQueries({ queryKey: todayKeys.today })
      queryClient.invalidateQueries({ queryKey: todayKeys.upComming })
      queryClient.invalidateQueries({ queryKey: inboxKeys.all })
      queryClient.invalidateQueries({queryKey: workSpaceKeys.index()})
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      if(listId){
        incrementListCount(listId, -1)
      }
      console.error('Lỗi trong quá trình tạo:', error.response?.data?.message ?? error.message);
    },
  });
};

export const useCreateTaskWithSection = (listId: string, sectionId: string) => {
  const queryClient = useQueryClient();
  const { listTaskInfo,incrementListCount } = useWorkspaceStore();

  return useMutation({
    mutationFn: (data: ICreateTaskWithSectionDTO) =>
      taskApi.createTaskWithSection(data, listId, sectionId),
    onSuccess: (_response, variables) => {
      const newListId = variables.list ?? listId;
      const listChanged = newListId !== listId;
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
      if (listChanged) {
        queryClient.invalidateQueries({ queryKey: listKeys.detail(newListId) });
      }

            if(listId){
        incrementListCount(listId, 1)
    
      }

      const { inbox } = getRelevantQueryKeysForCreate({
        listId,
        data: {
          list: variables.list,
          rule: {
            start_date: variables.rule.start_date
          }
        },
        listTaskInfo,
      });

      if(variables.rule.tags){
        queryClient.invalidateQueries({queryKey:tagKeys.all})
      }

      inbox.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      queryClient.invalidateQueries({ queryKey: todayKeys.today })
      queryClient.invalidateQueries({ queryKey: inboxKeys.all })
      queryClient.invalidateQueries({queryKey:todayKeys.upComming})
      queryClient.invalidateQueries({queryKey: workSpaceKeys.index()})
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      if(listId){
        incrementListCount(listId, -1)
      }
      console.error(
        'Lỗi trong quá trình tạo:',
        error.response?.data?.message ?? error.message,
      );
    },
  });
};

export const useUpdateTask = (listId: string) => {
  const queryClient = useQueryClient();
  const { listTaskInfo,incrementListCount } = useWorkspaceStore();

  return useMutation({
    mutationFn: ({ data, taskId }: { taskId: string; data: Partial<IUpdateTaskDTO> }) =>
      taskApi.update(taskId, data),

    onMutate: ({ data, taskId }) => {
      setTaskIntoList(listId, taskId, data)
    },
    onSuccess: (_response, { data, taskId }) => {
      queryClient.invalidateQueries({queryKey:tagKeys.all})
    },
    onSettled: (_data, _error, { taskId, data }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      const { lists, inbox, today, upComming } = getRelevantQueryKeys({
        listId,
        data,
        listTaskInfo,
      });
      
      lists.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      inbox.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      today.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      upComming.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      queryClient.invalidateQueries({queryKey: workSpaceKeys.index()})
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error(
        'Cập nhật task thất bại, vui lòng thử lại sau:',
        error.response?.data?.message ?? error.message,
      );
    },
  });
};

export const useUpdateRule = (listId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, taskId }: { taskId: string; data: Partial<IRuleModel> }) =>
      taskApi.ruleUpdate(taskId, data),
    onMutate: async ({ taskId ,data}) => {
      const previousList = queryClient.getQueryData<IListModel>(listKeys.detail(listId));
      const previousTask = previousList?.sections
        ?.flatMap((section) => section.tasks ?? [])
        .find((task) => task.id === taskId);

      if(data.tags){
        queryClient.invalidateQueries({queryKey:tagKeys.all})
      }

      return { previous: previousTask };
    },

    onSuccess: (_response, { data, taskId }, context) => {
      const { previous } = context ?? {};
      const isToday = isSameDayAsToday(previous?.rule.start_date)
      const isOverDueDate = previous?.rule.start_date ? new Date(previous.rule.start_date) < new Date() : false
      if (isToday) {
        queryClient.invalidateQueries({ queryKey: todayKeys.today })
      }

      if (isOverDueDate) {
        queryClient.invalidateQueries({ queryKey: todayKeys.upComming })
      }

      if(data.tags){
              queryClient.invalidateQueries({queryKey:tagKeys.all})
      }

      queryClient.invalidateQueries({ queryKey: todayKeys.upComming })
      queryClient.invalidateQueries({ queryKey: todayKeys.today })
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
      queryClient.invalidateQueries({queryKey: workSpaceKeys.index()})
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error('Update rule failed:', error.response?.data?.message ?? error.message);
    },

    onSettled: (_data, errror, { taskId }) => { queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) }); }
  });
};

export const useRemoveTask = (listId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskApi.remove(id),
    onMutate: async (id: string) => {
      const task = queryClient.getQueryData<{
        rule?: { start_date?: string | Date };
        completed?: boolean;
      }>(taskKeys.detail(id));

      return {
        wasInToday: isSameDayAsToday(task?.rule?.start_date),
      };
    },
    onSuccess: (_data, id, context) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) });

      if (listId) {
        queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
      }
      queryClient.invalidateQueries({queryKey:tagKeys.all})
      queryClient.invalidateQueries({ queryKey: todayKeys.today });
      queryClient.invalidateQueries({queryKey:todayKeys.upComming})
      queryClient.invalidateQueries({queryKey: workSpaceKeys.index()})
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error('Xóa thất bại rồi:', error.response?.data?.message ?? error.message);
    },
  });
};


export const useUpdateTaskStatus = (listId:string) => {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, taskId }: { taskId: string; data:Pick<ITaskModel,"status"> }) =>
      taskApi.updateStatus(taskId, data),

    onSuccess:()=>{
      queryClient.invalidateQueries({ queryKey: todayKeys.today });
      queryClient.invalidateQueries({queryKey:todayKeys.upComming})
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
      queryClient.invalidateQueries({queryKey: workSpaceKeys.index()})
    }
 });
};
