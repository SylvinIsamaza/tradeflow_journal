"use client";

import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import { Trade, DailySummary } from "../../types";
import { formatCurrency } from "../../utils";
import Calendar from "../Calendar";
import { useDayDetails } from "@/app/(protected)/DayDetailsContext";

interface DashboardViewProps {
  trades: Trade[];
  onDayClick?: (date: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  trades,
  onDayClick,
}) => {
  const [calDate, setCalDate] = useState({ year: 2024, month: 5 }); // June 2024
  const { openDayDetails } = useDayDetails();
  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);

  // Helper to create a complete DailySummary object
  const createEmptySummary = (date: string, accountId: string): DailySummary => ({
    accountId,
    date,
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
  });

  const dailySummaries = trades.reduce(
    (acc, trade) => {
      if (!acc[trade.date]) {
        acc[trade.date] = createEmptySummary(trade.date, trade.accountId);
      }
      acc[trade.date].totalPnL += trade.pnl;
      acc[trade.date].totalTrades += 1;
      acc[trade.date].tradeIds.push(trade.id);
      
      if (trade.pnl > 0) {
        acc[trade.date].wins += 1;
      } else if (trade.pnl < 0) {
        acc[trade.date].losses += 1;
      }
      
      return acc;
    },
    {} as Record<string, DailySummary>,
  );

  const radarOption = {
    radar: {
      indicator: [
        { name: "Win %", max: 100 },
        { name: "Profit factor", max: 5 },
        { name: "Avg win/loss", max: 10 },
        { name: "Recovery factor", max: 5 },
        { name: "Max drawdown", max: 100 },
        { name: "Consistency", max: 100 },
      ],
      shape: "polygon",
      splitNumber: 4,
      axisName: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
      splitLine: { lineStyle: { color: "#e2e8f0" } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [31.78, 1.82, 3.9, 2.5, 12, 85],
            name: "Zella Score",
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
        <div className="flex items-center gap-2 uppercase tracking-widest text-[9px] sm:text-[11px]">
          Last import: Jul 01, 2025 04:52 PM{" "}
          <span className="text-[#5e5ce6] cursor-pointer hover:underline font-black">
            Resync
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Net P&L"
          value={`${formatCurrency(totalPnL)}`}
          count={trades.length.toString()}
          color={totalPnL >= 0 ? "text-emerald-500" : "text-rose-500"}
        />
        <StatCard label="Trade win %" value="31.78%" gauge={31.78} />
        <StatCard label="Profit factor" value="1.82" gauge={60} />
        <StatCard label="Day win %" value="57.58%" gauge={57.58} />
        <StatCard label="Avg win/loss trade" value="3.90" isWinLoss={true} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 overflow-x-auto lg:overflow-visible h-fit">
          <Calendar
            year={calDate.year}
            month={calDate.month}
            onMonthChange={(y, m) => setCalDate({ year: y, month: m })}
            dailySummaries={dailySummaries}
            onDayClick={openDayDetails}
            selectedDate={null}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                Zella score <span className="text-slate-300 text-xs">ⓘ</span>
              </h3>
            </div>
            <div className="h-64 sm:h-72 xl:h-64 w-full">
              <ReactECharts
                option={radarOption}
                style={{ height: "100%", width: "100%" }}
                notMerge={true}
                lazyUpdate={false}
              />
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Your Zella Score
                </p>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
                  80.67
                </p>
              </div>
              <div className="w-1/2 flex flex-col gap-1.5">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-orange-400"
                    style={{ width: "20%" }}
                  ></div>
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: "30%" }}
                  ></div>
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: "30%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-300">
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                Recent Performance{" "}
                <span className="text-slate-300 text-xs">ⓘ</span>
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
    </div>
  );
};

const StatCard = ({
  label,
  value,
  count,
  gauge,
  color = "text-slate-800",
  isWinLoss,
}: any) => (
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
      <span className="text-slate-300 text-xs">ⓘ</span>
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
            <div className="h-full bg-[#10b981]" style={{ width: "80%" }}></div>
            <div className="h-full bg-rose-400" style={{ width: "20%" }}></div>
          </div>
          <div className="flex gap-2 sm:gap-3 text-[8px] sm:text-[9px] font-bold">
            <span className="text-emerald-500">$964</span>
            <span className="text-rose-400">-$247</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default DashboardView;
