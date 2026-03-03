import React, { useEffect, useState } from 'react';
import { useFiltersStore } from '@/store/filtersStore';
import { analyticsApi } from '@/lib/api/analytics.api';
import { DashboardKPIs } from '@/types/problem.types';
import { AlertCircle, Clock, Activity, Target } from 'lucide-react';

const ProblemsKPIBanner: React.FC = () => {
  const { filters } = useFiltersStore();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [topService, setTopService] = useState<{ name: string; count: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchKPIData = async () => {
      setIsLoading(true);
      try {
        const [kpiData, entitiesData] = await Promise.all([
          analyticsApi.getKPIs(filters as any),
          analyticsApi.getTopEntities(1, filters as any)
        ]);
        
        setKpis(kpiData);
        if (entitiesData.entities && entitiesData.entities.length > 0) {
          setTopService({ 
            name: entitiesData.entities[0].name, 
            count: entitiesData.entities[0].problemCount 
          });
        } else {
          setTopService(null);
        }
      } catch (error) {
        console.error('Failed to fetch KPI Banner data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIData();
  }, [filters]);

  if (isLoading && !kpis) {
    return (
      <div className="w-full h-24 rounded-lg border border-white/10 bg-black/20 backdrop-blur-md animate-pulse flex items-center justify-center mb-6">
        <span className="text-white/50 text-sm font-medium tracking-widest uppercase">Cargando métricas ejecutivas...</span>
      </div>
    );
  }

  // Formatting helpers
  const mttrHours = kpis?.avgResolutionTime ? (kpis.avgResolutionTime / 60).toFixed(1) : '0';
  const criticalRatio = kpis?.totalProblems ? Math.round((kpis.criticalProblems / kpis.totalProblems) * 100) : 0;
  
  return (
    <div className="w-full rounded-xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden mb-6 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50 mix-blend-overlay"></div>
      
      <div className="p-5 flex flex-wrap lg:flex-nowrap gap-4 justify-between items-center relative z-10 w-full">
        
        {/* Metric 1: Active Problems */}
        <div className="flex-1 min-w-[200px] flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Activity className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Problemas Activos</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{kpis?.openProblems || 0}</span>
              <span className="text-xs text-slate-500">/ {kpis?.totalProblems || 0} Total</span>
            </div>
          </div>
        </div>

        {/* Metric 2: MTTR */}
        <div className="flex-1 min-w-[200px] flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">MTTR Promedio</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{mttrHours}</span>
              <span className="text-xs text-slate-500">Horas</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Critical Severity */}
        <div className="flex-1 min-w-[200px] flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <AlertCircle className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Severidad Crítica</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{criticalRatio}%</span>
              <span className="text-xs text-slate-500">del Total ({kpis?.criticalProblems || 0})</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Top Impact */}
        <div className="flex-1 min-w-[200px] flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Target className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Servicio + Afectado</p>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white truncate max-w-[180px]" title={topService?.name || 'N/A'}>
                {topService?.name || 'N/A'}
              </span>
              <span className="text-xs text-slate-500">{topService ? `${topService.count} incidentes` : '-'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProblemsKPIBanner;
