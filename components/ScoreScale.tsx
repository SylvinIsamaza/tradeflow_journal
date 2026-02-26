import React from 'react';

interface ScoreScaleProps {
  score: number;
}

const ScoreScale: React.FC<ScoreScaleProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score < 20) return 'bg-red-500';
    if (score < 40) return 'bg-orange-400';
    if (score < 60) return 'bg-yellow-400';
    if (score < 80) return 'bg-lime-400';
    return 'bg-emerald-500';
  };

  const getScoreLabel = (score: number) => {
    if (score < 20) return 'Poor';
    if (score < 40) return 'Below Average';
    if (score < 60) return 'Average';
    if (score < 80) return 'Good';
    return 'Excellent';
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-visible relative">
        <div className="absolute inset-0 flex">
          <div className="h-full bg-red-500" style={{ width: '20%' }}></div>
          <div className="h-full bg-orange-400" style={{ width: '20%' }}></div>
          <div className="h-full bg-yellow-400" style={{ width: '20%' }}></div>
          <div className="h-full bg-lime-400" style={{ width: '20%' }}></div>
          <div className="h-full bg-emerald-500" style={{ width: '20%' }}></div>
        </div>
        <div 
          className="absolute top-[12px] -translate-y-1/2 z-10"
          style={{ left: `${Math.min(Math.max(score, 0), 100)}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className={`w-4 h-4 rounded-full bg-white border-3 ${getScoreColor(score).replace('bg-', 'border-')} shadow-lg`}></div>
        </div>
      </div>
      <div className="flex justify-between text-[8px] font-bold text-slate-300">
        <span>0</span>
        <span>20</span>
        <span>40</span>
        <span>60</span>
        <span>80</span>
        <span>100</span>
      </div>
      <p className="text-[9px] font-bold text-slate-500 text-center mt-1">
        {getScoreLabel(score)}
      </p>
    </div>
  );
};

export default ScoreScale;
