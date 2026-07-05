import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-surface sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <Target className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight leading-tight">MarketMind AI</span>
              <span className="text-xs text-slate-500 font-medium">Data Analytics & AI Platform</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
