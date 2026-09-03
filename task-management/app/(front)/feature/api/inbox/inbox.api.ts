import { axiosInstance } from "@/app/(front)/lib/axios";
import { IListModel } from "@/app/(front)/model";

export const inboxApi = {
  get: async (): Promise<IListModel> => {
    const response = await axiosInstance.get<{data:IListModel}>("/inbox");
    return response.data.data;
  },
};