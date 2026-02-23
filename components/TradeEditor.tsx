
import React, { useState } from 'react';
import { Trade, TradeSide, TradeStatus, Strategy } from '../types';

interface TradeEditorProps {
  date: string;
  onSave: (trade: Omit<Trade, 'accountId'>) => void;
  onClose: () => void;
  initialTrade?: Trade;
  availableStrategies?: Strategy[];
  isViewMode?: boolean;
}

const TradeEditor: React.FC<TradeEditorProps> = ({ date, onSave, onClose, initialTrade, availableStrategies = [], isViewMode = false }) => {
  const [symbol, setSymbol] = useState(initialTrade?.symbol || '');
  const [side, setSide] = useState<TradeSide>(initialTrade?.side || TradeSide.LONG);
  const [entryPrice, setEntryPrice] = useState(initialTrade?.entryPrice || 0);
  const [exitPrice, setExitPrice] = useState(initialTrade?.exitPrice || 0);
  const [quantity, setQuantity] = useState(initialTrade?.quantity || 1);
  const [stopLoss, setStopLoss] = useState(initialTrade?.stopLoss || 0);
  const [takeProfit, setTakeProfit] = useState(initialTrade?.takeProfit || 0);
  const [commission, setCommission] = useState(initialTrade?.commission || 0);
  const [swap, setSwap] = useState(initialTrade?.swap || 0);
  const [notes, setNotes] = useState(initialTrade?.notes || '');
  const [selectedSetups, setSelectedSetups] = useState<string[]>(initialTrade?.setups || []);
  // Time fields
  const [entryTime, setEntryTime] = useState(initialTrade?.time || '09:00');
  const [exitTime, setExitTime] = useState(initialTrade?.closeTime || '17:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pnl = (exitPrice - entryPrice) * quantity * (side === TradeSide.LONG ? 1 : -1) - commission + swap;
    
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
      tradeType: 'Day Trade',
      executionType: 'Market',
      status: pnl > 0 ? TradeStatus.WIN : pnl === 0 ? TradeStatus.BE : TradeStatus.LOSS,
      stopLoss,
      takeProfit,
      commission,
      swap,
      setups: selectedSetups,
      generalTags: ['Trend'],
      exitTags: ['Target Hit'],
      processTags: ['Followed Plan'],
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

  const FormContent = (
    <form onSubmit={handleSubmit} className={`space-y-8 ${isViewMode ? 'p-10' : 'p-8'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Field label="Pair / Symbol" value={symbol} onChange={(e: any) => setSymbol(e.target.value.toUpperCase())} placeholder="e.g. BTCUSDT" />
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
        </div>

        <div className="space-y-6">
          <div>
             <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest flex justify-between items-center">
               Playbook & Strategies
               <span className="text-[8px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded tracking-normal">Linked Setups</span>
             </label>
             <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                {availableStrategies.map(strat => (
                  <button 
                    key={strat.id}
                    type="button"
                    onClick={() => toggleSetup(strat.name)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      selectedSetups.includes(strat.name) 
                      ? 'bg-[#5e5ce6] border-[#5e5ce6] text-white shadow-lg shadow-indigo-100' 
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {strat.name}
                  </button>
                ))}
                {availableStrategies.length === 0 && (
                  <p className="text-[10px] text-slate-300 font-bold italic">No playbooks defined yet.</p>
                )}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Commission" type="number" step="any" value={commission} onChange={(e: any) => setCommission(Number(e.target.value))} />
            <Field label="Swap / Rollover" type="number" step="any" value={swap} onChange={(e: any) => setSwap(Number(e.target.value))} />
          </div>

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
        <button type="submit" className="flex-1 px-8 py-4 text-xs font-black uppercase tracking-widest text-white bg-[#5e5ce6] hover:bg-[#4d4acb] rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">Complete Logging</button>
      </div>
    </form>
  );

  if (isViewMode) {
    return FormContent;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-[#5e5ce6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight text-xl">Log Trade Performance</h3>
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

export default TradeEditor;
