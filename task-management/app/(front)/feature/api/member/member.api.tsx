import { ApiError, axiosInstance } from "@/app/(front)/lib/axios";
import { IListModel, ITaskModel } from "@/app/(front)/model";
import { IMemberModel, IRoleMember } from "@/app/(front)/model/member.model";
import axios from "axios";

export const MemberApi = {
  inviteMember: async (listId: string, email: string[]): Promise<boolean> => {
    try {
      const res = await axiosInstance.post<{ success: boolean }>(
        `/lists/${listId}/members`,
        {
          listId: listId,
          email: email,
        },
      );
      return res.data.success;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const body = error.response.data;
        throw new ApiError(body, error.response.status);
      }
      throw error;
    }
  },

  acceptOrNotWithInvite: async (
    listId: string,
    data: Pick<IMemberModel, "status">,
  ) => {
    try {
      const res = await axiosInstance.patch(
        `/lists/${listId}/members/inviteStatus`,
        {
          status: data.status,
        },
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const body = error.response.data;
        throw new ApiError(body, error.response.status);
      }
      throw error;
    }
  },

  get: async (listId: string) => {
    try {
      const res = await axiosInstance.patch(`/lists/${listId}/members`, {
        listId: listId,
      });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const body = error.response.data;
        throw new ApiError(body, error.response.status);
      }
      throw error;
    }
  },

  updateMember: async (email: string, listId: string, role: IRoleMember) => {
    try {
      const res = await axiosInstance.patch(`/lists/${listId}/members/${email}`, {
        role: role,
      });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const body = error.response.data;
        throw new ApiError(body, error.response.status);
      }
      throw error;
    }
  },

  removeMember: async (email: string, listId: string) => {
    try {
      const res = await axiosInstance.delete(`/lists/${listId}/members/${email}`);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const body = error.response.data;
        throw new ApiError(body, error.response.status);
      }
      throw error;
    }
  },
};