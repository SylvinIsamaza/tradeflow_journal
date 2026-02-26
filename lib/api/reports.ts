import { privateClient } from './axios';

// Export types for use in components
export interface ReportDataPoint {
  key: string;
  pnl: number;
  count: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface BestWorstStats {
  best_key: string | null;
  best_pnl: number;
  worst_key: string | null;
  worst_pnl: number;
  most_key: string | null;
  most_count: number;
  least_key: string | null;
  least_count: number;
}

interface OverviewStats {
  total_trades: number;
  missed_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  average_pnl: number;
  average_rr: number;
  profit_factor: number;
  total_commission: number;
  total_volume: number;
}

interface SessionStats {
  london: number;
  ny: number;
  other: number;
  london_count: number;
  ny_count: number;
  other_count: number;
}

interface WeeklyStats {
  week_number: number;
  week_start: string;
  week_end: string;
  total_pnl: number;
  total_trades: number;
}

interface MonthlyStatsReport {
  month: string;
  total_pnl: number;
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface CompleteReportsResponse {
  account_id: string;
  period_start: string | null;
  period_end: string | null;
  by_symbol: ReportDataPoint[];
  symbol_best: BestWorstStats;
  by_day: ReportDataPoint[];
  day_best: BestWorstStats;
  by_month: ReportDataPoint[];
  month_best: BestWorstStats;
  by_time: ReportDataPoint[];
  time_best: BestWorstStats;
  by_tags: ReportDataPoint[];
  by_setups: ReportDataPoint[];
  overview: OverviewStats;
  sessions: SessionStats;
  weekly: WeeklyStats[];
  monthly: MonthlyStatsReport[];
  equity_curve: [string, number][];
}

// ============================================
// Reports API Service
// ============================================

export const reportsApi = {
  // Get complete reports data in a single call
  async getCompleteReports(
    accountId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CompleteReportsResponse | null> {
    try {
      let url = `/reports/complete/${accountId}`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await privateClient.get<CompleteReportsResponse>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch complete reports:", error);
      return null;
    }
  },
};

export default reportsApi;