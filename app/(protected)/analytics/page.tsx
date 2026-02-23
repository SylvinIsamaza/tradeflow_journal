"use client";

import AnalyticView from "@/components/views/AnalyticView";
import { useTrades } from "@/lib/hooks";
import { useState } from "react";

export default function AnalyticsPage() {
  const { data: trades = [], isLoading: tradesLoading } = useTrades();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (tradesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <AnalyticView trades={trades} onDayClick={setSelectedDate} />;
}
