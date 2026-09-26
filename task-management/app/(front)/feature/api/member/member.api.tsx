import { axiosInstance } from '@/app/(front)/lib/axios';
import { IListModel, ITaskModel } from '@/app/(front)/model';
import { IMemberModel } from '@/app/(front)/model/member.model';
export const MemberApi = {
  inviteMember: async (listId:string,members:string[]): Promise<IListModel> => {
    const res = await axiosInstance.post<{list:IListModel}>(`/lists/${listId}/members`, {
      listId:listId,
      members:members
    });
    return res.data.list;
  },
  acceptOrNotWithInvite:async (listId:string,data:Pick<IMemberModel,"status">)=>{
    const res = await axiosInstance.patch(`/lists/${listId}/members/inviteStatus`,{
      status:data.status,
    })
    return res.data
  },

  get:async (listId:string)=>{
    const res = await axiosInstance.patch(`/lists/${listId}/members`,{
      listId:listId
    })
    return res.data
  },
  updateMembers:async(id:string,listId:string,data:Pick<IMemberModel,"role">)=>{
    const res = await axiosInstance.patch(`/lists/${listId}/members/${id}`,{
      role:data.role,
    })
    return res.data
  }
  
};