"use client";

import ReportsView from "@/components/views/ReportsView";
import { useReports } from "@/lib/hooks";
import { useApp } from "@/app/AppContext";

export default function ReportsPage() {
  const { selectedAccount, dateRange } = useApp();
  
  // Use the complete reports API with date range from TopBar filters
  const { data: reportsData, isLoading } = useReports(
    selectedAccount?.id,
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

  return <ReportsView reportsData={reportsData} />;
}
