
import React, { useState } from 'react';
import { Trade, TradeSide, Strategy } from '../../types.ts';
import TradeEditor from '../TradeEditor.tsx';

interface AddTradeViewProps {
  onSave: (trade: Omit<Trade, 'accountId'>) => void;
  onCancel: () => void;
  availableStrategies: Strategy[];
}

const AddTradeView: React.FC<AddTradeViewProps> = ({ onSave, onCancel, availableStrategies }) => {
  const [mode, setMode] = useState<'selection' | 'manual' | 'import' | 'mt5-config'>('selection');

  if (mode === 'manual') {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => setMode('selection')}
            className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            Back to selection
          </button>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Manual Trade Entry</h2>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <TradeEditor 
            isViewMode={true}
            date={new Date().toISOString().split('T')[0]} 
            onSave={onSave} 
            onClose={onCancel}
            availableStrategies={availableStrategies}
          />
        </div>
      </div>
    );
  }

  if (mode === 'import' || mode === 'mt5-config') {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setMode('selection')}
          className="mb-6 flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        
        <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-xl shadow-slate-200/50 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-[30px] flex items-center justify-center mx-auto mb-8">
            <img src="https://www.metatrader5.com/i/logo.png" alt="MT5" className="w-10 grayscale opacity-50" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4">Import from MetaTrader 5</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            Upload your MT5 HTML report or CSV export to automatically sync your trading history.
          </p>
          
          <div className="border-2 border-dashed border-slate-100 rounded-[32px] p-12 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group mb-8">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mx-auto mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0l-4 4m4-4v12" /></svg>
            </div>
            <p className="text-sm font-black text-slate-800">Drop your file here</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">or click to browse</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-left">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">How to export from MT5</h4>
             <ul className="text-[11px] text-slate-500 space-y-2 font-medium">
               <li className="flex gap-2"><span>1.</span> Open MT5 Terminal and go to the 'History' tab.</li>
               <li className="flex gap-2"><span>2.</span> Right-click anywhere in history, select 'Report'  'HTML'.</li>
               <li className="flex gap-2"><span>3.</span> Save the file and upload it here.</li>
             </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">How would you like to add trades?</h2>
        <p className="text-slate-400 font-medium text-lg">Choose your preferred method to start logging your performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manual Option */}
        <div 
          onClick={() => setMode('manual')}
          className="bg-white rounded-[48px] p-10 border border-slate-200 shadow-xl shadow-slate-200/20 hover:border-indigo-500 hover:shadow-indigo-500/10 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 bg-indigo-50 rounded-[30px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">Manual Entry</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Perfect for detailed logging, emotional tracking, and linking strategies from your playbook.
            </p>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
              Start Logging 
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 12h15" /></svg>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Import Option */}
        <div 
          onClick={() => setMode('import')}
          className="bg-white rounded-[48px] p-10 border border-slate-200 shadow-xl shadow-slate-200/20 hover:border-emerald-500 hover:shadow-emerald-500/10 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-[30px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0l-4 4m4-4v12" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">Bulk Import</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Import hundreds of trades instantly from MT5, Binance, or custom CSV files.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
              Upload Files
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 12h15" /></svg>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
};

export default AddTradeView;
