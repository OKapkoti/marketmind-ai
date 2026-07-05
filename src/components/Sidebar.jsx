import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  const navGroups = [
    {
      title: 'Data Analysis',
      icon: '📊',
      items: [
        { name: 'New Analysis', path: '/analysis' },
        { name: 'Data Quality Check', path: '/analysis' }
      ]
    },
    {
      title: 'KPI Dashboard',
      icon: '📈',
      items: [
        { name: 'Campaign Metrics', path: '/' },
        { name: 'Performance Benchmarks', path: '/' }
      ]
    },
    {
      title: 'AI Insights',
      icon: '🤖',
      items: [
        { name: 'Generate Insights', path: '/analysis' },
        { name: 'Ask AI Agent', path: '#' }
      ]
    },
    {
      title: 'Reports',
      icon: '📋',
      items: [
        { name: 'Summary Report', path: '#' }
      ]
    }
  ];

  return (
    <div className={clsx(
      "border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-surface transition-all duration-300 relative h-[calc(100vh-4rem)] flex flex-col overflow-y-auto overflow-x-hidden",
      collapsed ? "w-16" : "w-64"
    )}>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full p-1 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 z-10"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="flex-1 py-6 flex flex-col gap-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1 px-3">
            <div className={clsx("flex items-center gap-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1", collapsed && "justify-center")}>
              <span>{group.icon}</span>
              {!collapsed && <span>{group.title}</span>}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors overflow-hidden whitespace-nowrap text-sm",
                  isActive && item.path !== '#' 
                    ? "bg-brand-primary/10 text-brand-primary font-medium" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {!collapsed && <span className="w-4 text-slate-300 dark:text-slate-600 flex-shrink-0">→</span>}
                <span className={clsx("transition-opacity duration-300", collapsed ? "opacity-0 w-0" : "opacity-100")}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
