import { axiosInstance } from '@/app/(front)/lib/axios';
import { IUserModel } from '@/app/(front)/model';
export const userApi = {
  updateProfile: async ({ data }: { data: Partial<Pick<IUserModel,"name">> }): Promise<boolean> => {
    const res = await axiosInstance.patch(`/user/me`,data);
    return res.data;
  },

  uploadFile: async ({ data }: { data:File}): Promise<string> => {
    const form = new FormData()
    form.append('file',data)
    const res = await axiosInstance.patch<{path:string}>(`/user/me/profile/avatar`,form,{
      headers:{
        "Content-Type":undefined
      }
    });
    return res.data.path;
  },

  deleteFile: async (): Promise<void> => {
    await axiosInstance.delete<{path:string}>(`/user/me/profile/avatar`);
  },
};