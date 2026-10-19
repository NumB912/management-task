import { useQuery, useQueryClient } from "@tanstack/react-query";
import { inboxApi } from "../api/inbox/inbox.api";
export const inboxKeys = {
  all: ["Inbox"] as const,
  list: () => [...inboxKeys.all, "list"] as const,
  count: () => [...inboxKeys.all, "count"] as const,
};
export const useInbox = () => {
  return useQuery({
    queryKey: inboxKeys.list(),
    queryFn: () => inboxApi.get(),
  });
};

export const useInvalidateInbox = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: inboxKeys.all });
};