
import React, { useState, useEffect, useRef } from 'react';
import { Trade, TradeSide, TradeStatus, Strategy } from '../types';

interface TradeEditorProps {
  date: string;
  onSave: (trade: Omit<Trade, 'accountId'>) => void;
  onClose: () => void;
  initialTrade?: Trade;
  availableStrategies?: Strategy[];
  isViewMode?: boolean;
  isEditMode?: boolean;
}

const TradeEditor: React.FC<TradeEditorProps> = ({ date, onSave, onClose, initialTrade, availableStrategies = [], isViewMode = false, isEditMode = false }) => {
  const [symbol, setSymbol] = useState(initialTrade?.symbol || '');
  const [symbolSearch, setSymbolSearch] = useState('');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const symbolDropdownRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<TradeSide>(initialTrade?.side || TradeSide.LONG);
  const [entryPrice, setEntryPrice] = useState(initialTrade?.entryPrice || 0);
  const [exitPrice, setExitPrice] = useState(initialTrade?.exitPrice || 0);
  const [quantity, setQuantity] = useState(initialTrade?.quantity || 1);
  const [stopLoss, setStopLoss] = useState(initialTrade?.stopLoss || 0);
  const [takeProfit, setTakeProfit] = useState(initialTrade?.takeProfit || 0);
  const [commission, setCommission] = useState(initialTrade?.commission || 0);
  const [swap, setSwap] = useState(initialTrade?.swap || 0);
  const [profit, setProfit] = useState(initialTrade?.pnl || 0);
  const [notes, setNotes] = useState(initialTrade?.notes || '');
  const [selectedSetups, setSelectedSetups] = useState<string[]>(initialTrade?.setups || []);
  const [generalTags, setGeneralTags] = useState<string[]>(initialTrade?.generalTags || []);
  const [exitTags, setExitTags] = useState<string[]>(initialTrade?.exitTags || []);
  const [processTags, setProcessTags] = useState<string[]>(initialTrade?.processTags || []);
  const [tradeType, setTradeType] = useState(initialTrade?.tradeType || 'Day Trade');
  const [executionType, setExecutionType] = useState(initialTrade?.executionType || 'Market');
  // Time fields
  const [entryTime, setEntryTime] = useState(initialTrade?.time || '09:00');
  const [exitTime, setExitTime] = useState(initialTrade?.closeTime || '17:00');

  // Common trading pairs
  const commonPairs = [
    // Forex Major Pairs
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    // Forex Cross Pairs
    'EURJPY', 'GBPJPY', 'EURGBP', 'EURAUD', 'EURCHF', 'AUDJPY', 'GBPAUD',
    // Crypto Major
    'BTCUSD', 'BTCUSDT', 'ETHUSD', 'ETHUSDT', 'BNBUSD', 'BNBUSDT',
    'SOLUSD', 'SOLUSDT', 'XRPUSD', 'XRPUSDT', 'ADAUSD', 'ADAUSDT',
    // Crypto Alts
    'DOTUSD', 'DOTUSDT', 'LINKUSD', 'LINKUSDT', 'MATICUSD', 'MATICUSDT',
    // Indices
    'SPX', 'NQ', 'ES', 'YM', 'RTY', 'DJI', 'NDX', 'DAX', 'FTSE',
    // Commodities
    'XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NATGAS',
    // Popular Stocks
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD',
  ];

  const filteredPairs = symbolSearch
    ? commonPairs.filter(pair => 
        pair.toLowerCase().includes(symbolSearch.toLowerCase())
      )
    : commonPairs;

  // Predefined tags
  const predefinedGeneralTags = ['Trend', 'Counter-Trend', 'Breakout', 'Reversal', 'Scalp', 'Swing', 'News Event', 'High Volume'];
  const predefinedExitTags = ['Target Hit', 'Stop Loss', 'Trailing Stop', 'Manual Exit', 'Time Exit', 'Partial Exit', 'Break Even'];
  const predefinedProcessTags = ['Followed Plan', 'Revenge Trade', 'FOMO', 'Overtrading', 'Patience', 'Discipline', 'Emotional'];
  const tradeTypes = ['Day Trade', 'Swing Trade', 'Scalp', 'Position Trade'];
  const executionTypes = ['Market', 'Limit', 'Stop', 'Stop Limit'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (symbolDropdownRef.current && !symbolDropdownRef.current.contains(event.target as Node)) {
        setShowSymbolDropdown(false);
      }
    };

    if (showSymbolDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSymbolDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pnl = profit !== 0 ? profit : (exitPrice - entryPrice) * quantity * (side === TradeSide.LONG ? 1 : -1) - commission + swap;
    
    const entryDateTime = new Date(`${date}T${entryTime}:00`);
    const exitDateTime = new Date(`${date}T${exitTime}:00`);
    
    // Calculate duration
    let duration = '0m';
    if (exitDateTime > entryDateTime) {
      const diffMs = exitDateTime.getTime() - entryDateTime.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) {
        duration = `${hours}h ${minutes}m`;
      } else {
        duration = `${minutes}m`;
      }
    }
    
    onSave({
      id: initialTrade?.id || Math.random().toString(36).substr(2, 9),
      date,
      symbol,
      side,
      entryPrice,
      exitPrice,
      closePrice: exitPrice,
      quantity,
      pnl,
      duration,
      tradeType,
      executionType,
      status: pnl > 0 ? TradeStatus.WIN : pnl === 0 ? TradeStatus.BE : TradeStatus.LOSS,
      stopLoss,
      takeProfit,
      commission,
      swap,
      setups: selectedSetups,
      generalTags,
      exitTags,
      processTags,
      notes,
      executedAt: entryDateTime.toISOString(),
      closedAt: exitDateTime.toISOString(),
      time: entryTime,
      closeTime: exitTime,
    });
  };

  const toggleSetup = (name: string) => {
    setSelectedSetups(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const addCustomSetup = (setup: string) => {
    if (!setup.trim()) return;
    if (!selectedSetups.includes(setup.trim())) {
      setSelectedSetups([...selectedSetups, setup.trim()]);
    }
  };

  const toggleTag = (tag: string, type: 'general' | 'exit' | 'process') => {
    const setter = type === 'general' ? setGeneralTags : type === 'exit' ? setExitTags : setProcessTags;
    const current = type === 'general' ? generalTags : type === 'exit' ? exitTags : processTags;
    setter(current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag]);
  };

  const addCustomTag = (tag: string, type: 'general' | 'exit' | 'process') => {
    if (!tag.trim()) return;
    const setter = type === 'general' ? setGeneralTags : type === 'exit' ? setExitTags : setProcessTags;
    const current = type === 'general' ? generalTags : type === 'exit' ? exitTags : processTags;
    if (!current.includes(tag.trim())) {
      setter([...current, tag.trim()]);
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className={`space-y-8 ${isViewMode ? 'p-10' : 'p-8'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="relative" ref={symbolDropdownRef}>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Pair / Symbol</label>
              <input
                type="text"
                value={symbolSearch || symbol}
                onChange={(e) => {
                  setSymbolSearch(e.target.value);
                  setSymbol(e.target.value.toUpperCase());
                  setShowSymbolDropdown(true);
                }}
                onFocus={() => setShowSymbolDropdown(true)}
                placeholder="Search or type symbol"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 text-sm font-bold text-slate-800 outline-none transition-all uppercase"
              />
              {showSymbolDropdown && filteredPairs.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredPairs.slice(0, 20).map((pair) => (
                    <button
                      key={pair}
                      type="button"
                      onClick={() => {
                        setSymbol(pair);
                        setSymbolSearch('');
                        setShowSymbolDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                    >
                      <span>{pair}</span>
                      <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Trade Side</label>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button 
                  type="button"
                  onClick={() => setSide(TradeSide.LONG)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${side === TradeSide.LONG ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Buy / Long
                </button>
                <button 
                  type="button"
                  onClick={() => setSide(TradeSide.SHORT)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${side === TradeSide.SHORT ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Sell / Short
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Entry Price" type="number" step="any" value={entryPrice} onChange={(e: any) => setEntryPrice(Number(e.target.value))} />
            <Field label="Exit / Close Price" type="number" step="any" value={exitPrice} onChange={(e: any) => setExitPrice(Number(e.target.value))} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Quantity / Lot" type="number" step="any" value={quantity} onChange={(e: any) => setQuantity(Number(e.target.value))} />
            <Field label="Trade Date" type="date" value={date} readOnly />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Entry Time" type="time" value={entryTime} onChange={(e: any) => setEntryTime(e.target.value)} />
            <Field label="Exit Time" type="time" value={exitTime} onChange={(e: any) => setExitTime(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Stop Loss" type="number" step="any" value={stopLoss} onChange={(e: any) => setStopLoss(Number(e.target.value))} />
            <Field label="Take Profit" type="number" step="any" value={takeProfit} onChange={(e: any) => setTakeProfit(Number(e.target.value))} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Trade Type</label>
              <select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 text-sm font-bold text-slate-800 outline-none transition-all"
              >
                {tradeTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Execution Type</label>
              <select
                value={executionType}
                onChange={(e) => setExecutionType(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 text-sm font-bold text-slate-800 outline-none transition-all"
              >
                {executionTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <TagSelector
            label="Playbook & Strategies"
            predefinedTags={availableStrategies.map(s => s.name)}
            selectedTags={selectedSetups}
            onToggle={toggleSetup}
            onAdd={addCustomSetup}
            emptyMessage="No playbooks defined yet."
          />

          <div className="grid grid-cols-2 gap-6">
            <Field label="Commission" type="number" step="any" value={commission} onChange={(e: any) => setCommission(Number(e.target.value))} />
            <Field label="Swap / Rollover" type="number" step="any" value={swap} onChange={(e: any) => setSwap(Number(e.target.value))} />
          </div>

          <div>
            <Field label="Profit / Loss (Optional)" type="number" step="any" value={profit} onChange={(e: any) => setProfit(Number(e.target.value))} placeholder="Leave 0 to auto-calculate" />
          </div>

          <TagSelector
            label="General Tags"
            predefinedTags={predefinedGeneralTags}
            selectedTags={generalTags}
            onToggle={(tag) => toggleTag(tag, 'general')}
            onAdd={(tag) => addCustomTag(tag, 'general')}
          />

          <TagSelector
            label="Exit Tags"
            predefinedTags={predefinedExitTags}
            selectedTags={exitTags}
            onToggle={(tag) => toggleTag(tag, 'exit')}
            onAdd={(tag) => addCustomTag(tag, 'exit')}
          />

          <TagSelector
            label="Process Tags"
            predefinedTags={predefinedProcessTags}
            selectedTags={processTags}
            onToggle={(tag) => toggleTag(tag, 'process')}
            onAdd={(tag) => addCustomTag(tag, 'process')}
          />

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Trade Commentary</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Context, emotions, strategy used..." 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 text-sm min-h-[140px] outline-none font-medium text-slate-600 transition-all" 
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-4 border-t border-slate-100">
        <button type="button" onClick={onClose} className="flex-1 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95">Cancel</button>
        <button type="submit" className="flex-1 px-8 py-4 text-xs font-black uppercase tracking-widest text-white bg-[#5e5ce6] hover:bg-[#4d4acb] rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">{isEditMode ? 'Save Changes' : 'Complete Logging'}</button>
      </div>
    </form>
  );

  if (isViewMode) {
    return FormContent;
  }

  const title = isEditMode ? "Edit Trade" : "Log Trade Performance";
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-[#5e5ce6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isEditMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                )}
              </svg>
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight text-xl">{title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="overflow-y-auto custom-scrollbar">
          {FormContent}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, ...props }: any) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">{label}</label>
    <input className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 text-sm font-bold text-slate-800 outline-none transition-all" {...props} />
  </div>
);

const TagSelector = ({ label, predefinedTags, selectedTags, onToggle, onAdd, emptyMessage }: any) => {
  const [customTag, setCustomTag] = useState('');

  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
        {predefinedTags.map((tag: string) => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
              selectedTags.includes(tag)
                ? 'bg-indigo-500 border-indigo-500 text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {tag}
          </button>
        ))}
        {selectedTags.filter((t: string) => !predefinedTags.includes(t)).map((tag: string) => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-amber-500 border-amber-500 text-white"
          >
            {tag}
          </button>
        ))}
        {predefinedTags.length === 0 && selectedTags.length === 0 && emptyMessage && (
          <p className="text-[10px] text-slate-300 font-bold italic">{emptyMessage}</p>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd(customTag);
              setCustomTag('');
            }
          }}
          placeholder="Add custom tag..."
          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="button"
          onClick={() => {
            onAdd(customTag);
            setCustomTag('');
          }}
          className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-[9px] font-bold hover:bg-indigo-600 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default TradeEditor;
