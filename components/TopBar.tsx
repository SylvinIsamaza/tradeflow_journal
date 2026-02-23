
import React, { useState, useRef, useEffect } from 'react';
import { Account, DateRange, Filters, TradeSide } from '../types';

interface TopBarProps {
  onAddTrade: () => void;
  title: string;
  currency: string;
  onCurrencyChange: (curr: string) => void;
  accounts: Account[];
  selectedAccount: Account;
  onAccountChange: (acc: Account) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  title, currency, onCurrencyChange, accounts, selectedAccount, 
  onAccountChange, dateRange, onDateRangeChange, filters, onFiltersChange,
  onToggleSidebar
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
  ];

  const dateRanges: DateRange[] = [
    { label: 'Today', start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
    { label: 'Last 7 Days', start: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
    { label: 'Last Month', start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0], end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0] },
    { label: 'This Month', start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0] },
    { label: 'All Time', start: '2000-01-01', end: '2030-12-31' },
  ];

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4" ref={menuRef}>
        {/* Currency Switcher - Hidden on very small screens, or scaled down */}
        <div className="relative hidden xs:block">
          <div 
            onClick={() => setOpenMenu(openMenu === 'currency' ? null : 'currency')}
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 cursor-pointer hover:bg-slate-100 transition-all"
          >
            <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
              {currencies.find(c => c.code === currency)?.symbol || '$'}
            </div>
            <svg className={`w-3.5 h-3.5 text-slate-300 transition-transform ${openMenu === 'currency' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
          {openMenu === 'currency' && (
            <div className="absolute top-full mt-2 right-0 w-32 bg-white border border-slate-100 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {currencies.map(c => (
                <button 
                  key={c.code}
                  onClick={() => { onCurrencyChange(c.code); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${currency === c.code ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {c.code} ({c.symbol})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="relative">
          <button 
            onClick={() => setOpenMenu(openMenu === 'date' ? null : 'date')}
            className="flex items-center gap-2 sm:gap-2.5 bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="truncate max-w-[60px] sm:max-w-none">{dateRange.label}</span>
            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openMenu === 'date' && (
            <div className="absolute top-full mt-2 right-0 w-64 sm:w-72 bg-white border border-slate-100 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 pb-4 border-b border-slate-50">
                {dateRanges.map(range => (
                  <button 
                    key={range.label}
                    onClick={() => { onDateRangeChange(range); setOpenMenu(null); }}
                    className={`text-left px-3 py-2 rounded-lg text-[10px] sm:text-[11px] font-bold transition-colors ${dateRange.label === range.label ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Custom Range</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[8px] font-bold text-slate-400 mb-1 uppercase">From</label>
                    <input 
                      type="date" 
                      value={dateRange.start}
                      onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value, label: 'Custom' })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[8px] font-bold text-slate-400 mb-1 uppercase">To</label>
                    <input 
                      type="date" 
                      value={dateRange.end}
                      onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value, label: 'Custom' })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Selection */}
        <div className="relative">
          <div 
            onClick={() => setOpenMenu(openMenu === 'account' ? null : 'account')}
            className="flex items-center gap-2 sm:gap-3 bg-[#f5f6ff] border border-indigo-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer hover:bg-indigo-50 transition-all group"
          >
             <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${selectedAccount.type === 'DEMO' ? 'bg-indigo-100 text-[#5e5ce6]' : 'bg-emerald-100 text-emerald-600'} hidden xs:flex`}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <span className="text-[10px] sm:text-[11px] font-black text-slate-700 tracking-tight truncate max-w-[60px] sm:max-w-none">{selectedAccount.name}</span>
             <svg className={`w-3.5 h-3.5 text-slate-300 transition-transform ${openMenu === 'account' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
          {openMenu === 'account' && (
            <div className="absolute top-full mt-2 right-0 w-48 sm:w-56 bg-white border border-slate-100 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2">Select Account</p>
              {accounts.map(acc => (
                <button 
                  key={acc.id}
                  onClick={() => { onAccountChange(acc); setOpenMenu(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${selectedAccount.id === acc.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                   <div className={`w-4 h-4 rounded ${acc.type === 'DEMO' ? 'bg-slate-200' : 'bg-emerald-400'}`}></div>
                   {acc.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
