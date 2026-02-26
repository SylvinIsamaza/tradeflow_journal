import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  lists: () => [...analyticsKeys.all, 'list'] as const,
  list: (accountId: string, days?: number, startDate?: string, endDate?: string) =>
    [...analyticsKeys.lists(), accountId, days, startDate, endDate] as const,
  dashboard: (accountId: string, startDate?: string, endDate?: string) =>
    [...analyticsKeys.all, 'dashboard', accountId, startDate, endDate] as const,
};

export function useAnalytics(
  accountId: string,
  days: number = 30,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: analyticsKeys.list(accountId, days, startDate, endDate),
    queryFn: () => {
      if (!accountId) return Promise.resolve(null);
      return analyticsApi.getCompleteAnalytics(accountId, days, startDate, endDate);
    },
    enabled: !!accountId,
  });
}

export function useDashboard(
  accountId: string,
  startDate?: string,
  endDate?: string,
  limit: number = 100
) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(accountId, startDate, endDate),
    queryFn: () => {
      if (!accountId) return Promise.resolve(null);
      return analyticsApi.getDashboard(accountId, startDate, endDate, limit);
    },
    enabled: !!accountId,
  });
}