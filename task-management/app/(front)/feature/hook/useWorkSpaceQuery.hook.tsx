import { useQuery } from "@tanstack/react-query";
import { workSpaceApi } from "../api/workspace/workspace.api";

export const workSpaceKeys = {
    index:()=>["workspace"]
}
export const useWorkspace = () => {
  return useQuery({
    queryKey: workSpaceKeys.index(),
    queryFn: () => workSpaceApi.get(),
        staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });
};
