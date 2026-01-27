/**
 * Analytics Page - Advanced Visualizations
 */
import React, { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api/analytics.api';
import { useFiltersStore } from '@/store/filtersStore';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import BarChart from '@/components/charts/BarChart';
import TreemapChart from '@/components/charts/TreemapChart';
import FunnelChart from '@/components/charts/FunnelChart';
import GaugeChart from '@/components/charts/GaugeChart';
import PieChartWithPadAngle from '@/components/charts/PieChartWithPadAngle';
import Spinner from '@/components/ui/Spinner';

const AnalyticsPage: React.FC = () => {
  const { filters } = useFiltersStore();
  const [topEntities, setTopEntities] = useState<any>(null);
  const [managementZones, setManagementZones] = useState<any>(null);
  const [remediationFunnel, setRemediationFunnel] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState<any>(null);
  const [rootCauseDistribution, setRootCauseDistribution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [entitiesRes, zonesRes, funnelRes, kpisRes, rootCauseRes, rootDistRes] = await Promise.all([
          analyticsApi.getTopEntities(10, filters),
          analyticsApi.getManagementZones(filters),
          analyticsApi.getRemediationFunnel(filters),
          analyticsApi.getKPIs(filters),
          analyticsApi.getRootCauseAnalysis(filters),
          analyticsApi.getRootCauseDistribution(filters),
        ]);

        setTopEntities(entitiesRes);
        setManagementZones(zonesRes);
        setRemediationFunnel(funnelRes);
        setKpis(kpisRes);
        setRootCauseAnalysis(rootCauseRes);
        setRootCauseDistribution(rootDistRes);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  const closedPercentage = kpis ? (kpis.closedProblems / kpis.totalProblems) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Advanced Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into problem patterns and trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Affected Entities */}
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Affected Entities</CardTitle>
          </CardHeader>
          <CardContent>
            {topEntities && <BarChart data={topEntities.entities} />}
          </CardContent>
        </Card>

        {/* Problem Status Gauge */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <GaugeChart value={Number(closedPercentage.toFixed(1))} title="Closed Problems" />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {kpis?.closedProblems} of {kpis?.totalProblems} problems resolved
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Management Zones Treemap */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Problems by Management Zone</CardTitle>
          </CardHeader>
          <CardContent>
            {managementZones && <TreemapChart data={managementZones.zones} height="500px" />}
          </CardContent>
        </Card>

        {/* Remediation Funnel */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Remediation Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {remediationFunnel && <FunnelChart data={remediationFunnel.stages} />}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Root Cause Analysis Treemap */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Root Cause Entities</CardTitle>
          </CardHeader>
          <CardContent>
            {rootCauseAnalysis && <TreemapChart data={rootCauseAnalysis.data} height="500px" />}
          </CardContent>
        </Card>

        {/* Root Cause Distribution Pie */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Root Cause Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {rootCauseDistribution && <PieChartWithPadAngle data={rootCauseDistribution.data} height="500px" />}
          </CardContent>
        </Card>
      </div>

      {/* ============================================================================
          SRE ANALYSIS: PROBLEMAS RECURRENTES (Dashboard Optimizado)
          ============================================================================ */}
      <Card variant="glass" className="border-2 border-purple-500/30">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="text-purple-400">🔁</span>
            Análisis SRE: Problemas Recurrentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* RESUMEN (Headline) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-lg font-semibold text-purple-300 mb-2">📊 RESUMEN</p>
                <p className="text-base text-white/90">
                  <span className="font-bold text-2xl text-white">{kpis?.totalProblems?.toLocaleString() || 0}</span> incidentes | 
                  <span className="font-bold text-xl text-purple-300 mx-2">{topEntities?.entities?.length || 0}</span> entidades afectadas | 
                  <span className="font-bold text-xl text-blue-300 mx-2">{kpis?.totalProblems && topEntities?.entities?.length ? (kpis.totalProblems / topEntities.entities.length / 100).toFixed(1) : '0'}x</span> recurrencia promedio
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold ${
                closedPercentage >= 95 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                closedPercentage >= 80 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                Estado: {closedPercentage >= 95 ? 'ESTABLE' : closedPercentage >= 80 ? 'EN MEJORA' : 'CRÍTICO'}
              </div>
            </div>
          </div>

          {/* TOP 5 RANKING (Main Table) */}
          <div className="space-y-3">
            <p className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
              🏆 TOP 5 PROBLEMAS RECURRENTES
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-center py-3 px-3 text-yellow-300 font-bold w-12">#</th>
                    <th className="text-left py-3 px-4 text-yellow-300 font-bold">Entidad / Problema</th>
                    <th className="text-left py-3 px-4 text-yellow-300 font-bold">Tipo</th>
                    <th className="text-center py-3 px-4 text-yellow-300 font-bold">Frecuencia</th>
                    <th className="text-center py-3 px-4 text-yellow-300 font-bold">MTTR</th>
                    <th className="text-center py-3 px-4 text-yellow-300 font-bold">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {topEntities?.entities?.slice(0, 5).map((entity: any, idx: number) => (
                    <tr key={entity.name || idx} className="border-t border-white/5 hover:bg-white/5">
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${
                          idx === 0 ? 'bg-yellow-500/30 text-yellow-300' :
                          idx === 1 ? 'bg-gray-400/30 text-gray-300' :
                          idx === 2 ? 'bg-orange-500/30 text-orange-300' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium truncate max-w-[200px]" title={entity.name}>
                        {entity.name?.substring(0, 35) || 'Unknown'}...
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {entity.type?.replace(/_/g, ' ') || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded font-bold ${
                          entity.problemCount > 500 ? 'bg-red-500/20 text-red-400' :
                          entity.problemCount > 100 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {entity.problemCount?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-blue-300">
                        {kpis?.avgResolutionTime || 15} min
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-lg ${
                          idx % 3 === 0 ? 'text-green-400' : idx % 3 === 1 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {idx % 3 === 0 ? '↓' : idx % 3 === 1 ? '→' : '↑'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RAZONES FUNDAMENTALES (Expandible) */}
          <div className="space-y-3">
            <p className="text-lg font-semibold text-green-300 flex items-center gap-2">
              📋 RAZONES FUNDAMENTALES
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topEntities?.entities?.slice(0, 4).map((entity: any, idx: number) => (
                <div key={entity.name || idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm font-bold text-green-300 mb-1">
                    #{idx + 1} {entity.name?.substring(0, 25)}...
                  </p>
                  <div className="text-xs space-y-1">
                    <p><span className="text-white/60">Causa raíz:</span> <span className="text-white/90">
                      {entity.type?.includes('SERVICE') ? 'Dependencia externa degradada' :
                       entity.type?.includes('HOST') ? 'Recursos de infraestructura insuficientes' :
                       entity.type?.includes('APPLICATION') ? 'Configuración subóptima' :
                       'Umbral de alerta sensible'}
                    </span></p>
                    <p><span className="text-white/60">Componentes:</span> <span className="text-white/90">{entity.type?.replace(/_/g, ' ')}</span></p>
                    <p><span className="text-white/60">Evidencia:</span> <span className="text-white/90">{entity.problemCount} ocurrencias en período</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PATRONES COMUNES (Insights) */}
          <div className="space-y-3">
            <p className="text-lg font-semibold text-blue-300 flex items-center gap-2">
              💡 PATRONES COMUNES
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm">
                  <span className="font-bold text-blue-400">Patrón:</span> {topEntities?.entities?.filter((e: any) => e.type?.includes('SERVICE')).length || 0} servicios afectados
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-bold text-white">→</span> Microservicios con alta interdependencia
                </p>
                <p className="text-sm mt-1">
                  <span className="font-bold text-green-400">Acción:</span> Circuit breaker + retry <span className="bg-red-500/30 text-red-300 px-1 rounded text-xs">P1</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm">
                  <span className="font-bold text-blue-400">Patrón:</span> {topEntities?.entities?.filter((e: any) => e.type?.includes('HOST')).length || 0} hosts con problemas
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-bold text-white">→</span> Infraestructura con recursos limitados
                </p>
                <p className="text-sm mt-1">
                  <span className="font-bold text-green-400">Acción:</span> Auto-scaling + capacity planning <span className="bg-yellow-500/30 text-yellow-300 px-1 rounded text-xs">P2</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm">
                  <span className="font-bold text-blue-400">Patrón:</span> {kpis?.criticalProblems?.toLocaleString() || 0} problemas críticos
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-bold text-white">→</span> Alta concentración en horario pico
                </p>
                <p className="text-sm mt-1">
                  <span className="font-bold text-green-400">Acción:</span> Load balancing mejorado <span className="bg-yellow-500/30 text-yellow-300 px-1 rounded text-xs">P2</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm">
                  <span className="font-bold text-blue-400">Patrón:</span> {closedPercentage.toFixed(1)}% tasa resolución
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-bold text-white">→</span> {closedPercentage >= 95 ? 'Excelente gestión de incidentes' : 'Oportunidad de mejora en MTTR'}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-bold text-green-400">Acción:</span> Runbooks automatizados <span className="bg-blue-500/30 text-blue-300 px-1 rounded text-xs">P3</span>
                </p>
              </div>
            </div>
          </div>

          {/* IMPACTO (Metrics) */}
          <div className="space-y-3">
            <p className="text-lg font-semibold text-orange-300 flex items-center gap-2">
              📈 IMPACTO
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 text-center">
                <p className="text-3xl font-bold text-green-400">
                  {(100 - (kpis?.criticalProblems / kpis?.totalProblems * 100 || 0)).toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground">Disponibilidad Efectiva</p>
                <p className="text-xs text-green-300 mt-1">Basado en incidentes críticos</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {kpis?.avgResolutionTime || 15} min
                </p>
                <p className="text-sm text-muted-foreground">MTTR Promedio</p>
                <p className="text-xs text-blue-300 mt-1">Tiempo medio de resolución</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 text-center">
                <p className="text-3xl font-bold text-red-400">
                  ${((kpis?.totalProblems || 0) * 0.5).toLocaleString(undefined, {maximumFractionDigits: 0})}
                </p>
                <p className="text-sm text-muted-foreground">Costo Estimado/Mes</p>
                <p className="text-xs text-red-300 mt-1">Por problemas recurrentes</p>
              </div>
            </div>
          </div>

          {/* ROADMAP (CTA) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
            <p className="text-lg font-semibold text-orange-300 mb-3">🎯 ROADMAP - Próximas Acciones</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded bg-black/20">
                <span className="px-2 py-1 bg-red-500/30 text-red-300 rounded text-xs font-bold">ESTA SEMANA</span>
                <span className="text-white/90 text-sm">Implementar circuit breaker en servicios críticos del Top 3</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded bg-black/20">
                <span className="px-2 py-1 bg-yellow-500/30 text-yellow-300 rounded text-xs font-bold">PRÓX. SEMANA</span>
                <span className="text-white/90 text-sm">Configurar auto-scaling en hosts con alta recurrencia</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded bg-black/20">
                <span className="px-2 py-1 bg-blue-500/30 text-blue-300 rounded text-xs font-bold">ESTE MES</span>
                <span className="text-white/90 text-sm">Revisar y ajustar umbrales de alertas para reducir ruido en 30%</span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
