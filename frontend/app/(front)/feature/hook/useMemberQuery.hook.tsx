
import { useQuery } from '@tanstack/react-query';
import { IMemberModel } from '../../model/member.model';
import { MemberApi } from '../api/member/member.api';
export const useMemberGet = (listId:string) => {
  return useQuery<IMemberModel[]>({
    queryKey: ["members",listId],
    queryFn: () => MemberApi.get(listId),
  });
};