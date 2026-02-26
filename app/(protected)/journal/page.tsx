"use client";

import DailyJournalView from "@/components/views/DailyJournalView";
import { useTrades } from "@/lib/hooks";
import { useApp } from "@/app/AppContext";
import { useState, useMemo } from "react";
import { DailySummary } from "@/types";

export default function JournalPage() {
const { selectedAccount, dateRange } = useApp();
const [selectedDate, setSelectedDate] = useState<string | null>(null);

// Handle date selection - convert empty string to null
const handleDateSelect = (date: string) => {
  setSelectedDate(date || null);
};

// Build date filter based on selected date or TopBar date range
const dateFilter = useMemo(() => {
  if (selectedDate) {
    return {
      start_date: selectedDate,
      end_date: selectedDate,
    };
  }
  // Use TopBar date range
  return {
    start_date: dateRange.start,
    end_date: dateRange.end,
  };
}, [selectedDate, dateRange]);

const { data: tradesResponse, isLoading } = useTrades({
  account_id: selectedAccount?.id,
  start_date: dateFilter.start_date,
  end_date: dateFilter.end_date,
  limit: 100,
});

const trades = tradesResponse?.trades || [];

  // Compute daily summaries from trades
  const dailySummaries = useMemo(() => {

    const summaries: Record<string, DailySummary> = {};
    trades.forEach((trade) => {
      console.log(trade);
      if (!summaries[trade.date]) {
        summaries[trade.date] = {
          accountId: trade.accountId,
          date: trade.date,
          totalPnL: 0,
          totalTrades: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          profitFactor: 0,
          averageWin: 0,
          averageLoss: 0,
          averageRR: 0,
          bestWin: 0,
          worstLoss: 0,
          averageTradeDuration: "0",
          avgWinStreak: 0,
          maxWinStreak: 0,
          avgLossStreak: 0,
          maxLossStreak: 0,
          recoveryFactor: 0,
          maxDrawdown: 0,
          totalVolume: 0,
          totalCommission: 0,
          zellaScore: 0,
          winRateScore: 0,
          profitFactorScore: 0,
          avgWinLossScore: 0,
          recoveryFactorScore: 0,
          maxDrawdownScore: 0,
          tradeIds: [],
          totalComments: 0,
          missedTrades: 0,
        };
      }
      const summary = summaries[trade.date];
      summary.totalPnL += trade.pnl;
      summary.totalTrades += 1;
      summary.wins += trade.pnl > 0 ? 1 : 0;
      summary.losses += trade.pnl < 0 ? 1 : 0;
      summary.tradeIds.push(trade.id);
      if (trade.pnl > 0) summary.wins += 1;
      else summary.losses += 1;
      summary.totalCommission += trade.commission;
    });

    // Calculate derived fields
    Object.values(summaries).forEach((summary) => {
      const { wins, losses, totalTrades } = summary;
      summary.winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    });

    return summaries;
  }, [trades]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  console.log("Trades", trades);

  return (
    <DailyJournalView
      trades={trades}
      summaries={dailySummaries}
      selectedDate={selectedDate}
      onDayClick={handleDateSelect}
    />
  );
}
