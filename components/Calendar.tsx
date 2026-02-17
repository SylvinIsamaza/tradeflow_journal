
import React from 'react';
import { Trade, DailySummary } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, generateDateId, formatCurrency, getMonthName } from '../utils';

interface CalendarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  dailySummaries: Record<string, DailySummary>;
  onDayClick: (date: string) => void;
  selectedDate: string | null;
}

const Calendar: React.FC<CalendarProps> = ({ 
  year, month, onMonthChange, dailySummaries, onDayClick, selectedDate 
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const handlePrevMonth = () => {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  };

  const days = [];
  // Previous month padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="bg-slate-50/50 min-h-24 rounded-lg"></div>);
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateId = generateDateId(year, month, day);
    const summary = dailySummaries[dateId];
    const isSelected = selectedDate === dateId;
    const isSaturday = new Date(year, month, day).getDay() === 6;
    
    let bgClass = "bg-white hover:border-indigo-400";
    let textClass = "text-slate-800";
    
    if (summary) {
      if (summary.totalPnL > 0) {
        bgClass = "bg-emerald-50 hover:bg-emerald-100 border-emerald-100";
        textClass = "text-emerald-700";
      } else if (summary.totalPnL < 0) {
        bgClass = "bg-rose-50 hover:bg-rose-100 border-rose-100";
        textClass = "text-rose-700";
      }
    }

    days.push(
      <button
        key={dateId}
        onClick={() => onDayClick(dateId)}
        className={`relative min-h-24 p-2 flex flex-col items-start border-2 transition-all rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${bgClass} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 z-10' : 'border-slate-100'}`}
      >
        <div className="w-full flex justify-between items-start">
          <span className="text-[10px] font-bold text-slate-400">{day}</span>
          <div className="flex gap-1">
            {summary?.hasDailyComment && (
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="Daily Review Logged"></div>
            )}
            {summary?.hasWeeklyComment && (
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500" title="Weekly Summary Logged"></div>
            )}
          </div>
        </div>
        
        {summary && (
          <div className="w-full mt-auto">
            <div className={`text-[11px] font-extrabold truncate ${textClass}`}>
              {formatCurrency(summary.totalPnL)}
            </div>
            <div className="text-[9px] text-slate-400 font-medium">
              {summary.tradeCount} trade{summary.tradeCount !== 1 ? 's' : ''}
            </div>
          </div>
        )}
        
        {isSaturday && (
          <div className="absolute top-1 right-1 opacity-20 pointer-events-none">
            <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {getMonthName(month)} <span className="text-slate-400 font-normal">{year}</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all border border-transparent hover:border-slate-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all border border-transparent hover:border-slate-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-white">
        <div className="grid grid-cols-7 gap-3 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {days}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
