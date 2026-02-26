"use client";

import AddTradeView from "@/components/views/AddTradeView";
import { useAccounts, useCreateTrade, useStrategies } from "@/lib/hooks";
import { useApp } from "@/app/AppContext";
import { useRouter } from "next/navigation";
import { Trade } from "@/types";

export default function AddTradePage() {
  const { selectedAccount: contextAccount } = useApp();
  const { data: accountsResponse, isLoading: accountsLoading } = useAccounts();
  const { data: strategiesResponse } = useStrategies(contextAccount?.id);
  
  const accounts = accountsResponse?.accounts || [];
  const strategies = strategiesResponse?.strategies || [];
  const createTrade = useCreateTrade();
  const router = useRouter();

  const selectedAccount = accounts[0] || { id: "" };

  const handleSave = async (tradeData: Omit<Trade, "accountId">) => {
    const newTrade = {
      account_id: selectedAccount.id,
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
    };

    await createTrade.mutateAsync(newTrade);
    router.push("/trades");
  };

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AddTradeView
      availableStrategies={strategies}
      onSave={handleSave}
      onCancel={() => router.push("/")}
    />
  );
}
