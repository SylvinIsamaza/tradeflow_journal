"use client";

import ReportsView from "@/components/views/ReportsView";
import { useTrades } from "@/lib/hooks";

export default function ReportsPage() {
  const { data: trades = [], isLoading } = useTrades();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <ReportsView trades={trades} />;
}
