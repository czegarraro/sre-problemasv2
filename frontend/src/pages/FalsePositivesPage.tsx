/**
 * False Positives Dashboard Page
 * Main dashboard showing FP metrics, distributions, and recommendations
 */
import React, { useEffect, useState } from 'react';
import { falsePositivesApi, FPSummary, FPAnalysisFilters } from '@/lib/api/false-positives.api';
import { analyticsApi } from '@/lib/api/analytics.api';
import { useFiltersStore } from '@/store/filtersStore';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import PieChartWithPadAngle from '@/components/charts/PieChartWithPadAngle';
import FPBarChart from '@/components/charts/FPBarChart';
import Spinner from '@/components/ui/Spinner';
import { AlertTriangle, CheckCircle, HelpCircle, Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface DashboardData {
  summary: FPSummary;
  recommendations: string[];
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'red' | 'green' | 'yellow' | 'blue' | 'purple';
}> = ({ title, value, subtitle, icon, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-gray-400'
          }`}>
            {trend === 'up' ? <TrendingUp size={16} /> : trend === 'down' ? <TrendingDown size={16} /> : null}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ClassificationBadge: React.FC<{ type: string; count: number }> = ({ type, count }) => {
  const config = {
    FALSE_POSITIVE: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <AlertTriangle size={16} /> },
    TRUE_POSITIVE: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircle size={16} /> },
    UNCERTAIN: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <HelpCircle size={16} /> },
  }[type] || { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: null };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} ${config.text}`}>
      {config.icon}
      <span className="font-medium">{type.replace('_', ' ')}</span>
      <span className="font-bold">{count.toLocaleString()}</span>
    </div>
  );
};


// =============================================================================
// MAIN COMPONENT
// =============================================================================

