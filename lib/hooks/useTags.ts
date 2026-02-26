import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/lib/api/tags';
import { PaginationInfo } from '@/types';

// Query keys
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...tagKeys.lists(), filters] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (tagId: string) => [...tagKeys.details(), tagId] as const,
};

// ============================================
// Tag Hooks
// ============================================

// Get all tags with filters and pagination
export function useTags(filters: {
  account_id?: string;
  type?: string;
  strategy_id?: string;
} = {}) {
  return useQuery<{ tags: any[]; pagination: PaginationInfo }>({
    queryKey: tagKeys.list(filters),
    queryFn: () => tagsApi.getAll(filters),
  });
}

// Get single tag
export function useTag(tagId: string) {
  return useQuery({
    queryKey: tagKeys.detail(tagId),
    queryFn: () => tagsApi.getById(tagId),
    enabled: !!tagId,
  });
}

// Create tag mutation
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      account_id: string;
      name: string;
      type: string;
      strategy_id?: number;
      color?: string;
    }) => tagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

// Update tag mutation
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tagId,
      data,
    }: {
      tagId: string;
      data: {
        name?: string;
        color?: string;
      };
    }) => tagsApi.update(tagId, data),
    onSuccess: (_, { tagId }) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(tagId) });
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

// Delete tag mutation
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => tagsApi.delete(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

export default useTags;