import { axiosInstance } from '@/app/(front)/lib/axios';
import { IUserModel } from '@/app/(front)/model';
export const userApi = {
  updateProfile: async ({ data }: { data: Partial<Pick<IUserModel,"name"|"avatar">> }): Promise<boolean> => {
    const res = await axiosInstance.patch(`/user/me`,data);
    return res.data;
  },

};