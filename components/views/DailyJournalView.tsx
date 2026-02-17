
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Trade, DailySummary } from '../../types.ts';
import { formatCurrency, getMonthName } from '../../utils.ts';

interface DailyJournalViewProps {
  trades: Trade[];
  summaries: Record<string, DailySummary>;
  onDayClick: (date: string) => void;
}

const DailyJournalView: React.FC<DailyJournalViewProps> = ({ trades, summaries, onDayClick }) => {
  const [calDate, setCalDate] = useState({ year: 2024, month: 5 }); // June 2024
  const dates = Object.keys(summaries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const toggleExpand = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) newExpanded.delete(date);
    else newExpanded.add(date);
    setExpandedDates(newExpanded);
  };

  const expandAll = () => {
    setExpandedDates(new Set(dates));
  };

  const collapseAll = () => {
    setExpandedDates(new Set());
  };

  const changeMonth = (delta: number) => {
    let newMonth = calDate.month + delta;
    let newYear = calDate.year;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setCalDate({ year: newYear, month: newMonth });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-500 pb-12">
      {/* Sidebar Calendar */}
      <div className="w-full xl:w-72 space-y-6 shrink-0 xl:sticky xl:top-0 xl:self-start">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-6">
             <button onClick={() => changeMonth(-1)} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
             <span className="text-xs font-black text-slate-800 tracking-tight uppercase">{getMonthName(calDate.month)} {calDate.year}</span>
             <button onClick={() => changeMonth(1)} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
           </div>
           <div className="grid grid-cols-7 gap-1 text-center">
             {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-[10px] text-slate-300 font-black uppercase py-1">{d}</div>)}
             {Array.from({ length: 30 }).map((_, i) => {
               const day = i + 1;
               const dateStr = `${calDate.year}-${(calDate.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
               const summary = summaries[dateStr];
               
               let highlight = 'text-slate-400 hover:bg-slate-50';
               if (summary) {
                 highlight = summary.totalPnL >= 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-rose-500 text-white shadow-lg shadow-rose-200';
               }

               return (
                 <div 
                   key={i} 
                   onClick={() => summary && onDayClick(dateStr)}
                   className={`text-[10px] font-black p-2 rounded-lg transition-all cursor-pointer ${highlight} ${!summary ? 'cursor-default opacity-50' : 'hover:scale-110'}`}
                 >
                   {day}
                 </div>
               );
             })}
           </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {/* Global Expand/Collapse Buttons */}
        <div className="flex justify-end gap-2 px-2">
          <button 
            onClick={expandAll}
            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100"
          >
            Expand All
          </button>
          <button 
            onClick={collapseAll}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all border border-slate-200"
          >
            Collapse All
          </button>
        </div>

        {dates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center shadow-sm">
            <p className="text-slate-400 font-bold text-sm">No journal entries yet. Log a trade to get started.</p>
          </div>
        ) : (
          dates.map(date => (
            <JournalEntry 
              key={date} 
              date={date} 
              summary={summaries[date]} 
              trades={trades.filter(t => t.date === date)} 
              onClick={() => onDayClick(date)} 
              isExpanded={expandedDates.has(date)}
              onToggleExpand={() => toggleExpand(date)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const JournalEntry = ({ date, summary, trades, onClick, isExpanded, onToggleExpand }: any) => {
  const chartOption = {
    grid: { left: 5, right: 5, top: 10, bottom: 0 },
    xAxis: { type: 'category', show: false },
    yAxis: { type: 'value', show: false },
    series: [{
      data: summary.totalPnL >= 0 ? [0, 40, 150, 185] : [0, 20, -50, -37.5],
      type: 'line',
      smooth: true,
      lineStyle: { color: summary.totalPnL >= 0 ? '#10b981' : '#f87171', width: 2 },
      areaStyle: { 
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: summary.totalPnL >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)' }, { offset: 1, color: 'transparent' }]
        }
      },
      symbol: 'none'
    }]
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-[#5e5ce6]/20 transition-all group">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white group-hover:bg-slate-50/50 transition-colors gap-3">
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={onToggleExpand}>
          <svg className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="text-[11px] sm:text-[12px] font-black text-slate-700">{formattedDate}</span>
            <div className="hidden sm:block w-px h-3 bg-slate-200"></div>
            <span className={`text-[11px] sm:text-[12px] font-black ${summary.totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Net P&L {formatCurrency(summary.totalPnL)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button 
             onClick={onClick}
             className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] sm:text-[11px] font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
           >
             Day Details
           </button>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 flex flex-row gap-8 items-center overflow-hidden">
        {/* Graph on the left, now clearly constrained */}
        <div className="w-24 sm:w-32 h-16 sm:h-20 shrink-0 flex flex-col items-center">
           <div className="flex-1 w-full">
             <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
           </div>
           <p className="text-[8px] text-slate-300 font-black text-center mt-1 uppercase tracking-widest whitespace-nowrap">Intraday P&L</p>
        </div>
        
        {/* Stats on the right */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-y-3 gap-x-4 sm:gap-x-8">
           <DataPoint label="Trades" value={trades.length} />
           <DataPoint label="Winners" value={trades.filter((t: any) => t.pnl > 0).length} />
           <DataPoint label="Winrate" value={`${trades.length > 0 ? (trades.filter((t: any) => t.pnl > 0).length / trades.length * 100).toFixed(0) : 0}%`} />
           <DataPoint label="Avg Win" value={formatCurrency(summary.totalPnL > 0 ? summary.totalPnL / trades.length : 0)} />
           <DataPoint label="Comms" value="$10.50" />
           <DataPoint label="Volume" value={trades.length * 1000} />
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/50 p-4 sm:p-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            {trades.map((trade: any) => (
              <div key={trade.id} className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${trade.pnl >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trade.side === 'LONG' ? 'L' : 'S'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{trade.symbol}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{trade.tradeType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(trade.pnl)}</p>
                  <p className="text-[10px] text-slate-300 font-bold">Qty: {trade.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DataPoint = ({ label, value }: any) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[8px] sm:text-[9px] text-slate-300 font-black uppercase tracking-widest leading-none truncate">{label}</p>
    <p className="text-[11px] sm:text-[13px] font-black text-slate-700 tracking-tight leading-none whitespace-nowrap">{value}</p>
  </div>
);

export default DailyJournalView;
