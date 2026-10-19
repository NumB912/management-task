import { axiosInstance } from "../../../lib/axios";
import type {
  AdminUsersPage,
  AdminUserWorkStatistics,
} from "../../../model/admin.model";

export const adminApi = {
  async getUserWorkStatistics(
    userId: string,
    days: number,
  ): Promise<AdminUserWorkStatistics> {
    return (
      await axiosInstance.get<AdminUserWorkStatistics>(
        `/admin/users/${userId}/statistics`,
        { params: { days } },
      )
    ).data;
  },
  async updateUser(
    id: string,
    input: { name: string; role: string; blocked: boolean },
  ) {
    return (await axiosInstance.patch(`/admin/users/${id}`, input)).data;
  },
  async getUsers(params: {
    search: string;
    page: number;
  }): Promise<AdminUsersPage> {
    return (await axiosInstance.get<AdminUsersPage>("/admin/users", { params }))
      .data;
  },
};
