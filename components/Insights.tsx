
import React, { useState } from 'react';
import { Trade, MonthStats, AIInsight } from '../types';
import { getPerformanceInsights } from '../services/geminiService';

interface InsightsProps {
  trades: Trade[];
  stats: MonthStats;
}

const Insights: React.FC<InsightsProps> = ({ trades, stats }) => {
  // Update state to hold array of insights rather than a raw string
  const [insights, setInsights] = useState<Partial<AIInsight>[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Added logic to fetch performance insights from the Gemini API service
  const fetchInsights = async () => {
    setLoading(true);
    // getPerformanceInsights returns an object of form { data: AIInsight[], error: any }
    const result = await getPerformanceInsights(trades);
    
    // Fix: Access the 'data' property from the result object. 
    // result.data contains the parsed array of insights.
    if (result && result.data && result.data.length > 0) {
      setInsights(result.data);
    } else {
      setInsights(null);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Performance Coach
        </h3>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : insights ? 'Refresh Analysis' : 'Analyze Performance'}
        </button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-sm">Gemini is crunching your numbers...</p>
          </div>
        ) : insights ? (
          <div className="space-y-4">
             {/* Map through structured insights to provide a better UI than raw text */}
             {insights.map((insight, idx) => (
               <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">{insight.title}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                      {insight.type}
                    </span>
                 </div>
                 <p className="text-slate-600 text-sm leading-relaxed">
                   {insight.content}
                 </p>
               </div>
             ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm mb-4">Click analyze to get deep insights into your trading habits using Gemini AI.</p>
            <div className="inline-flex items-center gap-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              <span>Risk Management</span>
              <span>•</span>
              <span>Patience</span>
              <span>•</span>
              <span>Discipline</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
