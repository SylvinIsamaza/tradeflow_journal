import { privateClient } from './axios';
import { DailySummary, MonthStats, AllTimeStats } from '@/types';

// API response types
interface DailySummaryResponse {
  account_id: string;
  date: string;
  total_profit: number;
  total_trades: number;
  missed_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  profit_factor: number;
  average_win: number;
  average_loss: number;
  average_rr: number;
  best_win: number;
  worst_loss: number;
  average_trade_duration: string;
  avg_win_streak: number;
  max_win_streak: number;
  avg_loss_streak: number;
  max_loss_streak: number;
  recovery_factor: number;
  max_drawdown: number;
  total_volume: number;
  total_commission: number;
  zella_score: number;
  win_rate_score: number;
  profit_factor_score: number;
  avg_win_loss_score: number;
  recovery_factor_score: number;
  max_drawdown_score: number;
  trade_ids: string[];
  total_comments: number;
}

interface MonthStatsResponse {
  account_id: string;
  month: string;
  total_profit: number;
  total_trades: number;
  missed_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  profit_factor: number;
  average_win: number;
  average_loss: number;
  average_rr: number;
  best_win: number;
  worst_loss: number;
  average_trade_duration: string;
  avg_win_streak: number;
  max_win_streak: number;
  avg_loss_streak: number;
  max_loss_streak: number;
  recovery_factor: number;
  max_drawdown: number;
  total_volume: number;
  total_commission: number;
  zella_score: number;
  win_rate_score: number;
  profit_factor_score: number;
  avg_win_loss_score: number;
  recovery_factor_score: number;
  max_drawdown_score: number;
  trade_ids: string[];
  total_comments: number;
}

interface AllTimeStatsResponse {
  account_id: string;
  total_profit: number;
  total_trades: number;
  missed_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  profit_factor: number;
  average_win: number;
  average_loss: number;
  average_rr: number;
  best_win: number;
  worst_loss: number;
  average_trade_duration: string;
  avg_win_streak: number;
  max_win_streak: number;
  avg_loss_streak: number;
  max_loss_streak: number;
  recovery_factor: number;
  max_drawdown: number;
  total_volume: number;
  total_commission: number;
  zella_score: number;
  win_rate_score: number;
  profit_factor_score: number;
  avg_win_loss_score: number;
  recovery_factor_score: number;
  max_drawdown_score: number;
  updated_at: string;
}

// Transform functions
const transformDailySummary = (data: DailySummaryResponse): DailySummary => ({
  accountId: data.account_id,
  date: data.date,
  totalPnL: data.total_profit,
  totalTrades: data.total_trades,
  missedTrades: data.missed_trades,
  wins: data.wins,
  losses: data.losses,
  winRate: data.win_rate,
  profitFactor: data.profit_factor,
  averageWin: data.average_win,
  averageLoss: data.average_loss,
  averageRR: data.average_rr,
  bestWin: data.best_win,
  worstLoss: data.worst_loss,
  averageTradeDuration: data.average_trade_duration,
  avgWinStreak: data.avg_win_streak,
  maxWinStreak: data.max_win_streak,
  avgLossStreak: data.avg_loss_streak,
  maxLossStreak: data.max_loss_streak,
  recoveryFactor: data.recovery_factor,
  maxDrawdown: data.max_drawdown,
  totalVolume: data.total_volume,
  totalCommission: data.total_commission,
  zellaScore: data.zella_score,
  winRateScore: data.win_rate_score,
  profitFactorScore: data.profit_factor_score,
  avgWinLossScore: data.avg_win_loss_score,
  recoveryFactorScore: data.recovery_factor_score,
  maxDrawdownScore: data.max_drawdown_score,
  tradeIds: data.trade_ids,
  totalComments: data.total_comments,
});

const transformMonthStats = (data: MonthStatsResponse): MonthStats => ({
  accountId: data.account_id,
  month: data.month,
  totalPnL: data.total_profit,
  totalTrades: data.total_trades,
  missedTrades: data.missed_trades,
  wins: data.wins,
  losses: data.losses,
  winRate: data.win_rate,
  profitFactor: data.profit_factor,
  averageWin: data.average_win,
  averageLoss: data.average_loss,
  averageRR: data.average_rr,
  bestWin: data.best_win,
  worstLoss: data.worst_loss,
  averageTradeDuration: data.average_trade_duration,
  avgWinStreak: data.avg_win_streak,
  maxWinStreak: data.max_win_streak,
  avgLossStreak: data.avg_loss_streak,
  maxLossStreak: data.max_loss_streak,
  recoveryFactor: data.recovery_factor,
  maxDrawdown: data.max_drawdown,
  totalVolume: data.total_volume,
  totalCommission: data.total_commission,
  zellaScore: data.zella_score,
  winRateScore: data.win_rate_score,
  profitFactorScore: data.profit_factor_score,
  avgWinLossScore: data.avg_win_loss_score,
  recoveryFactorScore: data.recovery_factor_score,
  maxDrawdownScore: data.max_drawdown_score,
  tradeIds: data.trade_ids,
  totalComments: data.total_comments,
});

