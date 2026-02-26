import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import { ReportTab } from "../../types";
import { formatCurrency } from "../../utils";
import Table, { Column } from "../Table";
import { CompleteReportsResponse } from "../../lib/api/reports";

interface ReportsViewProps {
  trades?: any[];
  reportsData?: CompleteReportsResponse | null;
}

interface ReportDataPoint {
  id: string;
  key: string;
  pnl: number;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
}

const ReportsView: React.FC<ReportsViewProps> = ({ reportsData }) => {
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

  // Get the correct data based on active tab from API response
  const getReportData = (): ReportDataPoint[] => {
    if (!reportsData) return [];
    
    let apiData: any[] = [];
    
    switch (activeTab) {
      case "Symbol":
        apiData = reportsData.by_symbol || [];
        break;
      case "Day":
        apiData = reportsData.by_day || [];
        break;
      case "Month":
        apiData = reportsData.by_month || [];
        break;
      case "Time":
        apiData = reportsData.by_time || [];
        break;
      case "Tags":
        apiData = reportsData.by_tags || [];
        break;
      case "Setups":
        apiData = reportsData.by_setups || [];
        break;
    }
    
    // Convert API format to component format
    return apiData.map((item) => ({
      id: item.key,
      key: item.key,
      pnl: item.pnl,
      count: item.count,
      wins: item.wins,
      losses: item.losses,
      winRate: item.win_rate,
    }));
  };

  const reportData = getReportData();

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
              className={`px-6 py-2 rounded-xl text-[11px] font-bold transition-all ${activeTab === tab ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:bg-slate-200/50"}`}
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
