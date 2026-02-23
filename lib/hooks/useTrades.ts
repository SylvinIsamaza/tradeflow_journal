import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradesApi } from '@/lib/api/trades';
import { Trade, TradeSide, TradeStatus } from '@/types';

// Query keys
export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...tradeKeys.lists(), filters] as const,
  details: () => [...tradeKeys.all, 'detail'] as const,
  detail: (tradeId: string) => [...tradeKeys.details(), tradeId] as const,
};

// ============================================
// Trade Hooks
// ============================================

// Get all trades with filters
export function useTrades(filters: {
  account_id?: string;
  start_date?: string;
  end_date?: string;
  side?: TradeSide;
  status?: TradeStatus;
  symbol?: string;
  limit?: number;
  offset?: number;
} = {}) {
  return useQuery({
    queryKey: tradeKeys.list(filters),
    queryFn: () => tradesApi.getAll(filters),
  });
}

// Get single trade
export function useTrade(tradeId: string) {
  return useQuery({
    queryKey: tradeKeys.detail(tradeId),
    queryFn: () => tradesApi.getById(tradeId),
    enabled: !!tradeId,
  });
}

// Create trade mutation
export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      account_id: string;
      symbol: string;
      side: TradeSide;
      entry_price?: number;
      exit_price?: number;
      quantity?: number;
      pnl?: number;
      commission?: number;
      swap?: number;
      duration?: string;
      trade_type?: string;
      execution_type?: string;
      status?: TradeStatus;
      stop_loss?: number;
      take_profit?: number;
      executed_at: string;
      date: string;
      time?: string;
      close_time?: string;
    }) => tradesApi.create(data),
    onSuccess: () => {
      // Invalidate trades list
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
    },
  });
}

// Update trade mutation
export function useUpdateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tradeId,
      data,
    }: {
      tradeId: string;
      data: Partial<{
        symbol: string;
        side: TradeSide;
        entry_price: number;
        exit_price: number;
        quantity: number;
        pnl: number;
        commission: number;
        swap: number;
        duration: string;
        trade_type: string;
        execution_type: string;
        status: TradeStatus;
        stop_loss: number;
        take_profit: number;
        executed_at: string;
        date: string;
        time: string;
        close_time: string;
      }>;
    }) => tradesApi.update(tradeId, data),
    onSuccess: (_, { tradeId }) => {
      // Invalidate trade detail and list
      queryClient.invalidateQueries({ queryKey: tradeKeys.detail(tradeId) });
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
    },
  });
}

// Delete trade mutation
export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeId: string) => tradesApi.delete(tradeId),
    onSuccess: () => {
      // Invalidate trades list
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
    },
  });
}

// Import trades mutation
export function useImportTrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, file }: { accountId: string; file: File }) =>
      tradesApi.import(accountId, file),
    onSuccess: () => {
      // Invalidate trades list
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
    },
  });
}

// Preview import mutation
export function usePreviewImport() {
  return useMutation({
    mutationFn: ({ accountId, file }: { accountId: string; file: File }) =>
      tradesApi.previewImport(accountId, file),
  });
}

export default useTrades;