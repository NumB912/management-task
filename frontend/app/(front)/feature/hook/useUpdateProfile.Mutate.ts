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

export const useUploadFile = ()=>{
  return useMutation({
    mutationFn: (data:File):Promise<string> =>
      userApi.uploadFile({
        data:data
      }),
  });
}

export const useDeleteFile = ()=>{
  return useMutation({
    mutationFn: ():Promise<void> =>
      userApi.deleteFile()
  });
}