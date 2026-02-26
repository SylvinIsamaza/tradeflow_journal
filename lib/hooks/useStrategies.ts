import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { strategiesApi } from '@/lib/api/strategies';
import { PaginationInfo } from '@/types';

export const strategyKeys = {
  all: ['strategies'] as const,
  lists: () => [...strategyKeys.all, 'list'] as const,
  list: (accountId?: string) => [...strategyKeys.lists(), accountId] as const,
  details: () => [...strategyKeys.all, 'detail'] as const,
  detail: (id: string) => [...strategyKeys.details(), id] as const,
};

export function useStrategies(accountId?: string, limit: number = 50, offset: number = 0) {
  return useQuery<{ strategies: any[]; pagination: PaginationInfo }>({
    queryKey: strategyKeys.list(accountId),
    queryFn: () => strategiesApi.getAll(accountId, limit, offset),
  });
}

export function useStrategy(id: string) {
  return useQuery({
    queryKey: strategyKeys.detail(id),
    queryFn: () => strategiesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: strategiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() });
    },
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => strategiesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: strategiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() });
    },
  });
}
