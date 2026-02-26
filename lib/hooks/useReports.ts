import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (accountId: string, startDate?: string, endDate?: string) => 
    [...reportKeys.lists(), accountId, startDate, endDate] as const,
};

export function useReports(accountId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: reportKeys.list(accountId || '', startDate, endDate),
    queryFn: () => {
      if (!accountId) return Promise.resolve(null);
      return reportsApi.getCompleteReports(accountId, startDate, endDate);
    },
    enabled: !!accountId,
  });
}