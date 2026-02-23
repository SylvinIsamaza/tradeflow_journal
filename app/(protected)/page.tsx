"use client";

import DashboardView from "@/components/views/DashboardView";
import { useTrades } from "@/lib/hooks";
import { useState } from "react";

export default function DashboardPage() {
  const { data: trades = [], isLoading } = useTrades();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardView trades={trades} onDayClick={setSelectedDate} />
    </div>
  );
}
