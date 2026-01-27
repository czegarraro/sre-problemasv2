import React from 'react';
import { OverviewPanel } from '../components/DashboardSRE/OverviewPanel';
import { ProblemsTable } from '../components/DashboardSRE/ProblemsTable';
import { ShieldCheck, BarChart3, Settings } from 'lucide-react';

const SREDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">SRE Observability Platform</h1>
                </div>
                
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                         <BarChart3 size={20} />
                         <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                         <Settings size={20} />
                    </button>
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs ring-4 ring-blue-50">
                        SR
                    </div>
                </div>
            </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
            <p className="text-gray-500 mt-1">Real-time analysis of Dynatrace problems with noise reduction and RCA.</p>
        </div>

        {/* Status Metrics */}
        <OverviewPanel />

        {/* Charts Section (Placeholder for Trends) */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                <h3 className="font-bold text-gray-900 mb-4">Incident Trends (7 Days)</h3>
                <div className="flex items-center justify-center h-full text-gray-400">
                    chart placeholder
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                 <h3 className="font-bold text-gray-900 mb-4">Top Affected Services</h3>
                 <div className="flex items-center justify-center h-full text-gray-400">
                    list placeholder
                </div>
            </div>
        </div> */}

        {/* Problems Table */}
        <ProblemsTable />
        
      </main>
    </div>
  );
};

export default SREDashboard;
