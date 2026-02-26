"use client";

import AnalyticView from "@/components/views/AnalyticView";
import { useAnalytics } from "@/lib/hooks";
import { useApp } from "@/app/AppContext";
import { useState } from "react";

export default function AnalyticsPage() {
  const { selectedAccount, dateRange } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Use the complete analytics API with date range from TopBar filters
  const { data: analyticsData, isLoading } = useAnalytics(
    selectedAccount?.id || '',
    30,
    dateRange.start,
    dateRange.end
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AnalyticView
      analyticsData={analyticsData}
      onDayClick={setSelectedDate}
    />
  );
}
