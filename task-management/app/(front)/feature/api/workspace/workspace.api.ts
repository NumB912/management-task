import { axiosInstance } from "@/app/(front)/lib/axios";
import { IWorkspaceGetDTO } from "@/app/(front)/model/DTO/workspaceGet.DTO";


export const workSpaceApi = {
  get: async (): Promise<IWorkspaceGetDTO> => {
    const res = await axiosInstance.get<{
      data:IWorkspaceGetDTO
    }>(`/workspace`);
    return res.data.data;
  },
};

