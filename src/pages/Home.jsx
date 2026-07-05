import React from 'react';
import { ArrowRight, Target, Zap, BarChart3, Database, Search, FileText, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 lg:p-12 max-w-4xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          <span>Advanced Data Analytics</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Intelligent Marketing <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-600">Campaign Analytics</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Upload your campaign data, get deep statistical analysis, KPI breakdowns, and AI-generated insights — all in one platform.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/analysis" className="btn-primary py-3 px-6 text-lg flex items-center gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40">
            Start Analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 py-3 px-6 rounded-xl font-semibold text-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <FileText className="w-5 h-5" />
            View Sample Report
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-slate-800 py-16 px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex flex-col gap-4 p-6 glass-card border border-slate-200 dark:border-slate-700/50">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Statistical Analysis</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Pandas-powered KPI calculations including ROI, CTR, CPA, ROAS and Budget Utilization across all campaigns.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6 glass-card border border-slate-200 dark:border-slate-700/50">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Anomaly Detection</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Automatically flags underperforming campaigns using statistical deviation from mean performance benchmarks.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6 glass-card border border-slate-200 dark:border-slate-700/50">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">AI Insight Engine</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              LLaMA 3.3 70B analyzes your campaign data and generates actionable recommendations in plain English.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6 glass-card border border-slate-200 dark:border-slate-700/50">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Natural Language Querying</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Ask questions about your data in plain English and get data-backed answers instantly.
            </p>
          </div>

        </div>

        {/* How It Works Section */}
        <div className="max-w-5xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Analysis Pipeline Architecture</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-slate-400 border-2 border-slate-200 dark:border-slate-700">1</div>
              <h4 className="text-lg font-bold mb-2">Step 1: Data Ingestion</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Upload your CSV campaign data. The system validates structure, checks data quality and detects missing values.</p>
            </div>
            <div className="hidden md:flex flex-col justify-center items-center px-4">
              <ArrowRight className="w-6 h-6 text-slate-300 dark:text-slate-700" />
            </div>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-slate-400 border-2 border-slate-200 dark:border-slate-700">2</div>
              <h4 className="text-lg font-bold mb-2">Step 2: Statistical Processing</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pandas calculates aggregations, KPIs, correlations and identifies statistical anomalies in your data.</p>
            </div>
            <div className="hidden md:flex flex-col justify-center items-center px-4">
              <ArrowRight className="w-6 h-6 text-slate-300 dark:text-slate-700" />
            </div>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-brand-primary border-2 border-brand-primary/30">3</div>
              <h4 className="text-lg font-bold mb-2">Step 3: AI Analysis</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">LLaMA 3.3 70B processes the computed metrics and generates natural language insights and recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
