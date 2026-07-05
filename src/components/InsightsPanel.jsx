import React from 'react';
import { Lightbulb } from 'lucide-react';

const InsightsPanel = ({ insights }) => {
  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">AI Insight Engine — Generated Recommendations</h3>
        </div>
        <p className="text-xs text-slate-500 ml-13">LLaMA 3.3 70B generated actionable insights</p>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {insights.map((insight, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-sm leading-relaxed">
            {insight}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