const transformAllTimeStats = (data: AllTimeStatsResponse): AllTimeStats => ({
  accountId: data.account_id,
  totalPnL: data.total_profit,
  totalTrades: data.total_trades,
  missedTrades: data.missed_trades,
  wins: data.wins,
  losses: data.losses,
  winRate: data.win_rate,
  profitFactor: data.profit_factor,
  averageWin: data.average_win,
  averageLoss: data.average_loss,
  averageRR: data.average_rr,
  bestWin: data.best_win,
  worstLoss: data.worst_loss,
  averageTradeDuration: data.average_trade_duration,
  avgWinStreak: data.avg_win_streak,
  maxWinStreak: data.max_win_streak,
  avgLossStreak: data.avg_loss_streak,
  maxLossStreak: data.max_loss_streak,
  recoveryFactor: data.recovery_factor,
  maxDrawdown: data.max_drawdown,
  totalVolume: data.total_volume,
  totalCommission: data.total_commission,
  zellaScore: data.zella_score,
  winRateScore: data.win_rate_score,
  profitFactorScore: data.profit_factor_score,
  avgWinLossScore: data.avg_win_loss_score,
  recoveryFactorScore: data.recovery_factor_score,
  maxDrawdownScore: data.max_drawdown_score,
  updatedAt: data.updated_at,
});

export interface CompleteAnalyticsResponse {
  account_id: string;
  all_time: Record<string, any> | null;
  daily: Record<string, any>[];
  monthly: Record<string, any>[];
  recent_trades: Record<string, any>[];
  statistics: Record<string, any>;
  charts: Record<string, any>;
}

export interface DashboardResponse {
  account_id: string;
  net_pnl: number;
  total_trades: number;
  win_rate: number;
  profit_factor: number;
  day_win_rate: number;
  average_win_loss: number;
  zella_score: number;
  win_rate_score: number;
  profit_factor_score: number;
  avg_win_loss_score: number;
  recovery_factor_score: number;
  max_drawdown_score: number;
  wins: number;
  losses: number;
  total_commission: number;
  best_win: number;
  worst_loss: number;
  average_trade_duration: string;
  avg_win_streak: number;
  max_win_streak: number;
  avg_loss_streak: number;
  max_loss_streak: number;
  daily_summaries: Record<string, any>[];
  recent_trades: Record<string, any>[];
  charts: Record<string, any>;
  last_import: string | null;
}

// ============================================
// Analytics API Service
// ============================================

export const analyticsApi = {
  // Get dashboard data with filtering support
  async getDashboard(
    accountId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<DashboardResponse | null> {
    try {
      let url = `/analytics/dashboard/${accountId}?limit=${limit}`;
      if (startDate && endDate) {
        url = `/analytics/dashboard/${accountId}?start_date=${startDate}&end_date=${endDate}&limit=${limit}`;
      }
      const response = await privateClient.get<DashboardResponse>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      return null;
    }
  },

  // Get complete analytics in a single call
  async getCompleteAnalytics(
    accountId: string,
    days: number = 30,
    startDate?: string,
    endDate?: string
  ): Promise<CompleteAnalyticsResponse | null> {
    try {
      let url = `/analytics/complete/${accountId}?days=${days}`;
      if (startDate && endDate) {
        url = `/analytics/complete/${accountId}?start_date=${startDate}&end_date=${endDate}`;
      }
      const response = await privateClient.get<CompleteAnalyticsResponse>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch complete analytics:", error);
      return null;
    }
  },

  // Get daily summary for a specific date
  async getDailySummary(accountId: string, date: string): Promise<DailySummary | null> {
    try {
      const response = await privateClient.get<DailySummaryResponse>(
        `/analytics/${accountId}/daily/${date}`
      );
      return transformDailySummary(response.data);
    } catch (error) {
      return null;
    }
  },

  // Get daily summaries for a date range
  async getDailySummaries(
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<DailySummary[]> {
    const response = await privateClient.get<DailySummaryResponse[]>(
      `/analytics/${accountId}/daily?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data.map(transformDailySummary);
  },

  // Get monthly stats
  async getMonthlyStats(accountId: string, month: string): Promise<MonthStats | null> {
    try {
      const response = await privateClient.get<MonthStatsResponse>(
        `/analytics/${accountId}/monthly/${month}`
      );
      return transformMonthStats(response.data);
    } catch (error) {
      return null;
    }
  },

  // Get all monthly stats for account
  async getMonthlyStatsAll(accountId: string): Promise<MonthStats[]> {
    const response = await privateClient.get<MonthStatsResponse[]>(
      `/analytics/${accountId}/monthly`
    );
    return response.data.map(transformMonthStats);
  },

  // Get all-time stats
  async getAllTimeStats(accountId: string): Promise<AllTimeStats | null> {
    try {
      const response = await privateClient.get<AllTimeStatsResponse>(
        `/analytics/${accountId}/all-time`
      );
      return transformAllTimeStats(response.data);
    } catch (error) {
      return null;
    }
  },
};

export default analyticsApi;