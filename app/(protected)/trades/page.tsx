"use client";

import { useState } from "react";
import TradeLogView from "@/components/views/TradeLogView";
import TradeEditor from "@/components/TradeEditor";
import { useTrades, useUpdateTrade, useStrategies } from "@/lib/hooks";
import { useApp } from "@/app/AppContext";
import { Trade, Strategy } from "@/types";

export default function TradesPage() {
  const { selectedAccount, dateRange, filters } = useApp();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  
  const { data: tradesResponse, isLoading, refetch } = useTrades({
    account_id: selectedAccount?.id,
    start_date: dateRange.start,
    end_date: dateRange.end,
    side: filters.sides?.[0],
    symbol: filters.symbols?.[0],
    limit,
    offset: (page - 1) * limit
  });
  const trades = tradesResponse?.trades || [];
  const pagination = tradesResponse?.pagination;
  
  const { data: strategiesResponse } = useStrategies(selectedAccount?.id);
  const strategies = strategiesResponse?.strategies || [];
  const updateTradeMutation = useUpdateTrade();
  
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
  };

  const handleSaveEdit = async (tradeData: Omit<Trade, 'accountId'>) => {
    if (!selectedAccount?.id || !editingTrade) return;
    
    try {
      await updateTradeMutation.mutateAsync({
        tradeId: editingTrade.id,
        data: {
          symbol: tradeData.symbol,
          side: tradeData.side,
          entry_price: tradeData.entryPrice,
          exit_price: tradeData.exitPrice,
          quantity: tradeData.quantity,
          pnl: tradeData.pnl,
          commission: tradeData.commission,
          swap: tradeData.swap,
          duration: tradeData.duration,
          trade_type: tradeData.tradeType,
          execution_type: tradeData.executionType,
          status: tradeData.status,
          stop_loss: tradeData.stopLoss,
          take_profit: tradeData.takeProfit,
          executed_at: tradeData.executedAt,
          date: tradeData.date,
          time: tradeData.time,
          close_time: tradeData.closeTime,
        }
      });
      setEditingTrade(null);
      refetch();
    } catch (error) {
      console.error("Failed to update trade:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <TradeLogView
        trades={trades}
        onEditTrade={handleEditTrade}
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
      
      {editingTrade && (
        <TradeEditor
          date={editingTrade.date}
          initialTrade={editingTrade}
          onSave={handleSaveEdit}
          onClose={() => setEditingTrade(null)}
          availableStrategies={strategies as Strategy[]}
          isEditMode={true}
        />
      )}
    </>
  );
}
