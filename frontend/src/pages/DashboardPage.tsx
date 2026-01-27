/**
 * Dashboard Page
 */
import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, MessageSquare, GitBranch, TrendingUp, AlertCircle } from 'lucide-react';
import { analyticsApi } from '@/lib/api/analytics.api';
import { DashboardKPIs } from '@/types/problem.types';
import { useFiltersStore } from '@/store/filtersStore';
import KPICard from '@/components/dashboard/KPICard';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import TimeSeriesBarChart from '@/components/charts/TimeSeriesBarChart';
import HeatmapChart from '@/components/charts/HeatmapChart';
import PieChart from '@/components/charts/PieChart';
import DoughnutChart from '@/components/charts/DoughnutChart';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

import ProblemsAnalyzerV2 from '@/components/charts/ProblemsAnalyzerV2';
import { formatDuration } from '@/lib/utils/date.utils';

const DashboardPage: React.FC = () => {
  const { filters } = useFiltersStore();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<any>(null);
  const [matrixData, setMatrixData] = useState<any>(null);
  const [durationData, setDurationData] = useState<any>(null);
  const [impactDistribution, setImpactDistribution] = useState<any>(null);
  const [severityDistribution, setSeverityDistribution] = useState<any>(null);
  const [hasRootCauseDistribution, setHasRootCauseDistribution] = useState<any>(null);
  const [autoremediadoDistribution, setAutoremediadoDistribution] = useState<any>(null);
  const [autoremediationTimeSeries, setAutoremediationTimeSeries] = useState<any>(null);
  const [avgResolutionTimeSeries, setAvgResolutionTimeSeries] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [
          kpisRes, 
          timeSeriesRes, 
          matrixRes, 
          durationRes,
          impactDistRes,
          severityDistRes,
          hasRootCauseDistRes,
          autoremediadoDistRes,
          autoremediationTimeSeriesRes,
          avgResolutionTimeSeriesRes
        ] = await Promise.all([
          analyticsApi.getKPIs(filters),
          analyticsApi.getTimeSeries('day', filters),
          analyticsApi.getImpactSeverityMatrix(filters),
          analyticsApi.getDurationDistribution(filters),
          analyticsApi.getImpactDistribution(filters),
          analyticsApi.getSeverityDistribution(filters),
          analyticsApi.getHasRootCauseDistribution(filters),
          analyticsApi.getAutoremediadoDistribution(filters),
          analyticsApi.getAutoremediationTimeSeries('day', filters),
          analyticsApi.getAverageResolutionTimeTimeSeries('day', filters),
        ]);

        setKpis(kpisRes);
        setTimeSeriesData(timeSeriesRes);
        setMatrixData(matrixRes);
        setDurationData(durationRes);
        setImpactDistribution(impactDistRes);
        setSeverityDistribution(severityDistRes);
        setHasRootCauseDistribution(hasRootCauseDistRes);
        setAutoremediadoDistribution(autoremediadoDistRes);
        setAutoremediationTimeSeries(autoremediationTimeSeriesRes);
        setAvgResolutionTimeSeries(avgResolutionTimeSeriesRes);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Error al cargar los datos. Por favor, verifica que el backend esté corriendo en el puerto 3000.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Error de Conexión</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Asegúrate de que el backend esté corriendo:
            <code className="block mt-2 p-2 bg-white/5 rounded">cd backend && npm run dev</code>
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !kpis) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground">Cargando datos del dashboard...</p>
      </div>
    );
  }

  const durationPieData = durationData ? [
    { name: '< 5 min', value: durationData.categories.less_than_5 },
    { name: '5-10 min', value: durationData.categories['5_to_10'] },
    { name: '10-30 min', value: durationData.categories['10_to_30'] },
    { name: '30 min - 3 hrs', value: durationData.categories['30_to_180'] },
    { name: '> 3 hrs', value: durationData.categories.more_than_180 },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Problems"
          value={kpis.totalProblems}
          icon={Activity}
          color="#3b82f6"
          delay={0}
        />
        <KPICard
          title="Open Problems"
          value={kpis.openProblems}
          icon={AlertTriangle}
          color="#ef4444"
          subtitle={`${kpis.closedProblems} closed`}
          delay={0.1}
        />
        <KPICard
          title="Critical Problems"
          value={kpis.criticalProblems}
          icon={AlertCircle}
          color="#f59e0b"
          subtitle="Availability & Error"
          delay={0.2}
        />
        <KPICard
          title="Avg Resolution Time"
          value={kpis.avgResolutionTime}
          icon={Clock}
          color="#10b981"
          subtitle={formatDuration(kpis.avgResolutionTime)}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Duration"
          value={kpis.totalDuration}
          icon={TrendingUp}
          color="#8b5cf6"
          subtitle={formatDuration(kpis.totalDuration)}
          delay={0.4}
        />
        <KPICard
          title="With Comments"
          value={kpis.problemsWithComments}
          icon={MessageSquare}
          color="#06b6d4"
          delay={0.5}
        />
        <KPICard
          title="GitHub Actions"
          value={kpis.githubActionProblems}
          icon={GitBranch}
          color="#ec4899"
          subtitle="Automated remediation"
          delay={0.6}
        />
        <KPICard
          title="Closed Problems"
          value={kpis.closedProblems}
          icon={CheckCircle}
          color="#10b981"
          subtitle={`${((kpis.closedProblems / kpis.totalProblems) * 100).toFixed(1)}% resolved`}
          delay={0.7}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card variant="glass" className="col-span-full">
          <CardHeader>
            <CardTitle>Problems Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {timeSeriesData && <TimeSeriesChart data={timeSeriesData.data} />}
          </CardContent>
        </Card>

        {/* Impact vs Severity Matrix */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Impact vs Severity Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            {matrixData && <HeatmapChart matrix={matrixData.matrix} />}
          </CardContent>
        </Card>

        {/* Duration Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Duration Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={durationPieData} />
          </CardContent>
        </Card>

        {/* Impact Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Tipo Impacto</CardTitle>
          </CardHeader>
          <CardContent>
            {impactDistribution && (
              <DoughnutChart 
                data={impactDistribution.data} 
                title="Impact Distribution"
                colors={['#5470c6', '#91cc75', '#525f7a', '#fc8452']} // Blue, Green, Gray, Orange
              />
            )}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Tipo Severidad</CardTitle>
          </CardHeader>
          <CardContent>
            {severityDistribution && (
              <DoughnutChart 
                data={severityDistribution.data} 
                title="Severity Distribution"
                colors={['#5470c6', '#91cc75', '#525f7a', '#fc8452', '#73c0de', '#fac858']} // Blue, Green, Gray, Orange, Light Blue, Yellow
              />
            )}
          </CardContent>
        </Card>

        {/* Has Root Cause Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Tiene Causa Raíz</CardTitle>
          </CardHeader>
          <CardContent>
            {hasRootCauseDistribution && (
              <DoughnutChart 
                data={hasRootCauseDistribution.data} 
                title="Root Cause Existence"
                colors={['#5470c6', '#91cc75']} // Blue for "Sí", Green for "No"
              />
            )}
          </CardContent>
        </Card>

        {/* Autoremediado Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Problemas Autoremediados</CardTitle>
          </CardHeader>
          <CardContent>
            {autoremediadoDistribution && (
              <PieChart 
                data={autoremediadoDistribution.data} 
                title="Autoremediado"
              />
            )}
          </CardContent>
        </Card>

        {/* Autoremediation Time Series */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Cantidad de Autoremediación</CardTitle>
          </CardHeader>
          <CardContent>
            {autoremediationTimeSeries && (
              <TimeSeriesBarChart 
                data={autoremediationTimeSeries.data} 
                valueKey="count"
                seriesName="Autoremediaciones"
              />
            )}
          </CardContent>
        </Card>

        {/* Average Resolution Time Series */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Tiempo de Respuesta Prom.</CardTitle>
          </CardHeader>
          <CardContent>
            {avgResolutionTimeSeries && (
              <TimeSeriesBarChart 
                data={avgResolutionTimeSeries.data} 
                valueKey="avgResolutionTime"
                seriesName="Tiempo Promedio (min)"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Problems Analyzer - Hierarchical Sunburst (Legacy)
      <div className="mt-6">
        <ProblemsAnalyzer />
      </div>
      */}

      {/* Problems Analyzer V2 - Optimized Hierarchical Dashboard */}
      <div className="mt-6">
        <ProblemsAnalyzerV2 />
      </div>
    </div>
  );
};

export default DashboardPage;
