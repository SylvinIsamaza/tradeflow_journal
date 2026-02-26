
import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { Trade, DailySummary, JournalComment, TradeSide, CommentType } from '../types';
import { formatCurrency } from '../utils';
import { useTrades } from '@/lib/hooks';
import { useCommentsByDate, useCreateComment, useUpdateComment, useDeleteComment } from '@/lib/hooks/useComments';
import { useApp } from '@/app/AppContext';
import dynamic from 'next/dynamic';

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false });

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  trades: Trade[];
  summary?: DailySummary;
  onAddTrade: () => void;
  onEditComment?: (type: CommentType) => void;
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  date,
  trades: propTrades,
  summary,
  onAddTrade,
  onEditComment
}) => {
  const { selectedAccount } = useApp();
  const [fetchedTrades, setFetchedTrades] = useState<Trade[]>([]);
  const [commentEditorState, setCommentEditorState] = useState<{ isOpen: boolean; type: CommentType } | null>(null);
  
  // Fetch comments
  const { data: commentsData } = useCommentsByDate(
    selectedAccount?.id || '',
    date,
    isOpen && !!selectedAccount?.id && !!date
  );
  
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const [editingComment, setEditingComment] = useState<{ id: string; content: string; type: CommentType } | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  
  const dailyComments = commentsData?.items?.filter((c: any) => c.comment_type === 'daily') || [];
  const weeklyComments = commentsData?.items?.filter((c: any) => c.comment_type === 'weekly') || [];
  
  // Fetch trades if none provided
  const { data: tradesResponse, isLoading } = useTrades({
    account_id: selectedAccount?.id,
    start_date: date,
    end_date: date,
    limit: 100,
  }, {
    enabled: isOpen && propTrades.length === 0 && !!date && !!selectedAccount?.id,
  });

  useEffect(() => {
    if (tradesResponse?.trades) {
      setFetchedTrades(tradesResponse.trades);
    }
  }, [tradesResponse]);

  // Use provided trades or fetched trades
  const trades = propTrades.length > 0 ? propTrades : fetchedTrades;
  
  const handleSaveComment = async (content: string) => {
    if (!selectedAccount?.id || !commentEditorState) return;
    
    if (editingComment) {
      await updateCommentMutation.mutateAsync({
        commentId: editingComment.id,
        content,
      });
      setEditingComment(null);
    } else {
      await createCommentMutation.mutateAsync({
        account_id: selectedAccount.id,
        content,
        comment_type: commentEditorState.type,
        date,
      });
    }
    
    setCommentEditorState(null);
  };
  
  const handleDeleteComment = async () => {
    if (!deletingCommentId) return;
    await deleteCommentMutation.mutateAsync(deletingCommentId);
    setDeletingCommentId(null);
  };
  
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
        
        </div>

        <div className="flex flex-col  gap-8">
          {/* Left Column: Trades */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Trades ({trades.length})</h4>
            {isLoading ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : trades.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm italic">
                No trades recorded for this day.
              </div>
            ) : (
              <div className=" grid md:grid-cols-2 grid-cols-1 w-full items-center justify-center gap-3">
                {trades.map(trade => (
                  <div key={trade.id} className="p-4 w-full flex-1 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 transition-all">
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
                  onClick={() => {
                    setCommentEditorState({ isOpen: true, type: 'daily' });
                    onEditComment?.('daily');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Comment
                </button>
              </div>
              {dailyComments.length > 0 ? (
                <div className="space-y-2">
                  {dailyComments.map((comment: any) => (
                    <div key={comment.id} className="group relative p-4 bg-indigo-50/30 rounded-2xl text-sm text-slate-600 leading-relaxed border border-indigo-50/50 prose prose-sm max-w-none">
                      <div className="absolute top-2 right-2  transition-opacity flex gap-1">
                        <button
                          onClick={() => {
                            setEditingComment({ id: comment.id, content: comment.content, type: 'daily' });
                            setCommentEditorState({ isOpen: true, type: 'daily' });
                          }}
                          className="p-1.5 bg-white rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => setDeletingCommentId(comment.id)}
                          className="p-1.5 bg-white rounded-lg hover:bg-rose-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                    </div>
                  ))}
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
                    onClick={() => {
                      setCommentEditorState({ isOpen: true, type: 'weekly' });
                      onEditComment?.('weekly');
                    }}
                    className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Comment
                  </button>
                </div>
                {weeklyComments.length > 0 ? (
                  <div className="space-y-2">
                    {weeklyComments.map((comment: any) => (
                      <div key={comment.id} className="group relative p-4 bg-violet-50/30 rounded-2xl text-sm text-violet-700 leading-relaxed border border-violet-50/50 prose prose-sm max-w-none">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => {
                              setEditingComment({ id: comment.id, content: comment.content, type: 'weekly' });
                              setCommentEditorState({ isOpen: true, type: 'weekly' });
                            }}
                            className="p-1.5 bg-white rounded-lg hover:bg-violet-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={() => setDeletingCommentId(comment.id)}
                            className="p-1.5 bg-white rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                      </div>
                    ))}
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
      
      {/* Comment Editor */}
      {commentEditorState?.isOpen && (
        <CommentEditor
          date={date}
          type={commentEditorState.type}
          initialContent={editingComment?.content || ""}
          onSave={handleSaveComment}
          onClose={() => {
            setCommentEditorState(null);
            setEditingComment(null);
          }}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deletingCommentId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Comment</h3>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingCommentId(null)}
                className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComment}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DayDetailsModal;
