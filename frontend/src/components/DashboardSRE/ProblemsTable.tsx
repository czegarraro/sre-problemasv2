import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { problemsApi } from '../../services/problemsApi';
import { DynatraceProblem } from '../../types/problem';

export const ProblemsTable: React.FC = () => {
  const [problems, setProblems] = useState<DynatraceProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    fpOnly: false,
    search: ''
  });

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const result = await problemsApi.getDetailedProblems({
        page,
        limit: 20,
        status: filters.status || undefined,
        severity: filters.severity || undefined,
        fpOnly: filters.fpOnly,
        // search: filters.search 
      });
      setProblems(result.data);
      // @ts-ignore
      setTotalPages(result.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch problems', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [page, filters.status, filters.severity, filters.fpOnly]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'CRITICAL' || severity === 'HIGH' || severity === 'ERROR') {
      return <AlertCircle size={14} />;
    }
    return <CheckCircle2 size={14} />;
  };
  
  const formatDuration = (ms: number) => {
      if (!ms) return '-';
      if (ms < 1000) return `${ms}ms`;
      const seconds = Math.floor(ms / 1000);
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header & Filters */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Latest Incidents
                <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{problems.length} visible</span>
            </h2>
            
            <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Toggles */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <button 
                        onClick={() => setFilters({...filters, status: filters.status === 'OPEN' ? '' : 'OPEN'})}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${filters.status === 'OPEN' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Open Only
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                    <button 
                        onClick={() => setFilters({...filters, fpOnly: !filters.fpOnly})}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${filters.fpOnly ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        False Positives
                    </button>
                </div>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading incidents...
        </div>
      ) : (
        <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Duration</th>
                    <th className="px-4 py-3 text-right">Users</th>
                    <th className="px-4 py-3">Affected Services</th>
                    <th className="px-4 py-3 text-center">FP Score</th>
                    <th className="px-4 py-3">RCA Hypothesis</th>
                    <th className="px-4 py-3 text-right">EB Impact</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {problems.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-md">
                        <div className="truncate" title={p.title}>{p.title}</div>
                        <div className="text-xs text-gray-400 font-normal mt-0.5">{p.displayId}</div>
                    </td>
                    <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${getSeverityColor(p.severityLevel)}`}>
                        {getSeverityIcon(p.severityLevel)}
                        {p.severityLevel}
                        </span>
                    </td>
                    <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.status === 'OPEN' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {p.status}
                        </span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-gray-600">{formatDuration(p.duration)}</td>
                    <td className="px-4 py-4 text-right text-gray-600">
                        {p.affectedUsers && p.affectedUsers > 0 ? (
                            <span className="font-semibold">{p.affectedUsers}</span>
                        ) : (
                            <span className="text-gray-300">-</span>
                        )}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600 max-w-[200px]">
                        <div className="truncate" title={p.affectedEntities?.map(s => s.name).join(', ')}>
                            {p.affectedEntities?.length > 0 ? p.affectedEntities.map(s => s.name).join(', ') : <span className="text-gray-400">No services</span>}
                        </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                        {p.isFalsePositive ? (
                        <div className="inline-flex flex-col items-center">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded">
                                {p.falsePositiveScore}%
                            </span>
                        </div>
                        ) : (
                        <span className="text-gray-300">0%</span>
                        )}
                    </td>
                    <td className="px-4 py-4 text-xs max-w-[200px]">
                        {p.rootCause ? (
                        <div className="truncate text-gray-700" title={p.rootCause.hypothesis}>
                            <span className="font-semibold text-blue-600">{p.rootCause.confidence}%</span> {p.rootCause.hypothesis}
                        </div>
                        ) : (
                        <span className="text-gray-400 italic">Pending analysis...</span>
                        )}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-xs">
                        {p.sloImpact && p.sloImpact.impactPercentage > 0 ? (
                             <span className="text-red-600 font-medium">-{p.sloImpact.impactPercentage.toFixed(2)}%</span>
                        ) : <span className="text-gray-300">0%</span>}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            
            {/* Pagination settings */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button 
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </>
      )}
    </div>
  );
};
