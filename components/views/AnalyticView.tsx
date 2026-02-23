"use client";

import React, { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Trade, DailySummary } from "../../types";
import Calendar from "../Calendar";
import { useDayDetails } from "@/app/(protected)/DayDetailsContext";

interface AnalyticViewProps {
  trades: Trade[];
  onDayClick?: (date: string) => void;
}

const AnalyticView: React.FC<AnalyticViewProps> = ({ trades, onDayClick }) => {
  const [calDate, setCalDate] = useState({ year: 2024, month: 5 }); // June 2024
  const { openDayDetails } = useDayDetails();

  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const winnersCount = trades.filter((t) => t.pnl > 0).length;
  const losersCount = trades.filter((t) => t.pnl < 0).length;
  const winRate = (winnersCount / (trades.length || 1)) * 100;

  const dailySummaries = useMemo(() => {
    return trades.reduce(
      (acc, trade) => {
        if (!acc[trade.date]) {
          acc[trade.date] = { date: trade.date, totalPnL: 0, tradeCount: 0 };
        }
        acc[trade.date].totalPnL += trade.pnl;
        acc[trade.date].tradeCount += 1;
        return acc;
      },
      {} as Record<string, DailySummary>,
    );
  }, [trades]);

  const equityData = useMemo(() => {
    let cumulative = 0;
    return [...trades]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t) => {
        cumulative += t.pnl;
        return [t.date, cumulative];
      });
  }, [trades]);

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

  const radarOption = (title: string) => ({
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
            value: [80, 60, 40],
            itemStyle: { color: "#ff4d00" },
            areaStyle: { color: "rgba(255, 77, 0, 0.3)" },
          },
        ],
      },
    ],
  });

  const barOption = (color: string) => ({
    xAxis: {
      type: "category",
      data: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      axisLabel: { fontSize: 9 },
    },
    yAxis: {
      type: "value",
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    grid: { top: 10, bottom: 20, left: 0, right: 0 },
    series: [
      { data: [0, 50, 45, 55, 40, 52, 0], type: "bar", itemStyle: { color } },
    ],
  });

  const scatterOption = {
    xAxis: {
      type: "category",
      data: ["0m", "32m", "1h 4m", "1h 36m", "2h 8m", "2h 40m"],
      axisLabel: { fontSize: 9 },
    },
    yAxis: { type: "value", min: -2000, max: 3000, axisLabel: { fontSize: 9 } },
    grid: { top: 20, bottom: 30, left: 40, right: 10 },
    series: [
      {
        data: Array.from({ length: 50 }, () => [
          Math.random() * 5,
          Math.random() * 2000 + 500,
        ]),
        type: "scatter",
        itemStyle: { color: "#10b981", opacity: 0.8 },
      },
      {
        data: Array.from({ length: 30 }, () => [
          Math.random() * 2,
          Math.random() * -1000 - 100,
        ]),
        type: "scatter",
        itemStyle: { color: "#f87171", opacity: 0.8 },
      },
    ],
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticCard
          label="Account Balance"
          value="$213,798.59"
          subValue="113.8%"
          iconBg="bg-primary"
          icon="🏦"
        />
        <AnalyticCard
          label="Net P&L"
          value={`$${totalPnL.toLocaleString()}`}
          subValue="113.8%"
          iconBg="bg-primary"
          icon="📈"
        />
        <AnalyticCard
          label="Win Rate"
          value={`${winRate.toFixed(2)}%`}
          subValue={`${winnersCount}W/${losersCount}L`}
          iconBg="bg-primary"
          icon="%"
        />
        <AnalyticCard
          label="Profit Factor"
          value="2.74"
          subValue="$432.69 Avg. P/L"
          iconBg="bg-primary"
          icon="$"
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
            { label: "Total Trades", value: trades.length.toString() },
            { label: "Missed Trades", value: "17" },
            { label: "Average RR", value: "1.53" },
            { label: "Average Trade Duration", value: "1h 1m" },
            { label: "Win Rate", value: `${winRate.toFixed(2)}%` },
            { label: "Average Profit/Loss", value: "$432.69" },
          ]}
        />
        <StatsTable
          title="Winning Trades"
          items={[
            { label: "Total Winners", value: winnersCount.toString() },
            { label: "Average Trade Duration", value: "1h 21m" },
            { label: "Average Win Streak", value: "2.23" },
            { label: "Max Win Streak", value: "10" },
            { label: "Average Win", value: "1.22%" },
            { label: "Best Win", value: "2.49%" },
          ]}
        />
        <StatsTable
          title="Losing Trades"
          items={[
            { label: "Total Losers", value: losersCount.toString() },
            { label: "Average Trade Duration", value: "36m" },
            { label: "Average Loss Streak", value: "1.84" },
            { label: "Max Loss Streak", value: "5" },
            { label: "Average Loss", value: "-0.56%" },
            { label: "Worst Loss", value: "-1.20%" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          "Profit by Session",
          "Win Rate by Session",
          "Trades by Session",
          "Avg Profitable RR",
        ].map((title) => (
          <div
            key={title}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-52 sm:h-60"
          >
            <ReactECharts
              option={radarOption(title)}
              style={{ height: "100%" }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBox title="P&L By Time" controls={["30 Minutes", "1 Hour"]}>
          <div className="h-[200px] sm:h-[250px]">
            <ReactECharts
              option={barOption("#10b981")}
              style={{ height: "100%" }}
            />
          </div>
        </ChartBox>
        <ChartBox title="P&L By Day" controls={["Separate", "Total"]}>
          <div className="h-[200px] sm:h-[250px]">
            <ReactECharts
              option={barOption("#10b981")}
              style={{ height: "100%" }}
            />
          </div>
        </ChartBox>
        <ChartBox title="Profit by Time Held">
          <div className="h-[200px] sm:h-[250px]">
            <ReactECharts option={scatterOption} style={{ height: "100%" }} />
          </div>
        </ChartBox>
        <ChartBox title="Trade Distribution by Day">
          <div className="h-[200px] sm:h-[250px]">
            <ReactECharts
              option={barOption("#ff4d00")}
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
            onDayClick={openDayDetails}
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
            {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"].map(
              (week, idx) => (
                <div
                  key={week}
                  className={`p-4 flex justify-between items-center transition-colors ${idx === 0 ? "bg-rose-50/30" : "hover:bg-slate-50"}`}
                >
                  <span className="text-xs font-bold text-slate-600">
                    {week}
                  </span>
                  <div className="text-right">
                    <p
                      className={`text-xs font-black ${idx === 0 ? "text-rose-500" : "text-slate-400"}`}
                    >
                      {idx === 0 ? "-$416.43" : "$0.00"}
                    </p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase">
                      {idx === 0 ? "1 Trade" : "0 Trades"}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="p-4 bg-rose-50 flex justify-between items-center border-t-2 border-rose-100 mt-auto">
            <span className="text-xs font-black text-rose-600 uppercase tracking-widest">
              Monthly Total
            </span>
            <div className="text-right">
              <p className="text-sm font-black text-rose-600">-$416.43</p>
              <p className="text-[9px] font-bold text-rose-400 uppercase">
                1 Trade
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticCard = ({ label, value, subValue, iconBg, icon }: any) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:border-[#ff4d00]/30 transition-all group">
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-1 truncate">
        {label}{" "}
        <span className="text-slate-200 group-hover:text-slate-400 transition-colors cursor-help">
          ⓘ
        </span>
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
