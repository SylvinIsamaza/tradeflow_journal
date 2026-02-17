import React, { useState, useMemo, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Trade, AIInsight } from "../../types.ts";
import { formatCurrency } from "../../utils.ts";
import Table, { Column } from "../Table.tsx";
import Modal from "../Modal.tsx";
import { getPerformanceInsights } from "../../services/geminiService.ts";

interface TradeLogViewProps {
  trades: Trade[];
}

const ALL_COLUMN_KEYS = [
  "Pair",
  "Start Date",
  "Duration",
  "Type",
  "Execution",
  "Status",
  "Entry Price",
  "Profit/Loss",
  "General Tags",
  "Exit Tags",
  "Process Tags",
  "Setups",
  "Stop Loss",
  "Take Profit",
  "Close Price",
  "Commission",
  "Swap",
] as const;

type ColumnKey = (typeof ALL_COLUMN_KEYS)[number];

const TradeLogView: React.FC<TradeLogViewProps> = ({ trades }) => {
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "EXCEL">("CSV");
  const [exportColumns, setExportColumns] = useState<
    Record<ColumnKey, boolean>
  >(() => {
    const initial: any = {};
    ALL_COLUMN_KEYS.forEach((key) => {
      initial[key] = true;
    });
    return initial;
  });

  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [aiError, setAiError] = useState<{
    message: string;
    type: string;
  } | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<
    Record<ColumnKey, boolean>
  >(() => {
    const initial: any = {};
    ALL_COLUMN_KEYS.forEach((key) => {
      initial[key] = ![
        "Execution",
        "Process Tags",
        "Swap",
        "Duration",
      ].includes(key);
    });
    return initial;
  });

  const fetchAIInsights = async () => {
    if (trades.length > 0) {
      setLoadingInsights(true);
      setAiError(null);
      const { data, error } = await getPerformanceInsights(trades);

      if (error) {
        setAiError({ message: error.message, type: error.errorType });
      } else {
        setInsights(
          data.map((r: any, i: number) => ({
            ...r,
            id: `insight-${i}`,
            date: new Date().toISOString(),
          })),
        );
      }
      setLoadingInsights(false);
    }
  };

  // Removed useEffect auto-fetch to satisfy user request

  const handleOpenSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      fetchAIInsights(); // Retry after selecting key
    }
  };

  const chartOption = {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: "category", show: false },
    yAxis: { type: "value", show: false },
    series: [
      {
        data: [0, 2000, 3500, 3100, 4800, 4600, 5200],
        type: "line",
        smooth: true,
        lineStyle: { color: "#10b981", width: 2 },
        areaStyle: { color: "rgba(16, 185, 129, 0.1)" },
        symbol: "none",
      },
    ],
  };

  const masterColumns: Record<ColumnKey, Column<Trade>> = {
    Pair: { header: "Pair", accessor: "symbol" },
    "Start Date": { header: "Start Date", accessor: "date" },
    Duration: { header: "Duration", accessor: (t) => t.duration || "2h 15m" },
    Type: { header: "Type", accessor: (t) => t.tradeType },
    Execution: { header: "Execution", accessor: "executionType" },
    Status: { header: "Status", accessor: (t) => t.status },
    "Entry Price": { header: "Entry Price", accessor: (t) => t.entryPrice },
    "Profit/Loss": { header: "Profit/Loss", accessor: (t) => t.pnl },
    "General Tags": {
      header: "General Tags",
      accessor: (t) => (t.generalTags || []).join(", "),
    },
    "Exit Tags": {
      header: "Exit Tags",
      accessor: (t) => (t.exitTags || []).join(", "),
    },
    "Process Tags": {
      header: "Process Tags",
      accessor: (t) => (t.processTags || []).join(", "),
    },
    Setups: { header: "Setups", accessor: (t) => (t.setups || []).join(", ") },
    "Stop Loss": { header: "Stop Loss", accessor: (t) => t.stopLoss },
    "Take Profit": { header: "Take Profit", accessor: (t) => t.takeProfit },
    "Close Price": { header: "Close Price", accessor: (t) => t.closePrice },
    Commission: { header: "Commission", accessor: (t) => t.commission },
    Swap: { header: "Swap", accessor: (t) => t.swap },
  };

  const tableColumns = useMemo(() => {
    return ALL_COLUMN_KEYS.filter((key) => visibleColumns[key]).map((key) => {
      const col = masterColumns[key];
      if (key === "Pair")
        return {
          ...col,
          className:
            "font-black text-slate-800 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]",
        };
      if (key === "Status")
        return {
          ...col,
          accessor: (t: Trade) => (
            <span
              className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black tracking-wider border ${
                t.status === "WIN"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : t.status === "BE"
                    ? "bg-slate-50 text-slate-500 border-slate-100"
                    : "bg-rose-50 text-rose-500 border-rose-100"
              }`}
            >
              {t.status}
            </span>
          ),
        };
      if (key === "Profit/Loss")
        return {
          ...col,
          accessor: (t: Trade) => (
            <span
              className={`font-black ${t.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}
            >
              {formatCurrency(t.pnl)}
            </span>
          ),
        };
      if (key === "Type")
        return {
          ...col,
          accessor: (t: Trade) => (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {t.tradeType}
            </span>
          ),
        };
      return col;
    });
  }, [visibleColumns]);

  const toggleColumnVisibility = (key: ColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleExportColumn = (key: ColumnKey) => {
    setExportColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerDownload = () => {
    const selectedKeys = ALL_COLUMN_KEYS.filter((k) => exportColumns[k]);
    const headers = selectedKeys.join(",");
    const rows = trades.map((t) => {
      return selectedKeys
        .map((k) => {
          const accessor = masterColumns[k].accessor;
          const val =
            typeof accessor === "function"
              ? accessor(t)
              : t[accessor as keyof Trade];
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",");
    });
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], {
      type:
        exportFormat === "CSV"
          ? "text/csv;charset=utf-8;"
          : "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `tradezilla_export_${new Date().toISOString().split("T")[0]}.${exportFormat === "CSV" ? "csv" : "xls"}`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-[110px]">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
            Net cumulative P&L{" "}
            <span className="bg-slate-50 px-1.5 py-0.5 rounded text-[8px] text-slate-500">
              {trades.length}
            </span>
          </p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-800">$14,742</span>
            <div className="w-24 h-10 mb-1">
              <ReactECharts
                option={chartOption}
                style={{ height: "100%", width: "100%" }}
                notMerge={true}
                lazyUpdate={false}
              />
            </div>
          </div>
        </div>
        <MiniGaugeCard label="Profit factor" value="1.82" gauge={60} />
        <MiniGaugeCard label="Trade win %" value="31.78%" gauge={31.78} />
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-[110px]">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            Avg win/loss trade
          </p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-800">3.90</span>
            <div className="flex flex-col items-end gap-2 pb-1">
              <div className="w-28 h-1.5 bg-slate-100 rounded-full flex overflow-hidden">
                <div className="bg-[#10b981]" style={{ width: "80%" }}></div>
                <div className="bg-rose-400" style={{ width: "20%" }}></div>
              </div>
              <div className="flex gap-4 text-[8px] font-bold">
                <span className="text-[#10b981]">$964</span>
                <span className="text-rose-400">-$247</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl p-6 shadow-sm border transition-colors ${aiError ? "bg-rose-50 border-rose-100" : "bg-[#f5f6ff] border-indigo-100"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-lg ${aiError ? "bg-rose-500 shadow-rose-100" : "bg-indigo-600 shadow-indigo-100"}`}
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3
              className={`text-sm font-black uppercase tracking-widest ${aiError ? "text-rose-700" : "text-slate-800"}`}
            >
              AI Performance Insights
            </h3>
          </div>
          {!loadingInsights && insights.length === 0 && !aiError && (
            <button
              onClick={fetchAIInsights}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Run AI Analysis
            </button>
          )}
          {loadingInsights && (
            <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest animate-pulse">
              Analyzing behavior...
            </div>
          )}
          {insights.length > 0 && !loadingInsights && (
            <button
              onClick={fetchAIInsights}
              className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
            >
              Refresh
            </button>
          )}
        </div>

        {aiError ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="text-rose-600 font-bold text-sm">
              {aiError.message}
            </div>
            {aiError.type === "QUOTA_EXCEEDED" && (
              <button
                onClick={handleOpenSelectKey}
                className="bg-rose-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
              >
                Use Personal API Key
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.length > 0
              ? insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm group hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          insight.type === "PERFORMANCE"
                            ? "bg-emerald-50 text-emerald-600"
                            : insight.type === "PSYCHOLOGY"
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {insight.type}
                      </span>
                      <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">
                        Just now
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-800 mb-2 truncate">
                      {insight.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {insight.content}
                    </p>
                  </div>
                ))
              : !loadingInsights && (
                  <div className="col-span-3 text-center py-8 text-slate-400 font-bold text-xs">
                    {trades.length > 0
                      ? 'Click "Run AI Analysis" to unlock insights into your trading performance.'
                      : "Record more trades to unlock AI performance analysis."}
                  </div>
                )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-slate-200"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              Trade History Detail
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsColumnSettingsOpen(true)}
              className="whitespace-nowrap bg-white border border-slate-200 px-4 py-2 rounded-xl text-[11px] font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066"
                />
              </svg>
              Columns
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="whitespace-nowrap bg-indigo-600 px-6 py-2 rounded-xl text-[11px] font-bold text-white flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0l-4 4m4-4v12"
                />
              </svg>
              Export History
            </button>
          </div>
        </div>
        <Table columns={tableColumns} data={trades} className="max-h-[600px]" />
      </div>

      {/* Column Settings Modal */}
      <Modal
        isOpen={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        title="Column Visibility"
        maxWidth="max-w-xl"
      >
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4">
            {ALL_COLUMN_KEYS.map((key) => (
              <div
                key={key}
                onClick={() => toggleColumnVisibility(key)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${visibleColumns[key] ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-100"}`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${visibleColumns[key] ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}
                >
                  {visibleColumns[key] && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-[11px] font-black uppercase tracking-tight ${visibleColumns[key] ? "text-indigo-700" : "text-slate-400"}`}
                >
                  {key}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setIsColumnSettingsOpen(false)}
            className="w-full mt-8 bg-slate-800 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            Save Layout
          </button>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export History"
        maxWidth="max-w-2xl"
      >
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Format
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setExportFormat("CSV")}
                className={`flex-1 py-4 rounded-2xl border-2 font-black text-xs uppercase transition-all ${exportFormat === "CSV" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-400 hover:bg-slate-50"}`}
              >
                CSV File
              </button>
              <button
                onClick={() => setExportFormat("EXCEL")}
                className={`flex-1 py-4 rounded-2xl border-2 font-black text-xs uppercase transition-all ${exportFormat === "EXCEL" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-400 hover:bg-slate-50"}`}
              >
                Excel (XLS)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Select Columns
              </label>
              <button
                onClick={() => {
                  const allTrue: any = {};
                  ALL_COLUMN_KEYS.forEach((k) => (allTrue[k] = true));
                  setExportColumns(allTrue);
                }}
                className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                Select All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_COLUMN_KEYS.map((key) => (
                <div
                  key={key}
                  onClick={() => toggleExportColumn(key)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${exportColumns[key] ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-100"}`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${exportColumns[key] ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}
                  >
                    {exportColumns[key] && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold truncate ${exportColumns[key] ? "text-indigo-700" : "text-slate-400"}`}
                  >
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              onClick={triggerDownload}
              className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
            >
              Download History
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const MiniGaugeCard = ({ label, value, gauge }: any) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-[110px] transition-all hover:border-[#5e5ce6]/20">
    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
      {label} <span className="text-slate-300 ml-1">ⓘ</span>
    </p>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-black text-slate-800 leading-none">
        {value}
      </span>
      <div className="w-[50px] h-[25px] overflow-hidden relative mb-1">
        <div className="w-[50px] h-[50px] rounded-full border-[5px] border-slate-50 absolute -bottom-[25px]"></div>
        <div
          className="w-[50px] h-[50px] rounded-full border-[5px] border-[#5e5ce6] absolute -bottom-[25px]"
          style={{
            clipPath: `polygon(0 0, ${gauge}% 0, ${gauge}% 100%, 0 100%)`,
          }}
        ></div>
      </div>
    </div>
  </div>
);

export default TradeLogView;
