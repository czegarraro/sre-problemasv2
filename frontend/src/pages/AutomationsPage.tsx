import React, { useEffect, useState } from 'react';
import { automationApi, AutomationHistory, AutomationStats, Runbook } from '@/lib/api/automation.api';
import { format } from 'date-fns';

const AutomationsPage: React.FC = () => {
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [history, setHistory] = useState<AutomationHistory[]>([]);
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes, runbooksRes] = await Promise.all([
          automationApi.getStats(),
          automationApi.getHistory(),
          automationApi.getRunbooks()
        ]);
        setStats(statsRes);
        setHistory(historyRes);
        setRunbooks(runbooksRes);
      } catch (error) {
        console.error('Error fetching automation data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading Automation Engine...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
            SRE Auto-Remediation
          </h1>
          <p className="text-slate-400 mt-1">Autonomous operations and self-healing systems</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm border border-emerald-500/30">
              Engine Status: ACTIVE
           </span>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium uppercase">Total Savings (YTD)</h3>
            <p className="text-3xl font-bold text-emerald-400 mt-2">
              ${stats.totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium uppercase">Hours Saved</h3>
            <p className="text-3xl font-bold text-blue-400 mt-2">{stats.hoursSaved} hrs</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium uppercase">Auto-Resolutions</h3>
            <p className="text-3xl font-bold text-purple-400 mt-2">{stats.remediationsCount}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium uppercase">Success Rate</h3>
            <p className="text-3xl font-bold text-cyan-400 mt-2">{stats.successRate}%</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-200">Execution History</h2>
              <span className="text-xs text-slate-500">Last 24 Hours</span>
            </div>
            
            <div className="divide-y divide-slate-700/50">
              {history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="font-medium text-slate-200">{item.runbookName}</span>
                    </div>
                    <span className="text-xs text-slate-400">{format(new Date(item.timestamp), 'HH:mm:ss')}</span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                     <div className="text-sm text-slate-400">
                        <div className="mb-1">Target: <span className="text-slate-300 font-mono text-xs">{item.entity}</span></div>
                        <div className="mb-1">Problem: <a href="#" className="text-blue-400 hover:underline">{item.problemId}</a></div>
                     </div>
                     <div className="text-right">
                        <span className="text-xs text-emerald-500 font-medium">Saved ${item.savings}</span>
                     </div>
                  </div>
                  
                  {/* Logs Preview */}
                  <div className="mt-3 bg-slate-900/50 rounded p-2 text-xs font-mono text-slate-400 border border-slate-700/50">
                    {item.logs.slice(0, 2).map((log, i) => (
                      <div key={i} className="truncate">&gt; {log}</div>
                    ))}
                    {item.logs.length > 2 && <div className="text-slate-600 italic">... {item.logs.length - 2} more lines</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Catalog & Config */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
             <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-lg font-semibold text-slate-200">Runbook Catalog</h2>
            </div>
            <div className="p-2 space-y-2">
              {runbooks.map((rb) => (
                <div key={rb.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:border-blue-500/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="font-medium text-slate-300 group-hover:text-blue-400 transition-colors">{rb.name}</h4>
                     <span className="text-[10px] px-2 py-0.5 rounded bg-slate-600 text-slate-300">{rb.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{rb.description}</p>
                </div>
              ))}
              
              <div className="p-3 border-t border-slate-700/50 text-center">
                 <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 w-full">
                    <span>+ Import from Monaco</span>
                 </button>
              </div>
            </div>
          </div>

          {/* Savings Projection */}
           <div className="bg-gradient-to-br from-indigo-900/50 to-slate-800 p-4 rounded-xl border border-indigo-500/20">
              <h3 className="text-indigo-300 font-medium mb-2">Monthly Projection</h3>
              <div className="flex items-end gap-2">
                 <span className="text-2xl font-bold text-white">$7,200</span>
                 <span className="text-sm text-indigo-400 mb-1">est. savings</span>
              </div>
              <div className="mt-3 w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-indigo-500 h-full w-[65%]" />
              </div>
              <p className="text-xs text-slate-400 mt-2">65% of monthly goal reached</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationsPage;
