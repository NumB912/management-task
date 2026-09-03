
import { useQuery } from '@tanstack/react-query';
import { todayApi } from '../api/today/today.api';
import { upCommingApi } from '../api/upComming/upComming.api';


export const todayKeys = {
  today: ['today'] as const,
  upComming:['upComming'] as const
};

export const useToday = () => {
  return useQuery({
    queryKey: todayKeys.today,
    queryFn: () => todayApi.getToday(),
  });
};

export const useUpComming= () => {
  return useQuery({
    queryKey: todayKeys.upComming,
    queryFn: () => upCommingApi.getToday(),
  });
};