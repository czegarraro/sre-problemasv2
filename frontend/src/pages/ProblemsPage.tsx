/**
 * Problems Page
 */
import React, { useEffect } from 'react';
import { useProblemsStore } from '@/store/problemsStore';
import { useFiltersStore } from '@/store/filtersStore';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getSeverityBadgeClass, getImpactBadgeClass, getStatusBadgeClass } from '@/lib/utils/color.utils';
import { formatRelativeTime, calculateDuration, formatDuration } from '@/lib/utils/date.utils';
import { formatSeverityLevel, formatImpactLevel } from '@/lib/utils/format.utils';

const ProblemsPage: React.FC = () => {
  const { problems, isLoading, fetchProblems, page, limit, total, totalPages } = useProblemsStore();
  const { filters } = useFiltersStore();

  useEffect(() => {
    fetchProblems({ ...filters, page, limit });
  }, [filters, page, limit]);

  if (isLoading && problems.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Problems</h1>
          <p className="text-muted-foreground mt-1">
            Showing {problems.length} of {total} problems
          </p>
        </div>
      </div>

      <Card variant="glass">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Display ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Start Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {problems.map((problem) => {
                const duration = calculateDuration(problem.startTime, problem.endTime);
                return (
                  <tr
                    key={problem.problemId}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-blue-400">
                        {problem.displayId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-foreground truncate">
                          {problem.title}
                        </p>
                        {problem.recentComments.totalCount > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {problem.recentComments.totalCount} comment(s)
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getImpactBadgeClass(problem.impactLevel)}>
                        {formatImpactLevel(problem.impactLevel)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getSeverityBadgeClass(problem.severityLevel)}>
                        {formatSeverityLevel(problem.severityLevel)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadgeClass(problem.status)}>
                        {problem.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatDuration(duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatRelativeTime(problem.startTime)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => useProblemsStore.getState().setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => useProblemsStore.getState().setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProblemsPage;
