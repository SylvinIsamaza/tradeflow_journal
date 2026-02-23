import { privateClient, publicClient } from './axios';
import { Trade, TradeSide, TradeStatus } from '@/types';

// API response types matching backend schemas
interface TradeResponse {
  id: string;
  account_id: string;
  symbol: string;
  side: string;
  entry_price: number | null;
  exit_price: number | null;
  close_price: number | null;
  quantity: number | null;
  pnl: number | null;
  commission: number;
  swap: number;
  duration: string | null;
  trade_type: string | null;
  execution_type: string | null;
  status: string | null;
  stop_loss: number | null;
  take_profit: number | null;
  setups: string[];
  general_tags: string[];
  exit_tags: string[];
  process_tags: string[];
  notes: string | null;
  executed_at: string;
  closed_at: string | null;
  date: string;
  time: string | null;
  close_time: string | null;
}

interface TradeFilters {
  account_id?: string;
  start_date?: string;
  end_date?: string;
  side?: TradeSide;
  status?: TradeStatus;
  symbol?: string;
  limit?: number;
  offset?: number;
}

interface ImportResult {
  success: boolean;
  imported_count: number;
  error_count: number;
  errors: string[];
  trades: Array<{
    id: string;
    symbol: string;
    side: string;
    pnl: number;
    date: string;
  }>;
}

// Convert snake_case to camelCase
const transformTrade = (trade: TradeResponse): Trade => ({
  id: trade.id,
  accountId: trade.account_id,
  symbol: trade.symbol,
  side: trade.side as TradeSide,
  entryPrice: trade.entry_price || 0,
  exitPrice: trade.exit_price || 0,
  closePrice: trade.close_price || 0,
  quantity: trade.quantity || 0,
  pnl: trade.pnl || 0,
  commission: trade.commission,
  swap: trade.swap,
  duration: trade.duration || '',
  tradeType: trade.trade_type || '',
  executionType: trade.execution_type || '',
  status: (trade.status as TradeStatus) || TradeStatus.BE,
  stopLoss: trade.stop_loss || 0,
  takeProfit: trade.take_profit || 0,
  setups: trade.setups || [],
  generalTags: trade.general_tags || [],
  exitTags: trade.exit_tags || [],
  processTags: trade.process_tags || [],
  notes: trade.notes || undefined,
  executedAt: trade.executed_at,
  closedAt: trade.closed_at || undefined,
  date: trade.date,
  time: trade.time || undefined,
  closeTime: trade.close_time || undefined,
});

// ============================================
// Trades API Service
// ============================================

export const tradesApi = {
  // Get all trades with filters
  async getAll(filters: TradeFilters = {}): Promise<Trade[]> {
    const params = new URLSearchParams();
    
    if (filters.account_id) params.append('account_id', filters.account_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.side) params.append('side', filters.side);
    if (filters.status) params.append('status', filters.status);
    if (filters.symbol) params.append('symbol', filters.symbol);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await privateClient.get<TradeResponse[]>(`/trades/?${params.toString()}`);
    console.log("tradesSDFADS", response.data);
    return response.data.map(transformTrade);
  },

  // Get single trade
  async getById(tradeId: string): Promise<Trade | null> {
    try {
      const response = await privateClient.get<TradeResponse>(`/trades/${tradeId}`);
      return transformTrade(response.data);
    } catch (error) {
      return null;
    }
  },

  // Create new trade
  async create(data: {
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
  }): Promise<Trade> {
    const response = await privateClient.post<TradeResponse>('/trades/', data);
    return transformTrade(response.data);
  },

  // Update trade
  async update(tradeId: string, data: Partial<{
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
  }>): Promise<Trade> {
    const response = await privateClient.put<TradeResponse>(`/trades/${tradeId}`, data);
    return transformTrade(response.data);
  },

  // Delete trade
  async delete(tradeId: string): Promise<void> {
    await privateClient.delete(`/trades/${tradeId}`);
  },

  // Import trades from file
  async import(accountId: string, file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('account_id', accountId);
    formData.append('file', file);

    const response = await privateClient.post<ImportResult>('/import/trades', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Preview import (without creating trades)
  async previewImport(accountId: string, file: File): Promise<{
    total_positions: number;
    preview: any[];
  }> {
    const formData = new FormData();
    formData.append('account_id', accountId);
    formData.append('file', file);

    const response = await privateClient.post<{
      total_positions: number;
      preview: any[];
    }>('/import/trades/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default tradesApi;