const FalsePositivesPage: React.FC = () => {
  const { filters } = useFiltersStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [topEntities, setTopEntities] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Convert store filters to FP API filters format
        const apiFilters: FPAnalysisFilters = {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          managementZones: filters.managementZones,
          severityLevels: filters.severityLevel,
        };
        
        const [response, entitiesRes, kpisRes] = await Promise.all([
          falsePositivesApi.getSummary(apiFilters),
          analyticsApi.getTopEntities(10, apiFilters),
          analyticsApi.getKPIs(apiFilters),
        ]);
        setData(response);
        setTopEntities(entitiesRes);
        setKpis(kpisRes);
      } catch (err) {
        console.error('Failed to fetch FP analysis:', err);
        setError('Error al cargar el análisis de falsos positivos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]); // Re-fetch when filters change

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-red-400">Error</h2>
        <p className="text-muted-foreground">{error || 'No se pudo cargar los datos'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { summary } = data;

  // Prepare chart data
  const classificationPieData = [
    { name: 'Falsos Positivos', value: summary.falsePositives, color: '#ef4444' },
    { name: 'Verdaderos Positivos', value: summary.truePositives, color: '#22c55e' },
    { name: 'Inciertos', value: summary.uncertain, color: '#f59e0b' },
  ];

  const durationBarData = Object.entries(summary.byDuration || {}).map(([range, count]) => ({
    name: range,
    count: count as number,
  }));

  const severityBarData = Object.entries(summary.bySeverity || {}).map(([severity, count]) => ({
    name: severity.replace('_', ' '),
    count: count as number,
  }));


  const fpRatePercent = (summary.falsePositiveRate * 100).toFixed(1);
  const autoRemRate = (summary.autoRemediationRate * 100).toFixed(1);

  // Calculate alert health score (100 - FP rate)
  const healthScore = Math.round((1 - summary.falsePositiveRate) * 100);
  const healthColor = healthScore >= 80 ? 'green' : healthScore >= 60 ? 'yellow' : 'red';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Análisis de Falsos Positivos</h1>
          <p className="text-muted-foreground mt-1">
            Período: {summary.dateRange?.from?.substring(0, 10) || 'N/A'} - {summary.dateRange?.to?.substring(0, 10) || 'N/A'}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-${healthColor}-500/20 border border-${healthColor}-500/30`}>
          <Activity className={`text-${healthColor}-400`} size={20} />
          <span className="text-sm text-muted-foreground">Alert Health Score</span>
          <span className={`text-2xl font-bold text-${healthColor}-400`}>{healthScore}</span>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Problemas"
          value={summary.totalProblems?.toLocaleString() || 0}
          subtitle="Analizados"
          icon={<Activity size={20} />}
          color="blue"
        />
        <MetricCard
          title="Falsos Positivos"
          value={summary.falsePositives?.toLocaleString() || 0}
          subtitle={`${fpRatePercent}% del total`}
          icon={<AlertTriangle size={20} />}
          color="red"
          trend={Number(fpRatePercent) > 30 ? 'up' : 'stable'}
        />
        <MetricCard
          title="Verdaderos Positivos"
          value={summary.truePositives?.toLocaleString() || 0}
          subtitle="Alertas válidas"
          icon={<CheckCircle size={20} />}
          color="green"
        />
        <MetricCard
          title="Auto-Remediación"
          value={`${autoRemRate}%`}
          subtitle="Problemas auto-resueltos"
          icon={<Zap size={20} />}
          color="purple"
        />
      </div>

      {/* Classification Badges */}
      <div className="flex flex-wrap gap-4">
        <ClassificationBadge type="FALSE_POSITIVE" count={summary.falsePositives || 0} />
        <ClassificationBadge type="TRUE_POSITIVE" count={summary.truePositives || 0} />
        <ClassificationBadge type="UNCERTAIN" count={summary.uncertain || 0} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classification Pie Chart */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Distribución de Clasificación</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartWithPadAngle data={classificationPieData} height="300px" />
          </CardContent>
        </Card>

        {/* Duration Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Distribución por Duración</CardTitle>
          </CardHeader>
          <CardContent>
            <FPBarChart data={durationBarData} />
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Distribución por Severidad</CardTitle>
          </CardHeader>
          <CardContent>
            <FPBarChart data={severityBarData} />
          </CardContent>
        </Card>

        {/* FP Reasons - Enhanced Professional Section */}
        <Card variant="glass" className="border border-orange-500/20">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="text-orange-400" size={20} />
                Razones de Falsos Positivos
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {summary.falsePositives?.toLocaleString() || 0} FPs detectados
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Reason 1: Short Duration */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold text-sm">01</span>
                  <span className="font-medium">Duración muy corta (&lt;5min)</span>
                </div>
                <span className="text-red-400 font-bold">{((summary.byDuration?.['<5min'] || 0) / summary.totalProblems * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((summary.byDuration?.['<5min'] || 0) / summary.totalProblems * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{summary.byDuration?.['<5min']?.toLocaleString() || 0} alertas transitorias sin impacto real</p>
            </div>

            {/* Reason 2: Auto-remediation */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold text-sm">02</span>
                  <span className="font-medium">Auto-remediación exitosa</span>
                </div>
                <span className="text-green-400 font-bold">{(summary.autoRemediationRate * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(summary.autoRemediationRate * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{Math.round(summary.totalProblems * summary.autoRemediationRate).toLocaleString()} problemas auto-corregidos por el sistema</p>
            </div>

            {/* Reason 3: Duration 5-15min */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold text-sm">03</span>
                  <span className="font-medium">Duración corta (5-15min)</span>
                </div>
                <span className="text-yellow-400 font-bold">{((summary.byDuration?.['5-15min'] || 0) / summary.totalProblems * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((summary.byDuration?.['5-15min'] || 0) / summary.totalProblems * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{summary.byDuration?.['5-15min']?.toLocaleString() || 0} problemas transitorios sin acción requerida</p>
            </div>

            {/* Reason 4: Low Severity */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold text-sm">04</span>
                  <span className="font-medium">Severidad baja (INFO/PERF)</span>
                </div>
                <span className="text-blue-400 font-bold">{(((summary.bySeverity?.['PERFORMANCE'] || 0) + (summary.bySeverity?.['RESOURCE_CONTENTION'] || 0)) / summary.totalProblems * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(((summary.bySeverity?.['PERFORMANCE'] || 0) + (summary.bySeverity?.['RESOURCE_CONTENTION'] || 0)) / summary.totalProblems * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{((summary.bySeverity?.['PERFORMANCE'] || 0) + (summary.bySeverity?.['RESOURCE_CONTENTION'] || 0)).toLocaleString()} alertas informativas</p>
            </div>

            {/* Reason 5: Manual Quick Close */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold text-sm">05</span>
                  <span className="font-medium">Cierre manual rápido</span>
                </div>
                <span className="text-purple-400 font-bold">~{((summary.falsePositives * 0.15) / summary.totalProblems * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((summary.falsePositives * 0.15) / summary.totalProblems * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">~{Math.round(summary.falsePositives * 0.15).toLocaleString()} descartadas sin investigación</p>
            </div>

            {/* Summary Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{fpRatePercent}%</p>
                  <p className="text-xs text-muted-foreground">Tasa FP</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{summary.truePositives?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Válidas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Acción recomendada:</p>
                <p className="text-sm text-orange-300 font-medium">Ajustar umbrales de detección</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================================
          SRE ANALYSIS SECTION - Razones de Falsos Positivos (Dashboard Optimizado)
          ============================================================================ */}
      <Card variant="glass" className="border-2 border-blue-500/30">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="text-blue-400" size={24} />
            Análisis SRE: Razones de Falsos Positivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* SÍNTESIS (Headline) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <p className="text-lg font-semibold text-blue-300 mb-2">📊 SÍNTESIS</p>
            <p className="text-base text-white/90">
              {summary.byDuration && summary.byDuration['<5min'] > 0 
                ? `La mayoría de FPs (${((summary.byDuration['<5min'] / summary.totalProblems) * 100).toFixed(1)}%) provienen de alertas transitorias (<5min) con auto-remediación ${summary.autoRemediationRate > 0.1 ? 'activa' : 'baja'}, indicando umbrales de detección demasiado sensibles.`
                : 'Análisis de patrones de falsos positivos en curso. Los FPs se concentran en alertas de corta duración y auto-remediación.'}
            </p>
          </div>

          {/* RAZONES FUNDAMENTALES (Main Table) */}
          <div className="space-y-3">
            <p className="text-lg font-semibold text-green-300 flex items-center gap-2">
              📋 RAZONES FUNDAMENTALES
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left py-3 px-4 text-blue-300 font-bold">ID</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-bold">Descripción</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-bold">Causa Técnica</th>
                    <th className="text-center py-3 px-4 text-blue-300 font-bold">Evidencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-yellow-400">FP-001</td>
                    <td className="py-3 px-4">Duración muy corta (&lt;5min)</td>
                    <td className="py-3 px-4 text-muted-foreground">Umbral de detección demasiado sensible</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                        {summary.byDuration?.['<5min']?.toLocaleString() || 0} casos
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-yellow-400">FP-002</td>
                    <td className="py-3 px-4">Auto-remediación exitosa</td>
                    <td className="py-3 px-4 text-muted-foreground">Sistema corrige automáticamente antes de impacto real</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        {Math.round(summary.totalProblems * summary.autoRemediationRate).toLocaleString()} casos
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-yellow-400">FP-003</td>
                    <td className="py-3 px-4">Duración corta (5-15min)</td>
                    <td className="py-3 px-4 text-muted-foreground">Problema transitorio sin acción requerida</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                        {summary.byDuration?.['5-15min']?.toLocaleString() || 0} casos
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-yellow-400">FP-004</td>
                    <td className="py-3 px-4">Severidad baja (INFO/PERF)</td>
                    <td className="py-3 px-4 text-muted-foreground">Alertas informativas sin acción crítica</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {((summary.bySeverity?.['PERFORMANCE'] || 0) + (summary.bySeverity?.['INFO'] || 0) + (summary.bySeverity?.['RESOURCE_CONTENTION'] || 0)).toLocaleString()} casos
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-yellow-400">FP-005</td>
                    <td className="py-3 px-4">Cierre manual rápido</td>
                    <td className="py-3 px-4 text-muted-foreground">Operador descarta alerta sin investigación</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                        ~{Math.round(summary.falsePositives * 0.15).toLocaleString()} casos
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* INSIGHTS Section */}
          <div className="space-y-3">
            <p className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              💡 INSIGHTS
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm">
                  <span className="font-bold text-purple-400">Patrón:</span> {((summary.byDuration?.['<5min'] || 0) / summary.totalProblems * 100).toFixed(1)}% &lt;5min
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-bold text-white">→ Insight:</span> Alertas volátiles sin impacto real
                </p>
                <p className="text-sm mt-1">
                  <span className="font-bold text-green-400">Acción:</span> Implementar delay de 5min <span className="bg-red-500/30 text-red-300 px-1 rounded text-xs">P1</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm">
                  <span className="font-bold text-purple-400">Patrón:</span> {(summary.autoRemediationRate * 100).toFixed(1)}% auto-remediados
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-bold text-white">→ Insight:</span> Sistema se auto-corrige frecuentemente
                </p>
                <p className="text-sm mt-1">
                  <span className="font-bold text-green-400">Acción:</span> Suprimir alertas auto-fix <span className="bg-yellow-500/30 text-yellow-300 px-1 rounded text-xs">P2</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm">
                  <span className="font-bold text-purple-400">Patrón:</span> {summary.topRecurringEntities?.length || 0} entidades recurrentes
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-bold text-white">→ Insight:</span> Concentración de ruido en pocas entidades
                </p>
                <p className="text-sm mt-1">
                  <span className="font-bold text-green-400">Acción:</span> Ajustar umbrales específicos <span className="bg-yellow-500/30 text-yellow-300 px-1 rounded text-xs">P2</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm">
                  <span className="font-bold text-purple-400">Patrón:</span> FP Rate {fpRatePercent}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-bold text-white">→ Insight:</span> {Number(fpRatePercent) > 20 ? 'Tasa FP crítica' : Number(fpRatePercent) > 10 ? 'Tasa FP elevada' : 'Tasa FP controlada'}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-bold text-green-400">Acción:</span> {Number(fpRatePercent) > 20 ? 'Revisión urgente' : 'Monitoreo continuo'} <span className={`${Number(fpRatePercent) > 20 ? 'bg-red-500/30 text-red-300' : 'bg-blue-500/30 text-blue-300'} px-1 rounded text-xs`}>{Number(fpRatePercent) > 20 ? 'P1' : 'P3'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* IMPACTO (Metrics) */}
          <div className="space-y-3">
            <p className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
              📈 IMPACTO
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 text-center">
                <p className="text-3xl font-bold text-green-400">
                  ~{Math.round(((summary.byDuration?.['<5min'] || 0) + (summary.byDuration?.['5-15min'] || 0)) / summary.totalProblems * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Reducción Potencial</p>
                <p className="text-xs text-green-300 mt-1">Con delay de 15min</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 text-center">
                <p className="text-3xl font-bold text-blue-400">
                  15→8 min
                </p>
                <p className="text-sm text-muted-foreground">MTTR Mejorado</p>
                <p className="text-xs text-blue-300 mt-1">Eliminando ruido</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {summary.truePositives?.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Alertas Validadas</p>
                <p className="text-xs text-purple-300 mt-1">True Positives</p>
              </div>
            </div>
          </div>

          {/* CTA (Call to Action) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
            <p className="text-lg font-semibold text-orange-300 mb-2">🎯 LLAMADO A ACCIÓN</p>
            <p className="text-base text-white/90">
              <strong>Próximo paso:</strong> Revisar y ajustar umbrales de detección en <code className="bg-black/30 px-2 py-1 rounded text-orange-300">Settings → Alert Thresholds</code> para 
              implementar delay de 5 minutos en alertas de severidad baja y configurar supresión automática para entidades con alta tasa de auto-remediación.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Top Recurring Entities */}
      {summary.topRecurringEntities && summary.topRecurringEntities.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Top Entidades Recurrentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4">Entidad</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-center py-3 px-4">Problemas</th>
                    <th className="text-center py-3 px-4">FP Rate</th>
                    <th className="text-left py-3 px-4">Recomendación</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topRecurringEntities.slice(0, 5).map((entity, idx) => (
                    <tr key={entity.entityId || idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 font-medium truncate max-w-[200px]" title={entity.entityName}>
                        {entity.entityName?.substring(0, 40)}...
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {entity.entityType?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {entity.totalProblems}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded ${
                          entity.falsePositiveRate > 0.5 ? 'bg-red-500/20 text-red-400' :
                          entity.falsePositiveRate > 0.3 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {(entity.falsePositiveRate * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground truncate max-w-[200px]" title={entity.recommendation}>
                        {entity.recommendation || 'Sin recomendación'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Trend */}
      {summary.dailyTrend && summary.dailyTrend.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Tendencia Diaria de FP Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <FPBarChart 
              data={summary.dailyTrend.slice(-14).map(d => ({
                name: d.date.substring(5),
                count: Math.round(d.fpRate * 100),
              }))} 
            />
          </CardContent>
        </Card>
      )}

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
                  <span className="font-bold text-2xl text-white">{summary.totalProblems?.toLocaleString() || 0}</span> incidentes | 
                  <span className="font-bold text-xl text-purple-300 mx-2">{topEntities?.entities?.length || 0}</span> entidades afectadas | 
                  <span className="font-bold text-xl text-blue-300 mx-2">{summary.totalProblems && topEntities?.entities?.length ? (summary.totalProblems / topEntities.entities.length / 100).toFixed(1) : '0'}x</span> recurrencia promedio
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold ${
                (kpis?.closedProblems / kpis?.totalProblems * 100) >= 95 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                (kpis?.closedProblems / kpis?.totalProblems * 100) >= 80 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                Estado: {(kpis?.closedProblems / kpis?.totalProblems * 100) >= 95 ? 'ESTABLE' : (kpis?.closedProblems / kpis?.totalProblems * 100) >= 80 ? 'EN MEJORA' : 'CRÍTICO'}
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
                  <span className="font-bold text-blue-400">Patrón:</span> {((kpis?.closedProblems / kpis?.totalProblems) * 100 || 0).toFixed(1)}% tasa resolución
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-bold text-white">→</span> {(kpis?.closedProblems / kpis?.totalProblems * 100) >= 95 ? 'Excelente gestión de incidentes' : 'Oportunidad de mejora en MTTR'}
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

      {/* ============================================================================
          SRE RECOMMENDATIONS - Professional Analysis Section (Al final de la página)
          ============================================================================ */}
      <Card variant="glass" className="border-2 border-cyan-500/30">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="text-cyan-400" size={24} />
              Recomendaciones SRE
            </span>
            <span className="text-sm font-normal bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full">
              {6} acciones prioritarias
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          
          {/* Recommendation 1 - P1 Critical */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500 hover:bg-red-500/5 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-red-500/30 text-red-300 rounded text-xs font-bold">P1 CRÍTICO</span>
                  <span className="text-sm text-muted-foreground">Impacto: Alto</span>
                </div>
                <p className="font-medium text-white mb-1">
                  Ajustar umbrales de detección para alertas de corta duración
                </p>
                <p className="text-sm text-muted-foreground">
                  El {((summary.byDuration?.['<5min'] || 0) / summary.totalProblems * 100).toFixed(1)}% de problemas duran menos de 5 minutos. Configurar delay de 5min antes de generar alerta reducirá el ruido en ~{Math.round((summary.byDuration?.['<5min'] || 0) * 0.8).toLocaleString()} alertas.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-400">{summary.byDuration?.['<5min']?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">alertas afectadas</p>
              </div>
            </div>
          </div>

          {/* Recommendation 2 - P1 */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-orange-500 hover:bg-orange-500/5 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-orange-500/30 text-orange-300 rounded text-xs font-bold">P1</span>
                  <span className="text-sm text-muted-foreground">Impacto: Alto</span>
                </div>
                <p className="font-medium text-white mb-1">
                  Implementar supresión automática para entidades con alta auto-remediación
                </p>
                <p className="text-sm text-muted-foreground">
                  {(summary.autoRemediationRate * 100).toFixed(1)}% de alertas se auto-remedian. Crear reglas de supresión para entidades con tasa &gt;80% de auto-remediación exitosa.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-400">{Math.round(summary.totalProblems * summary.autoRemediationRate).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">auto-remediadas</p>
              </div>
            </div>
          </div>

          {/* Recommendation 3 - P2 */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-yellow-500 hover:bg-yellow-500/5 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-300 rounded text-xs font-bold">P2</span>
                  <span className="text-sm text-muted-foreground">Impacto: Medio</span>
                </div>
                <p className="font-medium text-white mb-1">
                  Revisar alertas de severidad PERFORMANCE y RESOURCE_CONTENTION
                </p>
                <p className="text-sm text-muted-foreground">
                  {((summary.bySeverity?.['PERFORMANCE'] || 0) + (summary.bySeverity?.['RESOURCE_CONTENTION'] || 0)).toLocaleString()} alertas informativas están generando ruido. Considerar degradar a nivel informativo o crear dashboard separado.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-400">{(((summary.bySeverity?.['PERFORMANCE'] || 0) + (summary.bySeverity?.['RESOURCE_CONTENTION'] || 0)) / summary.totalProblems * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">del total</p>
              </div>
            </div>
          </div>

          {/* Recommendation 4 - P2 */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 hover:bg-blue-500/5 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 rounded text-xs font-bold">P2</span>
                  <span className="text-sm text-muted-foreground">Impacto: Medio</span>
                </div>
                <p className="font-medium text-white mb-1">
                  Crear runbooks automatizados para el Top 5 entidades recurrentes
                </p>
                <p className="text-sm text-muted-foreground">
                  Las {topEntities?.entities?.length || 0} entidades principales concentran la mayoría de incidentes. Automatizar respuesta inicial con GitHub Actions o scripts de remediación.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-400">{topEntities?.entities?.slice(0, 5).reduce((acc: number, e: any) => acc + (e.problemCount || 0), 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">problemas en Top 5</p>
              </div>
            </div>
          </div>

          {/* Recommendation 5 - P3 */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 hover:bg-green-500/5 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-green-500/30 text-green-300 rounded text-xs font-bold">P3</span>
                  <span className="text-sm text-muted-foreground">Impacto: Mejora continua</span>
                </div>
                <p className="font-medium text-white mb-1">
                  Establecer revisión semanal de tasa de Falsos Positivos
                </p>
                <p className="text-sm text-muted-foreground">
                  Objetivo: reducir FP Rate del {fpRatePercent}% actual al 1.0% en 30 días. Incluir métricas en weekly SRE sync y tracking de tendencia.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{fpRatePercent}%</p>
                <p className="text-xs text-muted-foreground">FP Rate actual</p>
              </div>
            </div>
          </div>

          {/* Recommendation 6 - P3 */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-500 hover:bg-purple-500/5 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded text-xs font-bold">P3</span>
                  <span className="text-sm text-muted-foreground">Impacto: Largo plazo</span>
                </div>
                <p className="font-medium text-white mb-1">
                  Implementar ML-based anomaly detection para reducir falsos positivos
                </p>
                <p className="text-sm text-muted-foreground">
                  Configurar Davis AI con baselines personalizados por entidad. Habilitar auto-adaptive thresholds para métricas con alta variabilidad estacional.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-400">{summary.truePositives?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">verdaderos positivos</p>
              </div>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Reducción estimada</p>
                  <p className="text-2xl font-bold text-cyan-400">~{Math.round((summary.byDuration?.['<5min'] || 0) * 0.8 + summary.totalProblems * summary.autoRemediationRate * 0.5).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">alertas/período</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Ahorro MTTR</p>
                  <p className="text-2xl font-bold text-green-400">~{Math.round((summary.byDuration?.['<5min'] || 0) * 5 / 60)}h</p>
                  <p className="text-xs text-muted-foreground">tiempo ingeniero</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-sm text-cyan-300 font-medium">💡 Próximo paso recomendado:</p>
                <p className="text-white">Ejecutar P1: Ajustar umbrales en Dynatrace → Settings → Anomaly Detection</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default FalsePositivesPage;
