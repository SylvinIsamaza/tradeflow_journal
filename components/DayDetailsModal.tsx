
import React from 'react';
import Modal from './Modal';
import { Trade, DailySummary, JournalComment, TradeSide, CommentType } from '../types';
import { formatCurrency } from '../utils';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  trades: Trade[];
  summary?: DailySummary;
  dailyComment?: JournalComment;
  weeklyComment?: JournalComment;
  onAddTrade: () => void;
  onEditComment: (type: CommentType) => void;
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  date,
  trades,
  summary,
  dailyComment,
  weeklyComment,
  onAddTrade,
  onEditComment
}) => {
  const isSaturday = new Date(date).getDay() === 6;
  const totalPnL = summary?.totalPnL || 0;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Day Review: ${date}`}
      maxWidth="max-w-3xl"
    >
      <div className="p-8 space-y-8">
        {/* Stats Overview */}
        <div className="flex justify-between items-end bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Daily Performance</span>
            <span className={`text-3xl font-black ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatCurrency(totalPnL)}
            </span>
          </div>
          <button 
            onClick={onAddTrade}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold text-sm active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add Trade
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Trades */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Trades ({trades.length})</h4>
            {trades.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm italic">
                No trades recorded for this day.
              </div>
            ) : (
              <div className="space-y-3">
                {trades.map(trade => (
                  <div key={trade.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-slate-800">{trade.symbol}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trade.side === TradeSide.LONG ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {trade.side}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-[10px] text-slate-400 space-x-2">
                        <span>Entry: {trade.entryPrice}</span>
                        <span>•</span>
                        <span>Qty: {trade.quantity}</span>
                      </div>
                      <span className={`font-bold ${trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(trade.pnl)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Journal Entries */}
          <div className="space-y-6">
            {/* Daily Review */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daily Review</h4>
                <button 
                  onClick={() => onEditComment('daily')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  {dailyComment ? 'Edit' : 'Write'}
                </button>
              </div>
              {dailyComment ? (
                <div className="p-4 bg-indigo-50/30 rounded-2xl text-sm text-slate-600 leading-relaxed border border-indigo-50/50 prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: dailyComment.content }} />
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-400 italic border border-slate-100">
                  Reflect on your discipline and emotional state for today...
                </div>
              )}
            </div>

            {/* Weekly Review */}
            {isSaturday && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-violet-500 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-7 0h7" /></svg>
                    Weekly Summary
                  </h4>
                  <button 
                    onClick={() => onEditComment('weekly')}
                    className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    {weeklyComment ? 'Edit' : 'Write'}
                  </button>
                </div>
                {weeklyComment ? (
                  <div className="p-4 bg-violet-50/30 rounded-2xl text-sm text-violet-700 leading-relaxed border border-violet-50/50 prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: weeklyComment.content }} />
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-400 italic border border-slate-100">
                    Saturdays are for review. Analyze your weekly win rate and patterns...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DayDetailsModal;
