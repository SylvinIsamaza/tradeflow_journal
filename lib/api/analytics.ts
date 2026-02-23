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

// ============================================
// Analytics API Service
// ============================================

export const analyticsApi = {
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