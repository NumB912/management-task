
import { useQuery } from '@tanstack/react-query';

import { notificationApi } from '../api/notification/notification.api';
import { INotificationModel } from '../../model/notification.model';

export const useNotification = () => {
  return useQuery<INotificationModel[]>({
    queryKey: ["notification"],
    queryFn: () => notificationApi.get(),
  });
};

export const useNotificationDetail = (id: string) => {
  return useQuery<INotificationModel>({
    queryKey: ["notification", id],
    queryFn: () => notificationApi.detail(id),
  });
};