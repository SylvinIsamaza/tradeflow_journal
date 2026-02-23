"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AICompanion from "@/components/AICompanion";
import DayDetailsModal from "@/components/DayDetailsModal";
import TradeEditor from "@/components/TradeEditor";
import { useApp } from "../AppContext";
import { useDayDetails } from "./DayDetailsContext";
import { useAccounts } from "@/lib/hooks";

// Dynamic import for CommentEditor (requires document which is not available during SSR)
const CommentEditor = dynamic(() => import("@/components/CommentEditor"), {
  ssr: false,
});

import { Account, AccountType } from "@/types";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: accountsData = [], isLoading: accountsLoading } = useAccounts();
  
  const {
    selectedAccount,
    setSelectedAccount,
    dateRange,
    setDateRange,
    filters,
    setFilters,
    currency,
    setCurrency,
    filteredTrades,
    dailySummaries,
    strategies,
    addStrategy,
    updateStrategy,
    deleteStrategy,
  } = useApp();

  // Use accounts from backend, fallback to default if empty
  const accounts: Account[] = accountsData.length > 0 ? accountsData : [
    { id: "acc-1", userId: "user-1", brokerName: "Demo Broker", baseCurrency: "USD", name: "Demo account", type: AccountType.DEMO, createdAt: "2024-01-01T00:00:00Z" },
  ];

  const {
    selectedDate,
    isTradeEditorOpen,
    commentEditorState,
    setSelectedDate,
    setIsTradeEditorOpen,
    setCommentEditorState,
  } = useDayDetails();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAICompanionOpen, setIsAICompanionOpen] = useState(false);

  const getPageTitle = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    return segments
      .map((s) =>
        s
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
      )
      .join(" > ");
  };

  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") {
      router.push("/");
    } else if (tab === "analytic") {
      router.push("/analytics");
    } else if (tab === "daily-journal") {
      router.push("/journal");
    } else if (tab === "trades") {
      router.push("/trades");
    } else if (tab === "reports") {
      router.push("/reports");
    } else if (tab === "notebook") {
      router.push("/playbooks"); // Assuming notebook is under playbooks
    } else if (tab === "playbooks") {
      router.push("/playbooks");
    } else if (tab === "add-trade") {
      router.push("/add-trade");
    } else if (tab === "settings") {
      router.push("/settings");
    } else if (tab === "profile") {
      router.push("/profile");
    }
    setIsSidebarOpen(false);
  };

  const getActiveTab = (path: string) => {
    if (path === "/") return "dashboard";
    const segments = path.split("/").filter(Boolean);
    return segments[0] || "dashboard";
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900 overflow-hidden h-screen font-inter relative">
      {(isSidebarOpen || isAICompanionOpen) && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55]"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsAICompanionOpen(false);
          }}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-[60] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar
          activeTab={getActiveTab(pathname)}
          onTabChange={handleTabChange}
          onOpenAI={() => setIsAICompanionOpen(true)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <TopBar
            onAddTrade={() => router.push("/add-trade")}
            title={getPageTitle(pathname)}
            currency={currency}
            onCurrencyChange={setCurrency}
            accounts={accounts}
            selectedAccount={accountsLoading ? accounts[0] : selectedAccount}
            onAccountChange={setSelectedAccount}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={filters}
            onFiltersChange={setFilters}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>

      <AICompanion
        isOpen={isAICompanionOpen}
        onClose={() => setIsAICompanionOpen(false)}
        trades={filteredTrades}
      />

      <DayDetailsModal
        isOpen={!!selectedDate && !isTradeEditorOpen && !commentEditorState}
        onClose={() => setSelectedDate(null)}
        date={selectedDate || ""}
        trades={filteredTrades.filter((t) => t.date === selectedDate)}
        summary={selectedDate ? dailySummaries[selectedDate] : undefined}
        onAddTrade={() => router.push("/add-trade")}
        onEditComment={(type) => setCommentEditorState({ isOpen: true, type })}
      />

      {isTradeEditorOpen && (
        <TradeEditor
          date={selectedDate || new Date().toISOString().split("T")[0]}
          availableStrategies={strategies}
          onSave={(t) => {
            /* handle save */ setIsTradeEditorOpen(false);
          }}
          onClose={() => setIsTradeEditorOpen(false)}
        />
      )}

      {commentEditorState?.isOpen && selectedDate && (
        <CommentEditor
          date={selectedDate}
          type={commentEditorState.type}
          initialContent=""
          onSave={() => setCommentEditorState(null)}
          onClose={() => setCommentEditorState(null)}
        />
      )}
    </div>
  );
}
