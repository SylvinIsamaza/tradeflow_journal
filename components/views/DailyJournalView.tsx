"use client";

import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Trade, DailySummary, CommentType } from "../../types";
import { formatCurrency, getMonthName } from "../../utils";
import DayDetailsModal from "../DayDetailsModal";
import dynamic from "next/dynamic";

const CommentEditor = dynamic(() => import("../CommentEditor"), {
  ssr: false,
});

interface DailyJournalViewProps {
  trades: Trade[];
  summaries: Record<string, DailySummary>;
  selectedDate?: string | null;
  onDayClick?: (date: string) => void;
}

const DailyJournalView: React.FC<DailyJournalViewProps> = ({
  trades,
  summaries,
  selectedDate,
  onDayClick,
}) => {
  const [calDate, setCalDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [commentEditorState, setCommentEditorState] = useState<{ isOpen: boolean; type: CommentType } | null>(null);
  const dates = React.useMemo(
    () => Object.keys(summaries).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    ),
    [summaries]
  );
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Auto-expand the selected date
  useEffect(() => {
    if (selectedDate) {
      setExpandedDates((prev) => new Set([...prev, selectedDate]));
    }
  }, [selectedDate]);

  const toggleExpand = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) newExpanded.delete(date);
    else newExpanded.add(date);
    setExpandedDates(newExpanded);
  };

  const expandAll = () => {
    setExpandedDates(new Set(dates));
  };

  const collapseAll = () => {
    setExpandedDates(new Set());
  };

  const changeMonth = (delta: number) => {
    let newMonth = calDate.month + delta;
    let newYear = calDate.year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCalDate({ year: newYear, month: newMonth });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-500 pb-12">
      {/* Sidebar Calendar */}
      <div className="w-full xl:w-72 space-y-6 shrink-0 xl:sticky xl:top-0 xl:self-start">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-xs font-black text-slate-800 tracking-tight uppercase">
              {getMonthName(calDate.month)} {calDate.year}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-[10px] text-slate-300 font-black uppercase py-1"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: new Date(calDate.year, calDate.month + 1, 0).getDate() }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calDate.year}-${(calDate.month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
              const summary = summaries[dateStr];
              const today = new Date();
              const isToday = today.getFullYear() === calDate.year && today.getMonth() === calDate.month && today.getDate() === day;

              let highlight = "text-slate-400 hover:bg-slate-50";
              if (summary) {
                highlight =
                  summary.totalPnL >= 0
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                    : "bg-rose-500 text-white shadow-lg shadow-rose-200";
              }
              if (isToday) {
                highlight = "ring-2 ring-indigo-500 ring-offset-2 text-indigo-600 font-bold";
              }

              return (
                <div
                  key={i}
                  onClick={() => onDayClick?.(dateStr)}
                  className={`text-[10px] font-black p-2 rounded-lg transition-all cursor-pointer ${highlight} ${!summary ? "cursor-pointer hover:bg-slate-100" : "hover:scale-110"}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {/* Filter and Expand/Collapse Buttons */}
        <div className="flex justify-between items-center gap-2 px-2">
          {selectedDate ? (
            <button
              onClick={() => onDayClick?.(selectedDate === selectedDate ? "" : selectedDate)}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100 flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filter: {selectedDate}
            </button>
          ) : (
            <div></div>
          )}
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all border border-slate-200"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Filter dates to show only selected date */}
        {(() => {
          const filteredDates = selectedDate ? [selectedDate] : dates;
          return filteredDates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center shadow-sm">
            <p className="text-slate-400 font-bold text-sm">
              No journal entries yet. Log a trade to get started.
            </p>
          </div>
          ) : (
            filteredDates.map((date) => (
              <JournalEntry
                key={`${date}-${trades.filter((t) => t.date === date).length}-${summaries[date]?.totalPnL || 0}`}
                date={date}
                summary={summaries[date] || {
                  accountId: "",
                  date: date,
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
                }}
                trades={trades.filter((t) => t.date === date)}
                onClick={() => setSelectedDayDate(date)}
                isExpanded={expandedDates.has(date)}
                onToggleExpand={() => toggleExpand(date)}
              />
            ))
          );
        })()}
      </div>

      {/* Day Details Modal */}
      <DayDetailsModal
        isOpen={!!selectedDayDate && !commentEditorState}
        onClose={() => setSelectedDayDate(null)}
        date={selectedDayDate || ""}
        trades={trades.filter((t) => t.date === selectedDayDate)}
        summary={selectedDayDate ? summaries[selectedDayDate] : undefined}
        onAddTrade={() => {/* Navigate to add trade */}}
        onEditComment={(type) => setCommentEditorState({ isOpen: true, type })}
      />

      {/* Comment Editor */}
      {commentEditorState?.isOpen && selectedDayDate && (
        <CommentEditor
          date={selectedDayDate}
          type={commentEditorState.type}
          initialContent=""
          onSave={() => setCommentEditorState(null)}
          onClose={() => setCommentEditorState(null)}
        />
      )}
    </div>
  );
};

const JournalEntry = ({
  date,
  summary,
  trades,
  onClick,
  isExpanded,
  onToggleExpand,
}: any) => {
  // Calculate cumulative PnL growth from trades
  const pnlGrowthData = React.useMemo(() => {
    if (!trades || trades.length === 0) {
      return [0];
    }
    
    // Sort trades by execution time
    const sortedTrades = [...trades].sort((a, b) => {
      const timeA = a.executedAt || a.closeTime || "";
      const timeB = b.executedAt || b.closeTime || "";
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    });
    
    // Build cumulative PnL array starting from 0
    let cumulativePnL = 0;
    const data = [0]; // Start at 0
    
    sortedTrades.forEach((trade) => {
      cumulativePnL += trade.pnl || 0;
      data.push(cumulativePnL);
    });
    
    return data;
  }, [trades]);

  const isPositive = summary.totalPnL >= 0;

  const chartOption = {
    grid: { left: 5, right: 5, top: 10, bottom: 0 },
    xAxis: { type: "category", show: false },
    yAxis: { type: "value", show: false },
    series: [
      {
        data: pnlGrowthData,
        type: "line",
        smooth: true,
        lineStyle: {
          color: isPositive ? "#10b981" : "#f87171",
          width: 2,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: isPositive
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(248, 113, 113, 0.2)",
              },
              { offset: 1, color: "transparent" },
            ],
          },
        },
        symbol: "none",
      },
    ],
  };

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-[#5e5ce6]/20 transition-all group">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white group-hover:bg-slate-50/50 transition-colors gap-3">
        <div
          className="flex items-center gap-3 sm:gap-4 cursor-pointer"
          onClick={onToggleExpand}
        >
          <svg
            className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="text-[11px] sm:text-[12px] font-black text-slate-700">
              {formattedDate}
            </span>
            <div className="hidden sm:block w-px h-3 bg-slate-200"></div>
            <span
              className={`text-[11px] sm:text-[12px] font-black ${summary.totalPnL >= 0 ? "text-emerald-500" : "text-rose-500"}`}
            >
              Net P&L {formatCurrency(summary.totalPnL)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onClick}
            className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] sm:text-[11px] font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            Day Details
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex flex-row gap-8 items-center overflow-hidden">
        {/* Graph on the left, now clearly constrained */}
        <div className="w-24 sm:w-32 h-16 sm:h-20 shrink-0 flex flex-col items-center">
          <div className="flex-1 w-full">
            <ReactECharts
              option={chartOption}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
          <p className="text-[8px] text-slate-300 font-black text-center mt-1 uppercase tracking-widest whitespace-nowrap">
            Intraday P&L
          </p>
        </div>

        {/* Stats on the right */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-y-3 gap-x-4 sm:gap-x-8">
          <DataPoint label="Trades" value={trades.length} />
          <DataPoint
            label="Winners"
            value={trades.filter((t: any) => t.pnl > 0).length}
          />
          <DataPoint
            label="Lossers"
            value={trades.filter((t: any) => t.pnl < 0).length}
          />
          <DataPoint
            label="Winrate"
            value={`${trades.length > 0 ? ((trades.filter((t: any) => t.pnl > 0).length / trades.length) * 100).toFixed(0) : 0}%`}
          />
          <DataPoint
            label="Avg Win"
            value={formatCurrency(
             summary.totalPnL / trades.length ,
            )}
          />
          <DataPoint label="Comms" value={summary.totalCommission} />
          <DataPoint label="Volume" value={trades.length * 1000} />
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/50 p-4 sm:p-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            {trades.map((trade: any) => (
              <div
                key={trade.id}
                className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${trade.pnl >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                  >
                    {trade.side === "LONG" ? "L" : "S"}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      {trade.symbol}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {trade.tradeType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-black ${trade.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {formatCurrency(trade.pnl)}
                  </p>
                  <p className="text-[10px] text-slate-300 font-bold">
                    Qty: {trade.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DataPoint = ({ label, value }: any) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[8px] sm:text-[9px] text-slate-300 font-black uppercase tracking-widest leading-none truncate">
      {label}
    </p>
    <p className="text-[11px] sm:text-[13px] font-black text-slate-700 tracking-tight leading-none whitespace-nowrap">
      {value}
    </p>
  </div>
);

export default DailyJournalView;
