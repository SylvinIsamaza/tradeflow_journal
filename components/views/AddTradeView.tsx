import React, { useState, useRef } from "react";
import { Trade, TradeSide, TradeStatus, Strategy } from "../../types";
import TradeEditor from "../TradeEditor";
import { usePreviewImport, useImportTrades } from "@/lib/hooks";
import { useApp } from "@/app/AppContext";

interface AddTradeViewProps {
  onSave: (trade: Omit<Trade, "accountId">) => void;
  onCancel: () => void;
  availableStrategies: Strategy[];
}

const AddTradeView: React.FC<AddTradeViewProps> = ({
  onSave,
  onCancel,
  availableStrategies,
}) => {
  const { selectedAccount } = useApp();
  const previewMutation = usePreviewImport();
  const importMutation = useImportTrades();
  
  const [mode, setMode] = useState<
    "selection" | "manual" | "import" | "file-select" | "trade-select"
  >("selection");
  const [parsedTrades, setParsedTrades] = useState<any[]>([]);
  const [selectedTrades, setSelectedTrades] = useState<Set<number>>(new Set());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseError, setParseError] = useState<string>("");

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedAccount) return;

    setParseError("");
    setSelectedFile(file);
    
    try {
      const result = await previewMutation.mutateAsync({
        accountId: selectedAccount.id,
        file,
      });

      if (result.preview.length === 0) {
        throw new Error("No valid trades found in the file");
      }

      setParsedTrades(result.preview);
      setSelectedTrades(new Set(result.preview.map((_: any, i: number) => i)));
      setMode("trade-select");
    } catch (error) {
      setParseError(
        error instanceof Error ? error.message : "Failed to parse file",
      );
    }
  };

  const toggleTradeSelection = (index: number) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTrades(newSelected);
  };

  const importSelectedTrades = async () => {
    if (!selectedFile || !selectedAccount) return;
    
    try {
      await importMutation.mutateAsync({
        accountId: selectedAccount.id,
        file: selectedFile,
      });
      
      setMode("selection");
      setParsedTrades([]);
      setSelectedTrades(new Set());
      setSelectedFile(null);
      onCancel();
    } catch (error) {
      setParseError(
        error instanceof Error ? error.message : "Failed to import trades",
      );
    }
  };

  if (mode === "manual") {
    return (
      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setMode("selection")}
            className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
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
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to selection
          </button>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            Manual Trade Entry
          </h2>
        </div>
        <div className="bg-white rounded-4xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <TradeEditor
            isViewMode={true}
            date={new Date().toISOString().split("T")[0]}
            onSave={onSave}
            onClose={onCancel}
            availableStrategies={availableStrategies}
          />
        </div>
      </div>
    );
  }

  if (mode === "file-select") {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => setMode("import")}
          className="mb-6 flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
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
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-xl shadow-slate-200/50">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">
            Import Trades from MetaTrader 5
          </h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Select an Excel file or HTML report from your MetaTrader 5 account
            to import your complete trading history.
          </p>

          {parseError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
              <p className="text-red-700 text-sm font-medium">{parseError}</p>
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-4xl p-12 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group mb-8"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-indigo-500"
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
            </div>
            <p className="text-sm font-black text-slate-800">
              Drop your file here
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              or click to browse
            </p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.html"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Supported formats
              </h4>
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-3">
                  <p className="text-[11px] font-black text-slate-600">
                    📊 Excel Files (.xlsx, .xls)
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    MetaTrader 5 Excel exports with Symbol, Type, Volume, Price,
                    Swap, Profit columns
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-[11px] font-black text-slate-600">
                    📄 MetaTrader HTML Reports
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    Navigate to Terminal → History tab → Right-click → Report →
                    Save as HTML
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "trade-select") {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => {
            setMode("file-select");
            setParsedTrades([]);
            setSelectedTrades(new Set());
          }}
          className="mb-6 flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
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
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Review & Select Trades
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Found{" "}
            <span className="font-black text-slate-800">
              {parsedTrades.length}
            </span>{" "}
            trades. Select which ones to import.
          </p>
        </div>

        <div className="bg-white rounded-4xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 mb-8 max-h-96 overflow-y-auto">
          {parsedTrades.map((trade, index) => (
            <div
              key={index}
              className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedTrades.has(index)}
                onChange={() => toggleTradeSelection(index)}
                className="w-5 h-5 rounded border-2 border-slate-300 cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-6 gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                      Symbol
                    </p>
                    <p className="text-sm font-black text-slate-800 truncate">
                      {trade.symbol}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                      Type
                    </p>
                    <p
                      className={`text-sm font-black ${trade.side?.toUpperCase() === "BUY" || trade.side?.toUpperCase() === "LONG" ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {trade.side}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                      Entry
                    </p>
                    <p className="text-sm font-black text-slate-800 truncate">
                      ${trade.entry_price?.toFixed(3) || 0}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                      Exit
                    </p>
                    <p className="text-sm font-black text-slate-800 truncate">
                      ${trade.exit_price?.toFixed(3) || 0}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                      Qty
                    </p>
                    <p className="text-sm font-black text-slate-800 truncate">
                      {trade.quantity}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                      P&L
                    </p>
                    <p
                      className={`text-sm font-black ${trade.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      ${trade.pnl?.toFixed(2) || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setMode("file-select");
              setParsedTrades([]);
              setSelectedTrades(new Set());
            }}
            className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel Import
          </button>
          <button
            onClick={importSelectedTrades}
            disabled={selectedTrades.size === 0}
            className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Import {selectedTrades.size} Trade
            {selectedTrades.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    );
  }

  if (mode === "import") {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => setMode("selection")}
          className="mb-6 flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
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
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-xl shadow-slate-200/50 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4">
            Choose Import Source
          </h2>
          <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            Select where you want to import your trades from.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setMode("file-select")}
              className="w-full bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-2xl p-6 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-left leading-tight">
                    MetaTrader 5 File
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    Excel (.xlsx) or HTML report
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-indigo-600 shrink-0"
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
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">
          How would you like to add trades?
        </h2>
        <p className="text-slate-400 font-medium text-lg">
          Choose your preferred method to start logging your performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manual Option */}
        <div
          onClick={() => setMode("manual")}
          className="bg-white rounded-[48px] p-10 border border-slate-200 shadow-xl shadow-slate-200/20 hover:border-indigo-500 hover:shadow-indigo-500/10 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 bg-indigo-50 rounded-[30px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-10 h-10 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">
              Manual Entry
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Perfect for detailed logging, emotional tracking, and linking
              strategies from your playbook.
            </p>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
              Start Logging
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 5l7 7-7 7M5 12h15"
                />
              </svg>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Import Option */}
        <div
          onClick={() => setMode("import")}
          className="bg-white rounded-[48px] p-10 border border-slate-200 shadow-xl shadow-slate-200/20 hover:border-emerald-500 hover:shadow-emerald-500/10 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-[30px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-10 h-10 text-emerald-600"
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
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">
              Bulk Import
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Import hundreds of trades instantly from MetaTrader 5 Excel or
              HTML exports.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
              Upload Files
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 5l7 7-7 7M5 12h15"
                />
              </svg>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
};

export default AddTradeView;
