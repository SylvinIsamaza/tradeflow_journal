import React from "react";
import ReactECharts from "echarts-for-react";
import { Trade } from "../types";

interface EquityChartProps {
  trades: Trade[];
}

const EquityChart: React.FC<EquityChartProps> = ({ trades }) => {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  let currentEquity = 0;
  const equityData = sortedTrades.map((t) => {
    currentEquity += t.pnl;
    return [t.date, currentEquity];
  });

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1e293b",
      borderColor: "#334155",
      textStyle: { color: "#f8fafc", fontWeight: "bold" },
      formatter: (params: any) => {
        return `<div class="p-2">
          <div class="text-[10px] uppercase text-slate-400 mb-1">${params[0].value[0]}</div>
          <div class="text-sm">$${params[0].value[1].toLocaleString()}</div>
        </div>`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
      axisLabel: {
        color: "#94a3b8",
        fontSize: 10,
        fontWeight: "bold",
        formatter: (val: number) => `$${val}`,
      },
    },
    series: [
      {
        name: "Equity",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#4f46e5" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(79, 70, 229, 0.2)" },
              { offset: 1, color: "rgba(79, 70, 229, 0)" },
            ],
          },
        },
        data: equityData,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: "100%", width: "100%" }}
      notMerge={true}
      lazyUpdate={false}
      key={trades.length}
    />
  );
};

export default EquityChart;
