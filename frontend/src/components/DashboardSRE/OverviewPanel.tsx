import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { problemsApi } from '../../services/problemsApi';
import { SREMetrics } from '../../types/problem';

export const OverviewPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<SREMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await problemsApi.getOverview();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch metrics', err);
        if (!metrics) setError('Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) return <div className="p-4 text-center text-gray-500">Loading metrics...</div>;
  if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>;
  if (!metrics) return null;

  const getStatusColor = (critical: number, total: number) => {
    if (total === 0) return 'text-green-600';
    const ratio = critical / total;
    if (ratio > 0.1) return 'text-red-600';
    if (ratio > 0.05) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Problems */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Incidents (24h)</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">{metrics.total}</h3>
            </div>
            <div className={`p-2 rounded-lg bg-gray-50`}>
                <Activity size={20} className="text-gray-600" />
            </div>
        </div>
        <div className={`text-sm mt-3 flex items-center gap-1.5 font-medium ${getStatusColor(metrics.critical, metrics.total)}`}>
          <AlertCircle size={14} />
          {metrics.critical} Critical / {metrics.high} High
        </div>
      </div>

      {/* False Positive Rate */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">False Positive Rate</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">{metrics.fpRate}%</h3>
            </div>
            <div className={`p-2 rounded-lg bg-orange-50`}>
                <AlertCircle size={20} className="text-orange-600" />
            </div>
        </div>
        <div className="text-sm mt-3 text-orange-700 font-medium">
          {metrics.falsePositives} classified as noise
        </div>
      </div>

      {/* Avg Resolution Time */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Avg Duration</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">
                    {metrics.averageDuration > 60000 
                        ? `${(metrics.averageDuration / 60000).toFixed(0)}m` 
                        : `${(metrics.averageDuration / 1000).toFixed(0)}s`}
                </h3>
            </div>
            <div className={`p-2 rounded-lg bg-blue-50`}>
                <Clock size={20} className="text-blue-600" />
            </div>
        </div>
        <div className="text-sm mt-3 text-gray-500">
          Average incident lifetime
        </div>
      </div>

      {/* Trend */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Trend (24h)</p>
                <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-3xl font-bold text-gray-900">{Math.abs(metrics.trendPercentage).toFixed(1)}%</h3>
                </div>
            </div>
            <div className={`p-2 rounded-lg ${metrics.trend === 'IMPROVING' ? 'bg-green-50' : 'bg-red-50'}`}>
                {metrics.trend === 'IMPROVING' ? (
                    <TrendingDown className="text-green-600" size={20} />
                ) : metrics.trend === 'DEGRADING' ? (
                    <TrendingUp className="text-red-600" size={20} />
                ) : (
                    <div className="text-gray-600 font-bold px-2">−</div>
                )}
            </div>
        </div>
        <div className={`text-sm mt-3 font-medium ${metrics.trend === 'IMPROVING' ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.trend === 'IMPROVING' ? 'Improving vs Previous' : 'Degrading vs Previous'}
        </div>
      </div>
    </div>
  );
};
