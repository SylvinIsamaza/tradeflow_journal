"use client";

import TradeLogView from "@/components/views/TradeLogView";
import { useTrades } from "@/lib/hooks";
import { useApp } from "@/app/AppContext";

export default function TradesPage() {
  const { selectedAccount } = useApp();
  const { data: trades = [], isLoading } = useTrades({ account_id: selectedAccount?.id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  console.log("trades", trades);

  return <TradeLogView trades={trades} />;
}
