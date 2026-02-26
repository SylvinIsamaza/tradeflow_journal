"use client";

import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import { DailySummary, CommentType } from "../../types";
import Calendar from "../Calendar";
import DayDetailsModal from "../DayDetailsModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { CompleteAnalyticsResponse } from "../../lib/api/analytics";

const CommentEditor = dynamic(() => import("../CommentEditor"), {
  ssr: false,
});

interface AnalyticViewProps {
  analyticsData?: CompleteAnalyticsResponse | null;
  onDayClick?: (date: string) => void;
}

const AnalyticView: React.FC<AnalyticViewProps> = ({ analyticsData, onDayClick }) => {
  // Use current date for calendar
  const now = new Date();
  const [calDate, setCalDate] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [commentEditorState, setCommentEditorState] = useState<{ isOpen: boolean; type: CommentType } | null>(null);

  // Get data from API response (all calculated on backend)
  const allTime = analyticsData?.all_time || {};
  const daily = analyticsData?.daily || [];
  const monthly = analyticsData?.monthly || [];
  const charts = analyticsData?.charts || {};
  
  // Extract values for display (ensure they are numbers)
  const totalTrades = Number(allTime?.total_trades) || 0;
  const totalPnL = Number(allTime?.total_profit) || 0;
  const winners = Number(allTime?.wins) || 0;
  const losers = Number(allTime?.losses) || 0;
  const winRate = Number(allTime?.win_rate) || 0;
  const profitFactor = Number(allTime?.profit_factor) || 0;
  const averageWin = Number(allTime?.average_win) || 0;
  const averageLoss = Number(allTime?.average_loss) || 0;
  const bestWin = Number(allTime?.best_win) || 0;
  const worstLoss = Number(allTime?.worst_loss) || 0;
  const averageRR = Number(allTime?.average_rr) || 0;
  const totalCommission = Number(allTime?.total_commission) || 0;
  
  // Extract streak data from API (calculated on backend)
  const avgWinStreak = Number(allTime?.avg_win_streak) || 0;
  const maxWinStreak = Number(allTime?.max_win_streak) || 0;
  const avgLossStreak = Number(allTime?.avg_loss_streak) || 0;
  const maxLossStreak = Number(allTime?.max_loss_streak) || 0;
  
  // Average trade duration from backend
  const avgTradeDuration = allTime?.average_trade_duration || '0m';

  // Build daily summaries for calendar from API data
  const dailySummaries: Record<string, DailySummary> = {};
  
  daily.forEach((day: any) => {
    dailySummaries[day.date] = {
      accountId: day.account_id || '',
      date: day.date || '',
      totalPnL: day.total_profit || 0,
      totalTrades: day.total_trades || 0,
      missedTrades: day.missed_trades || 0,
      wins: day.wins || 0,
      losses: day.losses || 0,
      winRate: day.win_rate || 0,
      profitFactor: day.profit_factor || 0,
      averageWin: day.average_win || 0,
      averageLoss: day.average_loss || 0,
      averageRR: day.average_rr || 0,
      bestWin: day.best_win || 0,
      worstLoss: day.worst_loss || 0,
      averageTradeDuration: day.average_trade_duration || '0m',
      avgWinStreak: day.avg_win_streak || 0,
      maxWinStreak: day.max_win_streak || 0,
      avgLossStreak: day.avg_loss_streak || 0,
      maxLossStreak: day.max_loss_streak || 0,
      recoveryFactor: day.recovery_factor || 0,
      maxDrawdown: day.max_drawdown || 0,
      totalVolume: day.total_volume || 0,
      totalCommission: day.total_commission || 0,
      zellaScore: day.zella_score || 0,
      winRateScore: day.win_rate_score || 0,
      profitFactorScore: day.profit_factor_score || 0,
      avgWinLossScore: day.avg_win_loss_score || 0,
      recoveryFactorScore: day.recovery_factor_score || 0,
      maxDrawdownScore: day.max_drawdown_score || 0,
      tradeIds: day.trade_ids || [],
      totalComments: day.total_comments || 0,
    };
  });

  // Build equity curve from daily data (calculated on backend)
  const equityData: [string, number][] = (() => {
    let cumulativePnL = 0;
    const sortedDaily = [...daily].sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortedDaily.map((day: any) => {
      cumulativePnL += day.total_profit || 0;
      return [day.date, cumulativePnL] as [string, number];
    });
  })();

  // Chart data from backend (calculated on backend)
  const pnlByDayOfWeek = charts?.pnl_by_day_of_week || { days: [], data: [], trade_count: [] };
  const winRateByDayOfWeek = charts?.win_rate_by_day_of_week || [];
  const tradesBySession = charts?.trades_by_session || { London: 0, NY: 0, Other: 0 };
  const pnlByTimeHeld = charts?.pnl_by_time_held || { labels: [], wins: [], losses: [] };
  const pnlByWeek = charts?.pnl_by_week || [];
  const scatterData = charts?.scatter_data || { winning: [], losing: [] };

  // Monthly totals from backend
  const monthlyTotals = monthly.length > 0 ? {
    pnl: monthly[0].total_profit || 0,
    count: monthly[0].total_trades || 0,
  } : { pnl: 0, count: 0 };

  const equityOption = {
    tooltip: { trigger: "axis" },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "5%",
      containLabel: true,
    },
    
    xAxis: {
      axisLine: {
            show: true,
            onZero: false // Ensures the y-axis crosses the x-axis at x=0
        },
      type: "category",
    
      data: equityData.map((d) => d[0]),
      axisLabel: { color: "#94a3b8", fontSize: 10 },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8", fontSize: 10 },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    series: [
      {
        data: equityData.map((d) => d[1]),
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#ff4d00", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(255, 77, 0, 0.1)" },
              { offset: 1, color: "transparent" },
            ],
          },
        },
      },
    ],
  };

  // Radar chart option - using data from backend
  const radarOption = (title: string, sessionData: number[]) => ({
    title: {
      text: title,
      left: "center",
      top: "bottom",
      textStyle: { fontSize: 10, color: "#94a3b8", fontWeight: "bold" },
    },
    radar: {
      indicator: [
        { name: "Ldn", max: 100 },
        { name: "Ny", max: 100 },
        { name: "Other", max: 100 },
      ],
      shape: "polygon",
      axisName: { color: "#94a3b8", fontSize: 9 },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: sessionData,
            itemStyle: { color: "#ff4d00" },
            areaStyle: { color: "rgba(255, 77, 0, 0.3)" },
          },
        ],
      },
    ],
  });

  // Bar chart option - using data from backend
  const barOptionPnLByDay = {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: pnlByDayOfWeek.days || [],
      axisLabel: { fontSize: 9 },
    },
    yAxis: {
      type: "value",
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    grid: { top: 10, bottom: 20, left: 0, right: 0 },
    series: [
      {
        data: (pnlByDayOfWeek.data || []).map((v: number) => ({
          value: v,
          itemStyle: { color: v >= 0 ? "#10b981" : "#f87171" }
        })),
        type: "bar"
      },
    ],
  };

  // Trade distribution by day - using data from backend
  const barOptionTradeDist = {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: pnlByDayOfWeek.days || [],
      axisLabel: { fontSize: 9 },
    },
    yAxis: {
      type: "value",
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    grid: { top: 10, bottom: 20, left: 0, right: 0 },
    series: [
      {
        data: pnlByDayOfWeek.trade_count || [],
        type: "bar",
        itemStyle: { color: "#ff4d00" }
      },
    ],
  };

  // Bar chart option for P&L by time held - using data from backend
  const barOptionTimeHeld = {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: pnlByTimeHeld.labels || [],
      axisLabel: { fontSize: 9 },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 9 },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    grid: { top: 10, bottom: 20, left: 30, right: 10 },
    series: [
      {
        name: "Wins",
        data: pnlByTimeHeld.wins || [],
        type: "bar",
        itemStyle: { color: "#10b981" },
      },
      {
        name: "Losses",
        data: pnlByTimeHeld.losses || [],
        type: "bar",
        itemStyle: { color: "#f87171" },
      },
    ],
  };

  // Scatter chart for duration vs P&L - using data from backend
  const scatterOption = {
    tooltip: { trigger: "item" },
    xAxis: {
      type: "value",
      name: "Minutes",
      nameLocation: "middle",
      nameGap: 25,
      axisLabel: { fontSize: 9 },
    },
    yAxis: {
      type: "value",
      name: "P&L",
      axisLabel: { fontSize: 9 },
      splitLine: { lineStyle: { color: "#f1f5f9" } }
    },
    grid: { top: 20, bottom: 40, left: 50, right: 10 },
    series: [
      {
        name: "Wins",
        data: scatterData.winning || [],
        type: "scatter",
        symbolSize: 8,
        itemStyle: { color: "#10b981", opacity: 0.7 },
      },
      {
        name: "Losses",
        data: scatterData.losing || [],
        type: "scatter",
        symbolSize: 8,
        itemStyle: { color: "#f87171", opacity: 0.7 },
      },
    ],
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticCard
          label="Net P&L"
          value={`$${totalPnL.toLocaleString()}`}
          subValue={`${totalTrades} Trades`}
          iconBg="bg-primary"
          icon="📈"
          tooltip="Total profit/loss from all trades"
        />
        <AnalyticCard
          label="Win Rate"
          value={`${winRate.toFixed(2)}%`}
          subValue={`${winners}W/${losers}L`}
          iconBg="bg-primary"
          icon="%"
          tooltip="Percentage of winning trades"
        />
        <AnalyticCard
          label="Profit Factor"
          value={profitFactor.toFixed(2)}
          subValue={`$${(averageWin - averageLoss).toFixed(2)} Avg. P/L`}
          iconBg="bg-primary"
          icon="$"
          tooltip="Ratio of gross profit to gross loss"
        />
        <AnalyticCard
          label="Total Trades"
          value={totalTrades.toString()}
          subValue={`$${totalCommission.toFixed(2)} Commission`}
          iconBg="bg-primary"
          icon="🏦"
          tooltip="Total number of executed trades"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-4">
          P&L By Time
        </h3>
        <div className="h-[250px] sm:h-[350px] w-full">
          <ReactECharts
            option={equityOption}
            style={{ height: "100%", width: "100%" }}
            notMerge={true}
          
            lazyUpdate={false}
            key={equityData.length}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatsTable
          title="Overview"
          items={[
            { label: "Total Trades", value: totalTrades.toString() },
            { label: "Average RR", value: averageRR.toFixed(2) },
            { label: "Average Trade Duration", value: avgTradeDuration },
            { label: "Win Rate", value: `${winRate.toFixed(2)}%` },
            { label: "Average P/L", value: `$${((averageWin - averageLoss)).toFixed(2)}` },
            { label: "Total Commission", value: `$${totalCommission.toFixed(2)}` },
          ]}
        />
        <StatsTable
          title="Winning Trades"
          items={[
            { label: "Total Winners", value: winners.toString() },
            { label: "Average Trade Duration", value: avgTradeDuration },
            { label: "Average Win Streak", value: avgWinStreak.toString() },
            { label: "Max Win Streak", value: maxWinStreak.toString() },
            { label: "Average Win", value: `$${averageWin.toFixed(2)}` },
            { label: "Best Win", value: `$${bestWin.toFixed(2)}` },
          ]}
        />
        <StatsTable
          title="Losing Trades"
          items={[
            { label: "Total Losers", value: losers.toString() },
            { label: "Average Trade Duration", value: avgTradeDuration },
            { label: "Average Loss Streak", value: avgLossStreak.toString() },
            { label: "Max Loss Streak", value: maxLossStreak.toString() },
            { label: "Average Loss", value: `$${averageLoss.toFixed(2)}` },
            { label: "Worst Loss", value: `$${worstLoss.toFixed(2)}` },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Profit by Session", data: [tradesBySession.London, tradesBySession.NY, tradesBySession.Other] },
          { title: "Win Rate by Session", data: [winRateByDayOfWeek[1], winRateByDayOfWeek[4], Math.round((winRateByDayOfWeek[0] + winRateByDayOfWeek[2] + winRateByDayOfWeek[3] + winRateByDayOfWeek[5] + winRateByDayOfWeek[6]) / 5)] },
          { title: "Trades by Session", data: [tradesBySession.London, tradesBySession.NY, tradesBySession.Other] },
          { title: "Avg Profitable RR", data: [averageRR * 2, averageRR, 0] },
        ].map(({ title, data }) => (
          <div
            key={title}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-52 sm:h-60"
          >
            <ReactECharts
              option={radarOption(title, data)}
              style={{ height: "100%" }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBox title="P&L By Day" controls={["Total"]}>
          <div className="h-[200px] sm:h-[250px]">
            <ReactECharts
              option={barOptionPnLByDay}
              style={{ height: "100%" }}
            />
          </div>
        </ChartBox>
        <ChartBox title="Trade Distribution by Day">
          <div className="h-[200px] sm:h-[250px]">
            <ReactECharts
              option={barOptionTradeDist}
              style={{ height: "100%" }}
            />
          </div>
        </ChartBox>
        <ChartBox title="Profit by Time Held">
          <div className="h-[200px] sm:h-[250px]">
            <ReactECharts option={barOptionTimeHeld} style={{ height: "100%" }} />
          </div>
        </ChartBox>
        <ChartBox title="Duration vs P&L">
          <div className="h-[200px] sm:h-[250px]">
            <ReactECharts
              option={scatterOption}
              style={{ height: "100%" }}
            />
          </div>
        </ChartBox>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2">
          <Calendar
            year={calDate.year}
            month={calDate.month}
            onMonthChange={(y, m) => setCalDate({ year: y, month: m })}
            dailySummaries={dailySummaries}
            onDayClick={setSelectedDayDate}
            selectedDate={null}
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full self-stretch">
          <div className="p-4 bg-slate-50 border-b border-slate-100 text-center">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-widest">
              P&L By Week
            </h4>
          </div>
          <div className="flex-1 divide-y divide-slate-50 overflow-y-auto">
            {pnlByWeek.length > 0 ? pnlByWeek.map((weekData: any, idx: number) => {
              const pnlValue = Number(weekData.pnl) || 0;
              const countValue = Number(weekData.count) || 0;
              return (
                <div
                  key={weekData.week}
                  className={`p-4 flex justify-between items-center transition-colors ${idx === 0 ? "bg-rose-50/30" : "hover:bg-slate-50"}`}
                >
                  <span className="text-xs font-bold text-slate-600">
                    {weekData.week}
                  </span>
                  <div className="text-right">
                    <p
                      className={`text-xs font-black ${pnlValue >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {pnlValue >= 0 ? `$${pnlValue.toFixed(2)}` : `-$${Math.abs(pnlValue).toFixed(2)}`}
                    </p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase">
                      {countValue} {countValue === 1 ? 'Trade' : 'Trades'}
                    </p>
                  </div>
                </div>
              );
            }) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No trade data available
                </div>
              )
            }
          </div>
          <div className={`p-4 flex justify-between items-center border-t-2 ${Number(monthlyTotals.pnl) >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"} mt-auto`}>
            <span className={`text-xs font-black uppercase tracking-widest ${Number(monthlyTotals.pnl) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              Monthly Total
            </span>
            <div className="text-right">
              <p className={`text-sm font-black ${Number(monthlyTotals.pnl) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {Number(monthlyTotals.pnl) >= 0 ? `$${Number(monthlyTotals.pnl).toFixed(2)}` : `-$${Math.abs(Number(monthlyTotals.pnl)).toFixed(2)}`}
              </p>
              <p className={`text-[9px] font-bold uppercase ${Number(monthlyTotals.pnl) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {Number(monthlyTotals.count)} {Number(monthlyTotals.count) === 1 ? 'Trade' : 'Trades'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      <DayDetailsModal
        isOpen={!!selectedDayDate && !commentEditorState}
        onClose={() => setSelectedDayDate(null)}
        date={selectedDayDate || ""}
        trades={[]}
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

const AnalyticCard = ({ label, value, subValue, iconBg, icon, tooltip }: any) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:border-[#ff4d00]/30 transition-all group">
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-1 truncate">
        {label}{" "}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-slate-200 group-hover:text-slate-400 transition-colors cursor-help">
                ⓘ
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </p>
      <p className="text-2xl font-black text-slate-800 tracking-tight truncate">
        {value}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md whitespace-nowrap">
          {subValue}
        </p>
        <div className="h-1 w-8 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
          <div className="h-full bg-emerald-400" style={{ width: "60%" }}></div>
        </div>
      </div>
    </div>
    <div
      className={`w-12 h-12 ${iconBg} text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-orange-500/10 shrink-0 ml-4 transform group-hover:scale-110 transition-transform duration-300`}
    >
      {icon}
    </div>
  </div>
);

const StatsTable = ({ title, items }: any) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full hover:border-slate-300 transition-all">
    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
      <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-widest">
        {title}
      </h4>
      <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
    </div>
    <div className="divide-y divide-slate-50 flex-1">
      {items.map((item: any, i: number) => (
        <div
          key={i}
          className="px-5 py-3.5 flex justify-between items-center text-[11px] group hover:bg-slate-50 transition-colors"
        >
          <span className="font-bold text-slate-500">{item.label}</span>
          <span className="font-black text-slate-800 tracking-tight">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ChartBox = ({ title, controls, children }: any) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
    <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-widest">
        {title}
      </h4>
      {controls && (
        <div className="flex gap-1 bg-slate-200/50 p-0.5 rounded-xl self-end">
          {controls.map((c: string, idx: number) => (
            <button
              key={c}
              onClick={() => {}}
              className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg transition-all ${idx === controls.length - 1 ? "bg-[#ff4d00] text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
    <div className="p-4 sm:p-6 flex-1">{children}</div>
  </div>
);

export default AnalyticView;
