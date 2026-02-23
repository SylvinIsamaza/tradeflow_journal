import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';
import { DailySummary, MonthStats, AllTimeStats } from '@/types';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  daily: (accountId: string, date: string) => [...analyticsKeys.all, 'daily', accountId, date] as const,
  dailyRange: (accountId: string, startDate: string, endDate: string) =>
    [...analyticsKeys.all, 'daily', accountId, 'range', startDate, endDate] as const,
  monthly: (accountId: string, month: string) => [...analyticsKeys.all, 'monthly', accountId, month] as const,
  monthlyAll: (accountId: string) => [...analyticsKeys.all, 'monthly', accountId] as const,
  allTime: (accountId: string) => [...analyticsKeys.all, 'allTime', accountId] as const,
};

// ============================================
// Analytics Hooks
// ============================================

// Get daily summary for a specific date
export function useDailySummary(accountId: string, date: string) {
  return useQuery({
    queryKey: analyticsKeys.daily(accountId, date),
    queryFn: () => analyticsApi.getDailySummary(accountId, date),
    enabled: !!accountId && !!date,
  });
}

// Get daily summaries for a date range
export function useDailySummaries(accountId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: analyticsKeys.dailyRange(accountId, startDate, endDate),
    queryFn: () => analyticsApi.getDailySummaries(accountId, startDate, endDate),
    enabled: !!accountId && !!startDate && !!endDate,
  });
}

// Get monthly stats
export function useMonthlyStats(accountId: string, month: string) {
  return useQuery({
    queryKey: analyticsKeys.monthly(accountId, month),
    queryFn: () => analyticsApi.getMonthlyStats(accountId, month),
    enabled: !!accountId && !!month,
  });
}

// Get all monthly stats
export function useMonthlyStatsAll(accountId: string) {
  return useQuery({
    queryKey: analyticsKeys.monthlyAll(accountId),
    queryFn: () => analyticsApi.getMonthlyStatsAll(accountId),
    enabled: !!accountId,
  });
}

// Get all-time stats
export function useAllTimeStats(accountId: string) {
  return useQuery({
    queryKey: analyticsKeys.allTime(accountId),
    queryFn: () => analyticsApi.getAllTimeStats(accountId),
    enabled: !!accountId,
  });
}

export default useDailySummary;