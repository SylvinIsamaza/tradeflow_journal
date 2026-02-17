import React, { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Strategy, Trade } from "../../types.ts";
import { formatCurrency } from "../../utils.ts";
import Modal from "../Modal.tsx";

interface PlaybookViewProps {
  strategies: Strategy[];
  trades: Trade[];
  onAddStrategy: (s: Strategy) => void;
  onUpdateStrategy: (s: Strategy) => void;
  onDeleteStrategy: (id: string) => void;
}

type EditorStep = "GENERAL" | "ENTRY" | "EXIT" | "RISK";

const PlaybookView: React.FC<PlaybookViewProps> = ({
  strategies,
  trades,
  onAddStrategy,
  onUpdateStrategy,
  onDeleteStrategy,
}) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(
    strategies[0]?.id || null,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] =
    useState<Partial<Strategy> | null>(null);
  const [editorStep, setEditorStep] = useState<EditorStep>("GENERAL");

  const selectedStrategy = useMemo(
    () => strategies.find((s) => s.id === selectedStrategyId),
    [strategies, selectedStrategyId],
  );

  const strategyTrades = useMemo(
    () => trades.filter((t) => t.setups.includes(selectedStrategy?.name || "")),
    [trades, selectedStrategy],
  );

  const stats = useMemo(() => {
    const winners = strategyTrades.filter((t) => t.pnl > 0);
    const losers = strategyTrades.filter((t) => t.pnl < 0);
    const winRate =
      strategyTrades.length > 0
        ? (winners.length / strategyTrades.length) * 100
        : 0;
    const totalPnL = strategyTrades.reduce((acc, t) => acc + t.pnl, 0);
    const grossProfit = winners.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losers.reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor =
      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 100 : 0;
    const expectancy =
      strategyTrades.length > 0 ? totalPnL / strategyTrades.length : 0;

    return {
      winRate,
      totalPnL,
      profitFactor,
      expectancy,
      tradeCount: strategyTrades.length,
    };
  }, [strategyTrades]);

  const chartOption = useMemo(() => {
    let cumPnL = 0;
    const data = strategyTrades
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t) => {
        cumPnL += t.pnl;
        return [t.date, cumPnL];
      });

    return {
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d[0]),
        axisLabel: { color: "#94a3b8", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#94a3b8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          data: data.map((d) => d[1]),
          type: "line",
          smooth: true,
          itemStyle: { color: selectedStrategy?.color || "#5e5ce6" },
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
                  color: (selectedStrategy?.color || "#5e5ce6") + "33",
                },
                { offset: 1, color: "transparent" },
              ],
            },
          },
          symbol: "none",
        },
      ],
    };
  }, [strategyTrades, selectedStrategy]);

  const handleSave = () => {
    if (editingStrategy?.name) {
      if (editingStrategy.id) {
        onUpdateStrategy(editingStrategy as Strategy);
      } else {
        onAddStrategy({
          ...editingStrategy,
          id: `strat-${Date.now()}`,
          color: editingStrategy.color || "#5e5ce6",
          entryRules: editingStrategy.entryRules || [],
          exitRules: editingStrategy.exitRules || [],
          riskRules: editingStrategy.riskRules || [],
        } as Strategy);
      }
      setIsEditorOpen(false);
    }
  };

  const steps: { key: EditorStep; label: string }[] = [
    { key: "GENERAL", label: "General" },
    { key: "ENTRY", label: "Entry" },
    { key: "EXIT", label: "Exit" },
    { key: "RISK", label: "Risk" },
  ];

  const nextStep = () => {
    const currentIndex = steps.findIndex((s) => s.key === editorStep);
    if (currentIndex < steps.length - 1)
      setEditorStep(steps[currentIndex + 1].key);
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex((s) => s.key === editorStep);
    if (currentIndex > 0) setEditorStep(steps[currentIndex - 1].key);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      {/* Left Sidebar: Strategy List */}
      <div className="w-full lg:w-72 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shrink-0 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
            Strategies
          </h3>
          <button
            onClick={() => {
              setEditingStrategy({
                entryRules: [],
                exitRules: [],
                riskRules: [],
              });
              setEditorStep("GENERAL");
              setIsEditorOpen(true);
            }}
            className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 hover:scale-110 active:scale-95 transition-all"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {strategies.map((strat) => (
            <button
              key={strat.id}
              onClick={() => setSelectedStrategyId(strat.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1 ${
                selectedStrategyId === strat.id
                  ? "bg-white border-indigo-200 shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-50"
                  : "bg-slate-50 border-transparent hover:bg-slate-100 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: strat.color }}
                ></div>
                <span className="text-sm font-black text-slate-800">
                  {strat.name}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {trades.filter((t) => t.setups.includes(strat.name)).length}{" "}
                Trades logged
              </p>
            </button>
          ))}
          {strategies.length === 0 && (
            <div className="text-center py-12 opacity-40">
              <p className="text-xs font-bold text-slate-400">
                No playbooks yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Analytics & Rules */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pb-12">
        {selectedStrategy ? (
          <>
            {/* Header / Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatItem
                label="Strategy PnL"
                value={formatCurrency(stats.totalPnL)}
                color={
                  stats.totalPnL >= 0 ? "text-emerald-500" : "text-rose-500"
                }
              />
              <StatItem
                label="Win Rate"
                value={`${stats.winRate.toFixed(1)}%`}
              />
              <StatItem
                label="Profit Factor"
                value={stats.profitFactor.toFixed(2)}
              />
              <StatItem
                label="Expectancy"
                value={formatCurrency(stats.expectancy)}
                sub="Per Trade"
              />
            </div>

            {/* Performance Chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: selectedStrategy.color }}
                    ></div>
                    {selectedStrategy.name} - Performance
                  </h3>
                  {selectedStrategy.description && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      {selectedStrategy.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingStrategy(selectedStrategy);
                    setEditorStep("GENERAL");
                    setIsEditorOpen(true);
                  }}
                  className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  Edit Rules
                </button>
              </div>
              <div className="h-[250px] w-full">
                <ReactECharts
                  option={chartOption}
                  style={{ height: "100%", width: "100%" }}
                  notMerge={true}
                  lazyUpdate={false}
                  key={selectedStrategyId}
                />
              </div>
            </div>

            {/* Rules Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RuleBox
                title="Entry Checklist"
                icon="📥"
                color="bg-indigo-50"
                textColor="text-indigo-600"
                rules={selectedStrategy.entryRules}
              />
              <RuleBox
                title="Exit Strategy"
                icon="📤"
                color="bg-rose-50"
                textColor="text-rose-600"
                rules={selectedStrategy.exitRules}
              />
              <RuleBox
                title="Risk Management"
                icon="🛡️"
                color="bg-amber-50"
                textColor="text-amber-600"
                rules={selectedStrategy.riskRules}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white border border-dashed border-slate-200 rounded-[40px]">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl mb-6">
              📓
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              Your Trading Playbook
            </h3>
            <p className="text-slate-400 font-medium max-w-sm mt-2">
              Define your strategy rules and entry criteria here to track
              specific performance metrics for each edge.
            </p>
            <button
              onClick={() => {
                setEditingStrategy({
                  entryRules: [],
                  exitRules: [],
                  riskRules: [],
                });
                setEditorStep("GENERAL");
                setIsEditorOpen(true);
              }}
              className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
            >
              Create First Playbook
            </button>
          </div>
        )}
      </div>

      {/* Strategy Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingStrategy?.id ? "Edit Playbook" : "New Playbook"}
        maxWidth="max-w-3xl"
      >
        <div className="flex flex-col">
          {/* Tab Stepper */}
          <div className="px-8 pt-6 pb-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20 shrink-0">
            {steps.map((step, idx) => (
              <button
                key={step.key}
                disabled={!editingStrategy?.name && step.key !== "GENERAL"}
                onClick={() => setEditorStep(step.key)}
                className={`flex-1 flex flex-col items-center gap-2 group relative ${!editingStrategy?.name && step.key !== "GENERAL" ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                    editorStep === step.key
                      ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-100"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                    editorStep === step.key
                      ? "text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className="absolute top-4 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 bg-slate-100 -z-10"></div>
                )}
              </button>
            ))}
          </div>

          {/* Content Area - Uses max-h constraint of Modal naturally now */}
          <div className="p-8 overflow-y-auto">
            {editorStep === "GENERAL" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Strategy Name
                    </label>
                    <input
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      value={editingStrategy?.name || ""}
                      onChange={(e) =>
                        setEditingStrategy({
                          ...editingStrategy,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Bullish Gap Up"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Brand Color
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        "#5e5ce6",
                        "#10b981",
                        "#f87171",
                        "#fbbf24",
                        "#06b6d4",
                        "#f472b6",
                      ].map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            setEditingStrategy({ ...editingStrategy, color: c })
                          }
                          className={`w-10 h-10 rounded-xl transition-all ${editingStrategy?.color === c ? "ring-4 ring-slate-100 scale-110 shadow-lg" : "hover:scale-105"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    General Description
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[140px]"
                    value={editingStrategy?.description || ""}
                    onChange={(e) =>
                      setEditingStrategy({
                        ...editingStrategy,
                        description: e.target.value,
                      })
                    }
                    placeholder="Explain the high-level logic behind this edge..."
                  />
                </div>
              </div>
            )}

            {editorStep === "ENTRY" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <RuleListEditor
                  label="Entry Checklist"
                  rules={editingStrategy?.entryRules || []}
                  onChange={(rules) =>
                    setEditingStrategy({
                      ...editingStrategy,
                      entryRules: rules,
                    })
                  }
                />
              </div>
            )}

            {editorStep === "EXIT" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <RuleListEditor
                  label="Exit Management"
                  rules={editingStrategy?.exitRules || []}
                  onChange={(rules) =>
                    setEditingStrategy({ ...editingStrategy, exitRules: rules })
                  }
                />
              </div>
            )}

            {editorStep === "RISK" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <RuleListEditor
                  label="Risk Parameters"
                  rules={editingStrategy?.riskRules || []}
                  onChange={(rules) =>
                    setEditingStrategy({ ...editingStrategy, riskRules: rules })
                  }
                />
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/20 shrink-0">
            <div className="flex gap-3">
              {editorStep !== "GENERAL" && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
              )}
              {editingStrategy?.id && (
                <button
                  onClick={() => {
                    if (confirm("Delete this playbook?")) {
                      onDeleteStrategy(editingStrategy.id!);
                      setIsEditorOpen(false);
                    }
                  }}
                  className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all"
                >
                  Delete
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {editorStep !== "RISK" ? (
                <button
                  disabled={!editingStrategy?.name}
                  onClick={nextStep}
                  className="px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                >
                  Save & Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const StatItem = ({ label, value, color = "text-slate-800", sub }: any) => (
  <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between h-[110px]">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {label}
    </p>
    <div>
      <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 font-bold">{sub}</p>}
    </div>
  </div>
);

const RuleBox = ({
  title,
  icon,
  color,
  textColor,
  rules,
}: {
  title: string;
  icon: string;
  color: string;
  textColor: string;
  rules: string[];
}) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full">
    <div className="flex items-center gap-2 mb-4">
      <div
        className={`w-8 h-8 ${color} rounded-xl flex items-center justify-center text-sm`}
      >
        {icon}
      </div>
      <h4
        className={`text-xs font-black uppercase tracking-widest ${textColor}`}
      >
        {title}
      </h4>
    </div>
    <div className="space-y-2">
      {rules && rules.length > 0 ? (
        rules.map((rule, idx) => (
          <div
            key={idx}
            className="flex gap-2 text-xs text-slate-600 font-medium leading-relaxed"
          >
            <span className="text-slate-300">•</span>
            <span>{rule}</span>
          </div>
        ))
      ) : (
        <span className="text-[11px] text-slate-300 italic">
          No rules defined for this section.
        </span>
      )}
    </div>
  </div>
);

const RuleListEditor = ({
  label,
  rules,
  onChange,
}: {
  label: string;
  rules: string[];
  onChange: (rules: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onChange([...rules, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          {label}
        </label>
        <p className="text-[11px] text-slate-500 font-medium">
          Add specific, verifiable criteria for this strategy step.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          placeholder={`e.g. Price above 200 EMA...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), handleAdd())
          }
        />
        <button
          onClick={handleAdd}
          type="button"
          className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-2 mt-6">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all animate-in fade-in slide-in-from-left-2 duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-500">
                {idx + 1}
              </div>
              <span className="text-[13px] font-semibold text-slate-600">
                {rule}
              </span>
            </div>
            <button
              onClick={() => handleRemove(idx)}
              className="p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
            <p className="text-[11px] text-slate-300 font-bold italic">
              No items added to the {label.toLowerCase()} yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaybookView;
