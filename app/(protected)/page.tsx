"use client";

import DashboardView from "@/components/views/DashboardView";
import { useDashboard } from "@/lib/hooks/useAnalytics";
import { useApp } from "@/app/AppContext";
import { useState, useMemo } from "react";
import { Trade, DailySummary } from "@/types";

export default function DashboardPage() {
  const { selectedAccount, dateRange } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Use dashboard API with date range from TopBar filters
  const { data: dashboardData, isLoading } = useDashboard(
    selectedAccount?.id || "",
    dateRange.start,
    dateRange.end,
    100 // Get recent trades for dashboard
  );

  // Transform dashboard data to trades format for DashboardView
  const trades = useMemo(() => {
    if (!dashboardData?.recent_trades) return [];
    return dashboardData.recent_trades.map((trade: any) => ({
      id: trade.id,
      accountId: trade.account_id,
      symbol: trade.symbol,
      side: trade.side,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price,
      closePrice: trade.close_price,
      quantity: trade.quantity,
      pnl: trade.pnl,
      commission: trade.commission,
      swap: trade.swap,
      duration: trade.duration,
      tradeType: trade.trade_type,
      executionType: trade.execution_type,
      status: trade.status,
      stopLoss: trade.stop_loss,
      takeProfit: trade.take_profit,
      setups: trade.setups || [],
      generalTags: trade.general_tags || [],
      exitTags: trade.exit_tags || [],
      processTags: trade.process_tags || [],
      notes: trade.notes,
      executedAt: trade.executed_at ? new Date(trade.executed_at) : null,
      closedAt: trade.closed_at ? new Date(trade.closed_at) : null,
      date: trade.date,
      time: trade.time,
      closeTime: trade.close_time,
    } as Trade));
  }, [dashboardData]);

  // Transform daily summaries for calendar
  const dailySummaries = useMemo(() => {
    if (!dashboardData?.daily_summaries) return {} as Record<string, DailySummary>;
    const summaries: Record<string, DailySummary> = {};
    for (const day of dashboardData.daily_summaries) {
      summaries[day.date] = {
        accountId: day.account_id,
        date: day.date,
        totalPnL: day.total_profit,
        totalTrades: day.total_trades,
        missedTrades: day.missed_trades,
        wins: day.wins,
        losses: day.losses,
        winRate: day.win_rate,
        profitFactor: day.profit_factor,
        averageWin: day.average_win,
        averageLoss: day.average_loss,
        averageRR: day.average_rr,
        bestWin: day.best_win,
        worstLoss: day.worst_loss,
        averageTradeDuration: day.average_trade_duration,
        avgWinStreak: day.avg_win_streak,
        maxWinStreak: day.max_win_streak,
        avgLossStreak: day.avg_loss_streak,
        maxLossStreak: day.max_loss_streak,
        recoveryFactor: day.recovery_factor,
        maxDrawdown: day.max_drawdown,
        totalVolume: day.total_volume,
        totalCommission: day.total_commission,
        zellaScore: day.zella_score,
        winRateScore: day.win_rate_score,
        profitFactorScore: day.profit_factor_score,
        avgWinLossScore: day.avg_win_loss_score,
        recoveryFactorScore: day.recovery_factor_score,
        maxDrawdownScore: day.max_drawdown_score,
        tradeIds: day.trade_ids,
        totalComments: day.total_comments,
      };
    }
    return summaries;
  }, [dashboardData]);

  // Get dashboard stats
  const stats = {
    netPnl: dashboardData?.net_pnl || 0,
    totalTrades: dashboardData?.total_trades || 0,
    winRate: dashboardData?.win_rate || 0,
    profitFactor: dashboardData?.profit_factor || 0,
    dayWinRate: dashboardData?.day_win_rate || 0,
    averageWinLoss: dashboardData?.average_win_loss || 0,
    zellaScore: dashboardData?.zella_score || 0,
    winRateScore: dashboardData?.win_rate_score || 0,
    profitFactorScore: dashboardData?.profit_factor_score || 0,
    avgWinLossScore: dashboardData?.avg_win_loss_score || 0,
    recoveryFactorScore: dashboardData?.recovery_factor_score || 0,
    maxDrawdownScore: dashboardData?.max_drawdown_score || 0,
    wins: dashboardData?.wins || 0,
    losses: dashboardData?.losses || 0,
    totalCommission: dashboardData?.total_commission || 0,
    bestWin: dashboardData?.best_win || 0,
    worstLoss: dashboardData?.worst_loss || 0,
    averageTradeDuration: dashboardData?.average_trade_duration || "0m",
    avgWinStreak: dashboardData?.avg_win_streak || 0,
    maxWinStreak: dashboardData?.max_win_streak || 0,
    avgLossStreak: dashboardData?.avg_loss_streak || 0,
    maxLossStreak: dashboardData?.max_loss_streak || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardView
        trades={trades}
        onDayClick={setSelectedDate}
        dailySummaries={dailySummaries}
        stats={stats}
        charts={dashboardData?.charts}
        lastImport={dashboardData?.last_import}
      />
    </div>
  );
}
