import React, { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api/analytics.api';
import { useFiltersStore } from '@/store/filtersStore';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import BarChart from '@/components/charts/BarChart';
import DoughnutChart from '@/components/charts/DoughnutChart';
import Spinner from '@/components/ui/Spinner';

const ProblemsAnalyticsCharts: React.FC = () => {
  const { filters } = useFiltersStore();

  const [squadDistribution, setSquadDistribution] = useState<any>(null);
  const [tribeDistribution, setTribeDistribution] = useState<any>(null);
  const [cloudAppDistribution, setCloudAppDistribution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChartsData = async () => {
      try {
        setIsLoading(true);
        const [squadDistRes, tribeDistRes, cloudAppDistRes] = await Promise.all([
          analyticsApi.getSquadDistribution(filters),
          analyticsApi.getTribeDistribution(filters),
          analyticsApi.getCloudAppDistribution(filters),
        ]);
        setSquadDistribution(squadDistRes);
        setTribeDistribution(tribeDistRes);
        setCloudAppDistribution(cloudAppDistRes);
      } catch (error) {
        console.error('Failed to fetch analytics charts data for Problems view:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartsData();
  }, [filters]);

  if (isLoading && !squadDistribution) {
    return (
      <div className="flex items-center justify-center p-8 bg-white/5 rounded-xl border border-white/10 mb-6">
        <Spinner size="md" />
      </div>
    );
  }

  // Format for horizontal bar chart (Top 10, reversed for ECharts)
  const formatForBarChart = (data: any[]) => {
    if (!data) return [];
    return data
      .slice(0, 10)
      .map((d: any) => ({
        name: d.name,
        type: 'N/A',
        problemCount: d.value,
      }))
      .reverse();
  };

  // Curated color palette for donuts (vibrant, accessible, premium feel)
  const donutColors = [
    '#6366f1', // Indigo
    '#22d3ee', // Cyan
    '#a78bfa', // Violet
    '#f472b6', // Pink
    '#34d399', // Emerald
    '#fbbf24', // Amber
    '#fb923c', // Orange
    '#60a5fa', // Blue
    '#c084fc', // Purple
    '#f87171', // Red
    '#2dd4bf', // Teal
    '#e879f9', // Fuchsia
    '#38bdf8', // Sky
    '#4ade80', // Green
    '#facc15', // Yellow
  ];

  return (
    <div className="space-y-5 mb-6">
      {/* ── ROW 1: Horizontal Bar Charts (Cantidades) ── */}
      <div>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          📊 Top 10 — Cantidad de Problemas
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cloud App */}
          <Card variant="glass" className="h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-center">Cloud Applications</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {cloudAppDistribution && (
                <BarChart data={formatForBarChart(cloudAppDistribution.data)} height="320px" />
              )}
            </CardContent>
          </Card>

          {/* Squad */}
          <Card variant="glass" className="h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-center">Squads</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {squadDistribution && (
                <BarChart data={formatForBarChart(squadDistribution.data)} height="320px" />
              )}
            </CardContent>
          </Card>

          {/* Tribu */}
          <Card variant="glass" className="h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-center">Tribus</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {tribeDistribution && (
                <BarChart data={formatForBarChart(tribeDistribution.data)} height="320px" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── ROW 2: Doughnut Charts (Porcentajes) ── */}
      <div>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{
            background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🍩 Distribución Porcentual
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cloud App Donut */}
          <Card variant="glass" className="h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-center">Distribución por Cloud App</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {cloudAppDistribution && (
                <DoughnutChart
                  data={cloudAppDistribution.data}
                  title="Cloud App"
                  height="320px"
                  colors={donutColors}
                />
              )}
            </CardContent>
          </Card>

          {/* Squad Donut */}
          <Card variant="glass" className="h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-center">Distribución por Squad</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {squadDistribution && (
                <DoughnutChart
                  data={squadDistribution.data}
                  title="Squad"
                  height="320px"
                  colors={donutColors}
                />
              )}
            </CardContent>
          </Card>

          {/* Tribu Donut */}
          <Card variant="glass" className="h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-center">Distribución por Tribu</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {tribeDistribution && (
                <DoughnutChart
                  data={tribeDistribution.data}
                  title="Tribu"
                  height="320px"
                  colors={donutColors}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProblemsAnalyticsCharts;
