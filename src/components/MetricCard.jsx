import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { clsx } from 'clsx';

const MetricCard = ({ title, value, status, trend, description }) => {
  return (
    <div className="glass-card p-5 hover:-translate-y-1 transition-transform duration-300">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
          {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-rose-500" />}
          {trend === 'neutral' && <Minus className="w-4 h-4 text-slate-400" />}
          
          <span className={clsx(
            status.includes('Good') ? "text-emerald-500" : 
            status.includes('Poor') || status.includes('High') ? "text-rose-500" : 
            "text-amber-500"
          )}>
            {status}
          </span>
        </div>
      </div>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {description}
        </p>
      )}
    </div>
  );
};

export default MetricCard;
