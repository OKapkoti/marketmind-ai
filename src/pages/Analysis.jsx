import React, { useState, useRef, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import CampaignChart from '../components/CampaignChart';
import InsightsPanel from '../components/InsightsPanel';
import Chatbot from '../components/Chatbot';
import { Upload, Play, X, FileSpreadsheet } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const calculateDataQuality = (campaigns) => {
  const totalFields = campaigns.length * 6 // 6 required columns
  let filledFields = 0
  let issues = []
  
  campaigns.forEach(c => {
    if (c.name) filledFields++
    if (c.roi !== undefined && c.roi !== null) filledFields++
    if (c.ctr !== undefined && c.ctr !== null) filledFields++
    if (c.cpa !== undefined && c.cpa !== null) filledFields++
    if (c.spend !== undefined && c.spend !== null) filledFields++
    if (c.conversions !== undefined && c.conversions !== null) filledFields++
    
    if (c.spend < 0) issues.push(`${c.name} has negative spend`)
    if (c.conversions === 0) issues.push(`${c.name} has zero conversions`)
    if (c.roi < 0) issues.push(`${c.name} has negative ROI`)
    if (c.roi > 1000) issues.push(`${c.name} has unusually high ROI`)
  })
  
  const avgCPA = campaigns.reduce((s, c) => s + c.cpa, 0) / campaigns.length
  campaigns.forEach(c => {
    if (c.cpa > avgCPA * 2) issues.push(`${c.name} CPA is 2x above average`)
  })
  
  const score = Math.round((filledFields / totalFields) * 100)
  return { score, issues, filledFields, totalFields }
}

const DataQualityReport = ({ csvData, csvFileName, removeCSV, XIcon }) => {
  const dq = calculateDataQuality(csvData);
  
  const hasMissingValues = dq.filledFields < dq.totalFields;
  const hasNegativeSpendConversions = csvData.some(c => c.spend < 0 || c.conversions < 0);
  const hasInvalidROI = csvData.some(c => c.roi < 0 || c.roi > 1000);
  const hasInvalidCTR = csvData.some(c => c.ctr < 0 || c.ctr > 100);
  const avgCPA_check = csvData.reduce((s, c) => s + c.cpa, 0) / csvData.length;
  const hasHighCPA = csvData.some(c => c.cpa > avgCPA_check * 2);
  const hasZeroConversions = csvData.some(c => c.conversions === 0);

  const getScoreBadge = (score) => {
    if (score >= 90) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">🟢 {score}% Excellent</span>;
    if (score >= 70) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">🟡 {score}% Good</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">🔴 {score}% Poor</span>;
  };

  const maxRoi = Math.max(...csvData.map(c => c.roi));
  const minRoi = Math.min(...csvData.map(c => c.roi));
  const avgROI = (csvData.reduce((s, c) => s + c.roi, 0) / csvData.length).toFixed(1);
  const avgCTR = (csvData.reduce((s, c) => s + c.ctr, 0) / csvData.length).toFixed(1);
  const avgCPA = (csvData.reduce((s, c) => s + c.cpa, 0) / csvData.length).toFixed(1);
  const avgSpend = (csvData.reduce((s, c) => s + c.spend, 0) / csvData.length).toFixed(1);
  const avgConversions = (csvData.reduce((s, c) => s + c.conversions, 0) / csvData.length).toFixed(1);
  
  const totalSpend = csvData.reduce((s, c) => s + c.spend, 0);
  const totalConversions = csvData.reduce((s, c) => s + c.conversions, 0);
  const bestPerformer = csvData.reduce((prev, curr) => (prev.roi > curr.roi) ? prev : curr).name;
  const worstPerformer = csvData.reduce((prev, curr) => (prev.roi < curr.roi) ? prev : curr).name;

  return (
    <div className="border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 bg-white dark:bg-slate-800/50 shadow-sm relative mt-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-xl">📋 Data Quality Report</h3>
          <p className="text-xs text-slate-500 mt-1">Automated data validation and quality assessment before analysis</p>
        </div>
        <button type="button" onClick={removeCSV} className="text-slate-400 hover:text-red-500 transition-colors" title="Remove file">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">📊 Total Campaigns</div>
          <div className="font-semibold">{csvData.length}</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">📅 Metrics Detected</div>
          <div className="font-semibold">6 columns</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">✅ Dataset Integrity Score</div>
          <div>{getScoreBadge(dq.score)}</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">⚠️ Data Anomalies Detected</div>
          <div className={`font-semibold ${dq.issues.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
            {dq.issues.length} anomalies
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="text-sm font-semibold mb-2">Data Quality Checks</h4>
          <ul className="text-sm space-y-1.5 text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">✅ All required columns present</li>
            <li className="flex items-center gap-2">{!hasMissingValues ? '✅ No missing values detected' : '🔴 Missing values detected'}</li>
            <li className="flex items-center gap-2">{!hasNegativeSpendConversions ? '✅ No negative values in spend or conversions' : '🔴 Negative values detected'}</li>
            <li className="flex items-center gap-2">{!hasInvalidROI ? '✅ ROI values are in valid range (0-1000%)' : '🔴 Invalid ROI values detected'}</li>
            <li className="flex items-center gap-2">{!hasInvalidCTR ? '✅ CTR values are in valid range (0-100%)' : '🔴 Invalid CTR values detected'}</li>
            {hasHighCPA && <li className="flex items-center gap-2 text-amber-600 dark:text-amber-400">⚠️ Warning: Campaign CPA is 2x above average</li>}
            {hasZeroConversions && <li className="flex items-center gap-2 text-amber-600 dark:text-amber-400">⚠️ Warning: Campaign has zero conversions</li>}
          </ul>
        </div>
        
        {dq.issues.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 text-sm">
            <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">Detected Issues</h4>
            <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 space-y-1">
              {dq.issues.map((iss, i) => <li key={i}>{iss}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="mb-6 overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2">Campaign Name</th>
              <th className="px-3 py-2 text-right">ROI %</th>
              <th className="px-3 py-2 text-right">CTR %</th>
              <th className="px-3 py-2 text-right">CPA $</th>
              <th className="px-3 py-2 text-right">Spend $</th>
              <th className="px-3 py-2 text-right">Convs</th>
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, idx) => {
              let rowClass = "border-b border-slate-100 dark:border-slate-700/50 even:bg-slate-50 dark:even:bg-slate-800/30";
              if (row.roi === maxRoi) rowClass += " bg-green-50 dark:bg-green-900/20";
              else if (row.roi === minRoi) rowClass += " bg-red-50 dark:bg-red-900/20";
              
              return (
                <tr key={idx} className={rowClass}>
                  <td className="px-3 py-2 font-medium">{row.name}</td>
                  <td className="px-3 py-2 text-right">{row.roi}</td>
                  <td className="px-3 py-2 text-right">{row.ctr}</td>
                  <td className="px-3 py-2 text-right">{row.cpa}</td>
                  <td className="px-3 py-2 text-right">{row.spend}</td>
                  <td className="px-3 py-2 text-right">{row.conversions}</td>
                </tr>
              )
            })}
            <tr className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
              <td className="px-3 py-2">Average</td>
              <td className="px-3 py-2 text-right">{avgROI}</td>
              <td className="px-3 py-2 text-right">{avgCTR}</td>
              <td className="px-3 py-2 text-right">{avgCPA}</td>
              <td className="px-3 py-2 text-right">{avgSpend}</td>
              <td className="px-3 py-2 text-right">{avgConversions}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 text-sm bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
        <div><span className="text-slate-500">Total Spend:</span> <span className="font-semibold">${totalSpend.toLocaleString()}</span></div>
        <div><span className="text-slate-500">Total Conversions:</span> <span className="font-semibold">{totalConversions.toLocaleString()}</span></div>
        <div><span className="text-slate-500">Best Performer:</span> <span className="font-semibold text-green-600 dark:text-green-400">{bestPerformer}</span></div>
        <div><span className="text-slate-500">Needs Attention:</span> <span className="font-semibold text-red-600 dark:text-red-400">{worstPerformer}</span></div>
      </div>
    </div>
  );
};

const SAMPLE_DATA = {
  company: "TechFlow SaaS",
  industry: "SaaS",
  platforms: ["Google Ads", "Meta Ads", "LinkedIn Ads"],
  budget: 15000,
  goal: "Maximize ROI",
  campaigns: [
    { name: "Google Ads", roi: 420, ctr: 2.3, cpa: 18, spend: 6000, conversions: 333 },
    { name: "Meta Ads",   roi: 310, ctr: 1.6, cpa: 24, spend: 5000, conversions: 208 },
    { name: "LinkedIn Ads", roi: 180, ctr: 0.9, cpa: 67, spend: 4000, conversions: 59 }
  ]
};

const Analysis = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  
  useEffect(() => {
    fetch(`${API_URL}/health`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'))
  }, []);

  const [formData, setFormData] = useState({
    company: '',
    industry: 'Other',
    platforms: [],
    budget: '',
    goal: 'Maximize ROI'
  });

  const [results, setResults] = useState(null);
  const [csvData, setCSVData] = useState(null);
  const [csvFileName, setCSVFileName] = useState('');
  const [csvError, setCSVError] = useState(null);
  const [dataSourceUsed, setDataSourceUsed] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const loadSampleData = () => {
    setFormData({
      company: SAMPLE_DATA.company,
      industry: SAMPLE_DATA.industry,
      platforms: SAMPLE_DATA.platforms,
      budget: SAMPLE_DATA.budget,
      goal: SAMPLE_DATA.goal
    });
    setDataSourceUsed('Analysis based on sample data');
    analyzeData(SAMPLE_DATA);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.trim().split('\n')
      if (lines.length < 2) {
         setCSVError('Invalid CSV. File seems empty or missing data rows.')
         return;
      }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const required = ['name', 'roi', 'ctr', 'cpa', 'spend', 'conversions']
      const isValid = required.every(col => headers.includes(col))
      if (!isValid) {
        setCSVError('Invalid CSV. Required columns: name, roi, ctr, cpa, spend, conversions')
        return
      }
      const campaigns = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const obj = {}
        headers.forEach((h, i) => {
          obj[h] = isNaN(values[i]) ? values[i] : parseFloat(values[i])
        })
        return obj
      })
      setCSVData(campaigns)
      setCSVFileName(file.name)
      setCSVError(null)
    }
    reader.readAsText(file)
  }

  const downloadSampleCSV = () => {
    const content = `name,roi,ctr,cpa,spend,conversions\nGoogle Ads,420,2.3,18,6000,333\nMeta Ads,310,1.6,24,5000,208\nLinkedIn Ads,180,0.9,67,4000,59`
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_campaigns.csv'
    a.click()
  }

  const handleDragOver = (e) => {
    e.preventDefault();
  }

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  }

  const removeCSV = () => {
    setCSVData(null);
    setCSVFileName('');
    setCSVError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const analyzeData = async (dataToAnalyze) => {
    setIsAnalyzing(true);
    try {
      const groqApiKey = localStorage.getItem('groq_api_key') || '';
      const requestData = {
        ...dataToAnalyze,
        groq_api_key: groqApiKey
      };

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Server error');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        alert('Cannot connect to Analysis Engine. Please make sure the server is running on port 8000.');
      } else {
        alert(`Analysis pipeline failed: ${error.message}`);
      }
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!csvData || csvData.length === 0) {
      setCSVError("Please upload a CSV file or use sample data");
      return;
    }
    setDataSourceUsed(`Analysis based on your uploaded data — ${csvFileName}`);
    analyzeData({ ...formData, campaigns: csvData });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex gap-8 relative min-h-[calc(100vh-4rem)]">
      
      <div className="flex-1 flex flex-col gap-8 w-full max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Campaign Analysis</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Input your ad performance data to receive AI-driven optimization strategies.</p>
          
          {backendStatus === 'connected' && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium w-fit">
              🟢 Analysis Engine: Online
            </div>
          )}
          {backendStatus === 'disconnected' && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium w-fit">
              🔴 Analysis Engine: Offline — Please start the server
            </div>
          )}
        </div>

        <div className="glass-card p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
            <h2 className="text-2xl font-bold">Data Input & Configuration</h2>
            <button 
              type="button" 
              onClick={loadSampleData}
              className="text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors"
            >
              Load Sample Dataset
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Organization / Client Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Acme Corp" 
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Industry Vertical</label>
                <select 
                  className="input-field appearance-none"
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                >
                  <option>E-commerce</option>
                  <option>SaaS</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                  <option>Retail</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Campaign Budget (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input 
                    type="number" 
                    className="input-field pl-8" 
                    placeholder="10000" 
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Optimization Objective</label>
                <select 
                  className="input-field appearance-none"
                  value={formData.goal}
                  onChange={e => setFormData({...formData, goal: e.target.value})}
                >
                  <option>Maximize ROI</option>
                  <option>Reduce CPA</option>
                  <option>Increase CTR</option>
                  <option>Brand Awareness</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data Sources</label>
              <div className="flex flex-wrap gap-3">
                {['Google Ads', 'Meta Ads', 'LinkedIn Ads'].map(platform => (
                  <label key={platform} className="flex items-center gap-2 cursor-pointer p-2 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary bg-transparent"
                      checked={formData.platforms.includes(platform)}
                      onChange={() => handlePlatformToggle(platform)}
                    />
                    <span className="text-sm">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* CSV Upload Area */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dataset Upload</label>
              <p className="text-xs text-slate-500 mb-2">Upload campaign performance data in CSV format. Required fields: campaign name, ROI, CTR, CPA, spend, conversions</p>
              
              {!csvData ? (
                <div 
                  className="border-2 border-dashed border-brand-primary/50 hover:border-brand-primary rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-brand-primary/5 dark:bg-brand-primary/10 transition-colors cursor-pointer relative"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                  />
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-brand-primary">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Drag &amp; drop your CSV file here or click to browse</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mb-2">
                    ✅ Dataset loaded — {csvData.length} records detected
                  </div>
                  <DataQualityReport 
                    csvData={csvData} 
                    csvFileName={csvFileName} 
                    removeCSV={removeCSV} 
                    XIcon={X} 
                  />
                </>
              )}
              
              {csvError && (
                <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="font-medium">Error:</span> {csvError}
                </div>
              )}
              
              {!csvData && (
                <button 
                  type="button" 
                  onClick={downloadSampleCSV}
                  className="text-xs text-slate-500 hover:text-brand-primary w-fit mt-1 underline underline-offset-2"
                >
                  Download Sample CSV
                </button>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isAnalyzing}
              className="btn-primary mt-4 flex justify-center items-center gap-2 py-3.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running analysis pipeline...
                </div>
              ) : (
                <><Play className="w-5 h-5" /> Run Analysis Pipeline</>
              )}
            </button>
          </form>
        </div>

        {results && (
          <div className="flex flex-col gap-8 animate-fade-in-up mt-4">
            
            <div className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary dark:text-brand-secondary px-4 py-3 rounded-lg text-sm font-medium">
              {dataSourceUsed}
            </div>

            <hr className="my-2 border-slate-200 dark:border-slate-800" />
            <div>
              <h2 className="text-2xl font-bold mb-1">Analysis Output</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Computed statistical metrics and performance indicators</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                  title="Overall ROI" 
                  value={`${results.metrics.overallROI}%`} 
                  status={results.metrics.overallROI > 200 ? '🟢 Good' : '🟡 Average'} 
                  trend="up" 
                  description="Average return on ad spend"
                />
                <MetricCard 
                  title="Avg. CTR" 
                  value={`${results.metrics.avgCTR}%`} 
                  status={results.metrics.avgCTR > 2 ? '🟢 Good' : (results.metrics.avgCTR < 1 ? '🔴 Poor' : '🟡 Average')} 
                  trend="down"
                  description="Avg clicks per 100 impressions" 
                />
                <MetricCard 
                  title="Cost Per Acquisition" 
                  value={`$${results.metrics.avgCPA}`} 
                  status={results.metrics.avgCPA < 50 ? '🟢 Good' : '🔴 High'} 
                  trend="up" 
                  description="Average cost per acquired customer"
                />
                <MetricCard 
                  title="Budget Utilization" 
                  value={`${results.metrics.budgetUtilization}%`} 
                  status={results.metrics.budgetUtilization > 80 ? '🟢 Good' : '🟡 Average'} 
                  description="Percentage of total budget consumed"
                />
              </div>
            </div>

            <hr className="my-2 border-slate-200 dark:border-slate-800" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CampaignChart data={results.metrics.campaigns} />
              </div>
              <div className="lg:col-span-1">
                <InsightsPanel insights={results.insights} />
              </div>
            </div>
            
            <hr className="my-2 border-slate-200 dark:border-slate-800" />
            <div className="glass-card p-6 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10">
              <h3 className="text-xl font-bold mb-2">Statistical Anomaly Detection</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Campaigns flagged as statistical outliers based on deviation from mean performance metrics</p>
              
              <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-400 space-y-2">
                {results.data_summary?.roi_std_dev > 50 && (
                  <li>High standard deviation in ROI ({results.data_summary.roi_std_dev}) indicates erratic performance across sources.</li>
                )}
                {results.data_summary?.spend_concentration > 60 && (
                  <li>High spend concentration ({results.data_summary.spend_concentration}%) on a single campaign - consider diversification.</li>
                )}
                <li>{results.data_summary?.worst_performer} is performing significantly below baseline ROI expectations.</li>
              </ul>
            </div>

          </div>
        )}
        
        <div className="h-20" />
      </div>

      {results && (
        <Chatbot 
          context={{
            ...formData,
            ...results.metrics,
            campaigns: csvData || formData.campaigns || []
          }} 
        />
      )}
    </div>
  );
};

export default Analysis;
