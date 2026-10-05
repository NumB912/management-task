import { useMutation } from "@tanstack/react-query";
import { IUserModel } from "../../model";
import { userApi } from "../api/user/user.api";

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data:Partial<Pick<IUserModel,"name"|"avatar">>) =>
      userApi.updateProfile({
        data
      }),
  });
};