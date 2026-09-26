import { axiosInstance } from '@/app/(front)/lib/axios';
import { INotificationModel } from '@/app/(front)/model/notification.model';
export const notificationApi = {
  get: async (): Promise<INotificationModel[]> => {
    const res = await axiosInstance.get<{
      notification:INotificationModel[]
    }>(`/user/me/notification`);
    return res.data.notification;
  },

  updateRead:async ():Promise<boolean>=>{
    const res = await axiosInstance.patch<{
      success:boolean
    }>(`/user/me/notification`);
    return res.data.success;
  }

};

