"use client";

import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import { Trade, DailySummary, CommentType } from "../../types";
import { formatCurrency } from "../../utils";
import Calendar from "../Calendar";
import DayDetailsModal from "../DayDetailsModal";
import ScoreScale from "../ScoreScale";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import Link from "next/link";

const CommentEditor = dynamic(() => import("../CommentEditor"), {
  ssr: false,
});

interface DashboardStats {
  netPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  dayWinRate: number;
  averageWinLoss: number;
  zellaScore: number;
  winRateScore: number;
  profitFactorScore: number;
  avgWinLossScore: number;
  recoveryFactorScore: number;
  maxDrawdownScore: number;
  wins: number;
  losses: number;
  totalCommission: number;
  bestWin: number;
  worstLoss: number;
  averageTradeDuration: string;
  avgWinStreak: number;
  maxWinStreak: number;
  avgLossStreak: number;
  maxLossStreak: number;
}

interface DashboardViewProps {
  trades: Trade[];
  onDayClick?: (date: string) => void;
  dailySummaries?: Record<string, DailySummary>;
  stats?: DashboardStats;
  charts?: Record<string, any>;
  lastImport?: string | null;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  trades,
  onDayClick,
  dailySummaries: propDailySummaries,
  stats: propStats,
  charts: propCharts,
  lastImport,
}) => {
  const [calDate, setCalDate] = useState({ year: new Date().getFullYear(), month: new Date().getMonth()  });
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [commentEditorState, setCommentEditorState] = useState<{ isOpen: boolean; type: CommentType } | null>(null);
  
  // Use stats from props (backend) or calculate from trades
  const stats = propStats || {
    netPnl: trades.reduce((acc, t) => acc + (t.pnl || 0), 0),
    totalTrades: trades.length,
    winRate: 0,
    profitFactor: 0,
    dayWinRate: 0,
    averageWinLoss: 0,
    zellaScore: 0,
    winRateScore: 0,
    profitFactorScore: 0,
    avgWinLossScore: 0,
    recoveryFactorScore: 0,
    maxDrawdownScore: 0,
    wins: trades.filter(t => (t.pnl || 0) > 0).length,
    losses: trades.filter(t => (t.pnl || 0) < 0).length,
    totalCommission: 0,
    bestWin: 0,
    worstLoss: 0,
    averageTradeDuration: '0m',
    avgWinStreak: 0,
    maxWinStreak: 0,
    avgLossStreak: 0,
    maxLossStreak: 0,
  };

  // Use daily summaries from props (backend) or calculate from trades
  const dailySummaries = propDailySummaries || (trades.reduce(
    (acc, trade) => {
      if (!acc[trade.date]) {
        acc[trade.date] = {
          accountId: trade.accountId,
          date: trade.date,
          totalPnL: 0,
          totalTrades: 0,
          missedTrades: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          profitFactor: 0,
          averageWin: 0,
          averageLoss: 0,
          averageRR: 0,
          bestWin: 0,
          worstLoss: 0,
          averageTradeDuration: '0',
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
        };
      }
      acc[trade.date].totalPnL += (trade.pnl || 0);
      acc[trade.date].totalTrades += 1;
      acc[trade.date].tradeIds.push(trade.id);
      
      if ((trade.pnl || 0) > 0) {
        acc[trade.date].wins += 1;
      } else if ((trade.pnl || 0) < 0) {
        acc[trade.date].losses += 1;
      }
      
      return acc;
    },
    {} as Record<string, DailySummary>,
  ));

  const totalPnL = stats.netPnl || trades.reduce((acc, t) => acc + (t.pnl || 0), 0);

  const radarOption = {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      containLabel: true,
    },
    radar: {
      indicator: [
        { name: "Win %", max: 100 },
        { name: "Profit factor", max: 100 },
        { name: "Avg win/loss", max: 100 },
        { name: "Recovery factor", max: 100 },
        { name: "Max drawdown", max: 100 },
        { name: "Consistency", max: 100 },
      ],
      shape: "polygon",
      splitNumber: 4,
      axisName: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      center: ['50%', '50%'],
      radius: '55%',
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [31.78, 1.82, 3.9, 2.5, 12, 85],
            name: " Score",
            areaStyle: { color: "rgba(94, 92, 230, 0.2)" },
            lineStyle: { color: "#5e5ce6", width: 2 },
            symbol: "circle",
            symbolSize: 4,
            itemStyle: { color: "#5e5ce6" },
          },
        ],
      },
    ],
  };

  // Format the last import date
  const formattedLastImport = React.useMemo(() => {
    if (!lastImport) return null;
    try {
      const date = new Date(lastImport);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return null;
    }
  }, [lastImport]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
        <div className="flex items-center gap-2 uppercase tracking-widest text-[9px] sm:text-[11px]">
          {formattedLastImport ? (
            <>Last import: {formattedLastImport}</>
          ) : (
            <span className="text-slate-300">No trades imported yet</span>
          )}{" "}
          <Link href={"/add-trade"} className="text-[#5e5ce6] cursor-pointer hover:underline font-black">
            Resync
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Net P&L"
          value={`${formatCurrency(totalPnL)}`}
          count={stats.totalTrades.toString()}
          color={totalPnL >= 0 ? "text-emerald-500" : "text-rose-500"}
          tooltip="Total profit/loss from all trades in the selected period"
        />
        <StatCard
          label="Trade win %"
          value={`${stats.winRate.toFixed(2)}%`}
          gauge={Math.min(stats.winRate, 100)}
          tooltip="Percentage of winning trades vs total trades"
        />
        <StatCard
          label="Profit factor"
          value={stats.profitFactor.toFixed(2)}
          gauge={Math.min((stats.profitFactor / 3) * 100, 100)}
          tooltip="Ratio of gross profit to gross loss (higher is better)"
        />
        <StatCard
          label="Day win %"
          value={`${stats.dayWinRate.toFixed(2)}%`}
          gauge={Math.min(stats.dayWinRate, 100)}
          tooltip="Percentage of profitable trading days"
        />
        <StatCard
          label="Avg win/loss trade"
          value={stats.averageWinLoss.toFixed(2)}
          isWinLoss={true}
          winAmount={stats.wins > 0 ? (stats.bestWin || 0) : 0}
          lossAmount={stats.losses > 0 ? (stats.worstLoss || 0) : 0}
          tooltip="Average profit per winning trade vs average loss per losing trade"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 overflow-x-auto lg:overflow-visible h-fit">
          <Calendar
            year={calDate.year}
            month={calDate.month}
            onMonthChange={(y, m) => setCalDate({ year: y, month: m })}
            dailySummaries={dailySummaries}
            onDayClick={setSelectedDayDate}
            selectedDate={null}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                Score{" "}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-300 text-xs cursor-help">ⓘ</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Composite score based on win rate, profit factor, risk management, and consistency</p>
                  </TooltipContent>
                </Tooltip>
              </h3>
            </div>
            <div className="h-64 sm:h-72 xl:h-64 w-full">
              <ReactECharts
                option={{
                  ...radarOption,
                  series: [{
                    type: "radar",
                    data: [{
                      value: [
                        stats.winRateScore,
                        stats.profitFactorScore,
                        stats.avgWinLossScore,
                        stats.recoveryFactorScore,
                        stats.maxDrawdownScore,
                        stats.dayWinRate,
                      ],
                      name: "Score",
                      areaStyle: { color: "rgba(94, 92, 230, 0.2)" },
                      lineStyle: { color: "#5e5ce6", width: 2 },
                      symbol: "circle",
                      symbolSize: 4,
                      itemStyle: { color: "#5e5ce6" },
                    }],
                  }],
                }}
                style={{ height: "100%", width: "100%" }}
                notMerge={true}
                lazyUpdate={false}
              />
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Your  Score
                </p>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
                  {stats.zellaScore.toFixed(2)}
                </p>
              </div>
              <div className="w-1/2">
                <ScoreScale score={stats.zellaScore} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                Recent Performance{" "}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-300 text-xs cursor-help">ⓘ</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your 5 most recent trades with P&L and direction</p>
                  </TooltipContent>
                </Tooltip>
              </h3>
            </div>
            <div className="space-y-4">
              {trades.slice(0, 5).map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1 h-8 rounded-full ${trade.pnl >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                    ></div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                        {trade.symbol}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {trade.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-black ${trade.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {formatCurrency(trade.pnl)}
                    </p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase">
                      {trade.side}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      <DayDetailsModal
        isOpen={!!selectedDayDate && !commentEditorState}
        onClose={() => setSelectedDayDate(null)}
        date={selectedDayDate || ""}
        trades={trades.filter((t) => t.date === selectedDayDate)}
        summary={selectedDayDate ? dailySummaries[selectedDayDate] : undefined}
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

interface StatCardProps {
  label: string;
  value: string;
  count?: string;
  gauge?: number;
  color?: string;
  isWinLoss?: boolean;
  winAmount?: number;
  lossAmount?: number;
  tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  count,
  gauge,
  color = "text-slate-800",
  isWinLoss,
  winAmount = 0,
  lossAmount = 0,
  tooltip,
}) => (
  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[110px] sm:h-[130px] transition-all hover:border-[#5e5ce6]/30 group cursor-default">
    <div className="flex justify-between items-start">
      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {label}{" "}
        {count && (
          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] text-slate-500 font-bold">
            {count}
          </span>
        )}
      </p>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-slate-300 text-xs cursor-help">ⓘ</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>

    <div className="flex items-end justify-between">
      <p
        className={`text-xl sm:text-2xl font-black ${color} tracking-tight leading-none`}
      >
        {value}
      </p>

      {gauge !== undefined && (
        <div className="w-[50px] sm:w-[60px] h-[25px] sm:h-[30px] overflow-hidden relative">
          <div className="w-[50px] sm:w-[60px] h-[50px] sm:h-[60px] rounded-full border-[4px] sm:border-[6px] border-slate-50 absolute -bottom-[25px] sm:-bottom-[30px]"></div>
          <div
            className="w-[50px] sm:w-[60px] h-[50px] sm:h-[60px] rounded-full border-[4px] sm:border-[6px] border-[#5e5ce6] absolute -bottom-[25px] sm:-bottom-[30px]"
            style={{
              clipPath: `polygon(0 0, ${gauge}% 0, ${gauge}% 100%, 0 100%)`,
            }}
          ></div>
        </div>
      )}

      {isWinLoss && (
        <div className="flex flex-col items-end gap-1 sm:gap-1.5">
          <div className="w-20 sm:w-24 h-1.5 bg-slate-100 rounded-full flex overflow-hidden">
            <div className="h-full bg-[#10b981]" style={{ width: winAmount > 0 && lossAmount < 0 ? "80%" : "50%" }}></div>
            <div className="h-full bg-rose-400" style={{ width: winAmount > 0 && lossAmount < 0 ? "20%" : "50%" }}></div>
          </div>
          <div className="flex gap-2 sm:gap-3 text-[8px] sm:text-[9px] font-bold">
            <span className="text-emerald-500">{formatCurrency(winAmount)}</span>
            <span className="text-rose-400">{formatCurrency(lossAmount)}</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default DashboardView;
