import { useMutation } from "@tanstack/react-query";
import { notificationApi } from "../api/notification/notification.api";

export const useReadNotification = () => {
  return useMutation({
    mutationFn: () => notificationApi.updateRead(),
  });
};