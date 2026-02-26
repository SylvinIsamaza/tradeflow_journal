import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/lib/api/accounts';
import { Account, AccountType, PaginationInfo } from '@/types';

// Query keys
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (accountId: string) => [...accountKeys.details(), accountId] as const,
};

// ============================================
// Account Hooks
// ============================================

// Get all accounts with pagination
export function useAccounts(limit: number = 50, offset: number = 0) {
  return useQuery<{ accounts: Account[]; pagination: PaginationInfo }>({
    queryKey: accountKeys.list({ limit, offset }),
    queryFn: () => accountsApi.getAll(limit, offset),
  });
}

// Get single account
export function useAccount(accountId: string) {
  return useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => accountsApi.getById(accountId),
    enabled: !!accountId,
  });
}

// Create account mutation
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      broker_name: string;
      base_currency?: string;
      name: string;
      type: AccountType;
    }) => accountsApi.create(data),
    onSuccess: () => {
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}

// Update account mutation
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: string;
      data: {
        broker_name?: string;
        base_currency?: string;
        name?: string;
      };
    }) => accountsApi.update(accountId, data),
    onSuccess: (_, { accountId }) => {
      // Invalidate account detail and list
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(accountId) });
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}

// Delete account mutation
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => accountsApi.delete(accountId),
    onSuccess: () => {
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}

export default useAccounts;