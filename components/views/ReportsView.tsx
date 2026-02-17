import React, { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Trade, ReportTab } from "../../types.ts";
import { formatCurrency } from "../../utils.ts";
import Table, { Column } from "../Table.tsx";

interface ReportsViewProps {
  trades: Trade[];
}

interface ReportDataPoint {
  id: string; // for Table key
  key: string;
  pnl: number;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
}

const ReportsView: React.FC<ReportsViewProps> = ({ trades }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>("Symbol");
  const [pnlMode, setPnlMode] = useState<"Total" | "Separate">("Total");

  const tabs: ReportTab[] = [
    "Time",
    "Day",
    "Month",
    "Symbol",
    "Tags",
    "Setups",
  ];

  const reportData = useMemo(() => {
    const dataMap: Record<
      string,
      Omit<ReportDataPoint, "id" | "key" | "winRate">
    > = {};

    trades.forEach((t) => {
      let key = "";
      if (activeTab === "Symbol") key = t.symbol;
      else if (activeTab === "Day") {
        key = new Date(t.date).toLocaleDateString("en-US", { weekday: "long" });
      } else if (activeTab === "Month") {
        key = new Date(t.date).toLocaleDateString("en-US", { month: "short" });
      } else if (activeTab === "Time") {
        key = t.time ? t.time.split(":")[0] + ":00" : "00:00";
      } else if (activeTab === "Tags") key = t.generalTags[0] || "No Tag";
      else if (activeTab === "Setups") key = t.setups[0] || "No Setup";

      if (!dataMap[key])
        dataMap[key] = { pnl: 0, count: 0, wins: 0, losses: 0 };
      dataMap[key].pnl += t.pnl;
      dataMap[key].count += 1;
      if (t.pnl > 0) dataMap[key].wins += 1;
      else if (t.pnl < 0) dataMap[key].losses += 1;
    });

    return Object.entries(dataMap).map(([key, stats]) => ({
      id: key,
      key,
      ...stats,
      winRate: stats.count > 0 ? (stats.wins / stats.count) * 100 : 0,
    })) as ReportDataPoint[];
  }, [trades, activeTab]);

  const sortedByPnL = [...reportData].sort((a, b) => b.pnl - a.pnl);
  const sortedByCount = [...reportData].sort((a, b) => b.count - a.count);

  const best = sortedByPnL[0];
  const worst = sortedByPnL[sortedByPnL.length - 1];
  const most = sortedByCount[0];
  const least = sortedByCount[sortedByCount.length - 1];

  const pnlChartOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: reportData.map((d) => d.key),
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    series: [
      {
        data: reportData.map((d) => ({
          value: d.pnl,
          itemStyle: { color: d.pnl >= 0 ? "#10b981" : "#f87171" },
        })),
        type: "bar",
        barMaxWidth: 40,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const distChartOption = {
    tooltip: { trigger: "axis" },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: reportData.map((d) => d.key),
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    series: [
      {
        data: reportData.map((d) => d.count),
        type: "bar",
        barMaxWidth: 40,
        itemStyle: { color: "#ff4d00", borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const overviewColumns: Column<ReportDataPoint>[] = [
    {
      header: activeTab,
      accessor: "key",
      className: "uppercase tracking-tight text-slate-800",
    },
    {
      header: "Total Trades",
      accessor: "count",
      className: "text-slate-500",
    },
    {
      header: "Net Profits",
      accessor: (d) => (
        <span className={d.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
          {formatCurrency(d.pnl)}
        </span>
      ),
    },
    {
      header: "Win Rate",
      accessor: (d) => (
        <span className="text-emerald-600 bg-emerald-50/20 px-2 py-1 rounded">
          {d.winRate.toFixed(0)}%
        </span>
      ),
    },
    {
      header: "W-L-BE",
      accessor: (d) => `${d.wins}W-${d.losses}L`,
      className: "text-slate-400",
    },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-100/50 p-1 rounded-2xl flex gap-1 shadow-inner border border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[11px] font-bold transition-all ${activeTab === tab ? "bg-[#ff4d00] text-white shadow-lg" : "text-slate-500 hover:bg-slate-200/50"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* P&L Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 tracking-tight">
              P&L By {activeTab}
            </h3>
            <div className="bg-slate-100 p-0.5 rounded-lg flex gap-1">
              <button
                onClick={() => setPnlMode("Separate")}
                className={`px-3 py-1 text-[9px] font-black uppercase rounded-md ${pnlMode === "Separate" ? "bg-white shadow-sm text-slate-800" : "text-slate-400"}`}
              >
                Separate
              </button>
              <button
                onClick={() => setPnlMode("Total")}
                className={`px-3 py-1 text-[9px] font-black uppercase rounded-md ${pnlMode === "Total" ? "bg-[#ff4d00] text-white" : "text-slate-400"}`}
              >
                Total
              </button>
            </div>
          </div>
          <div className="h-80 w-full">
            <ReactECharts
              option={pnlChartOption}
              style={{ height: "100%", width: "100%" }}
              notMerge={true}
              lazyUpdate={false}
              key={`pnl-${activeTab}`}
            />
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 tracking-tight">
              Trade Distribution By {activeTab}
            </h3>
          </div>
          <div className="h-80 w-full">
            <ReactECharts
              option={distChartOption}
              style={{ height: "100%", width: "100%" }}
              notMerge={true}
              lazyUpdate={false}
              key={`dist-${activeTab}`}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ReportStat
          label={`Best ${activeTab}`}
          value={best?.key || "-"}
          subValue={formatCurrency(best?.pnl || 0)}
          color="text-emerald-500"
        />
        <ReportStat
          label={`Worst ${activeTab}`}
          value={worst?.key || "-"}
          subValue={formatCurrency(worst?.pnl || 0)}
          color="text-rose-500"
        />
        <ReportStat
          label={`Most Trades`}
          value={most?.key || "-"}
          subValue={`${most?.count || 0} Trades`}
          color="text-indigo-500"
        />
        <ReportStat
          label={`Least Trades`}
          value={least?.key || "-"}
          subValue={`${least?.count || 0} Trades`}
          color="text-indigo-500"
        />
      </div>

      {/* Overview Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
            Overview
          </h3>
          <button className="text-[10px] font-bold text-slate-400 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            Show all {activeTab.toLowerCase()}s
          </button>
        </div>
        <Table columns={overviewColumns} data={reportData} />
      </div>
    </div>
  );
};

const ReportStat = ({ label, value, subValue, color }: any) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm group">
    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">
      {label}
    </p>
    <p className="text-lg font-black text-slate-800 tracking-tight mb-2 uppercase">
      {value}
    </p>
    <div
      className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-50 ${color}`}
    >
      {subValue}
    </div>
  </div>
);

export default ReportsView;
