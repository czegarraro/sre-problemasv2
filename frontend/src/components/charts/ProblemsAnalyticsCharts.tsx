import React, { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api/analytics.api';
import { useFiltersStore } from '@/store/filtersStore';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import BarChart from '@/components/charts/BarChart';
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
        const [

          squadDistRes,
          tribeDistRes,
          cloudAppDistRes
        ] = await Promise.all([

          analyticsApi.getSquadDistribution(filters),
          analyticsApi.getTribeDistribution(filters),
          analyticsApi.getCloudAppDistribution(filters)
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

  // Formatting helpers for BarCharts
  const formatForBarChart = (data: any[]) => {
    if (!data) return [];
    return data.slice(0, 10).map((d: any) => ({
      name: d.name,
      type: 'N/A', // type property not strictly used structurally aside from interface match
      problemCount: d.value
    })).reverse(); // Reverse to have the highest at the top in Echarts Bar
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      
      {/* Cloud App Distribution (Bar Chart) */}
      <Card variant="glass" className="h-full">
        <CardHeader className="py-3">
          <CardTitle className="text-sm text-center">Top 10 Cloud Applications</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {cloudAppDistribution && (
            <BarChart 
              data={formatForBarChart(cloudAppDistribution.data)} 
              height="350px"
            />
          )}
        </CardContent>
      </Card>

      {/* Squad Distribution (Bar Chart) */}
      <Card variant="glass" className="h-full">
        <CardHeader className="py-3">
          <CardTitle className="text-sm text-center">Top 10 Squads (Problemas)</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {squadDistribution && (
            <BarChart 
              data={formatForBarChart(squadDistribution.data)} 
              height="350px"
            />
          )}
        </CardContent>
      </Card>

      {/* Tribe Distribution (Bar Chart) */}
      <Card variant="glass" className="h-full">
        <CardHeader className="py-3">
          <CardTitle className="text-sm text-center">Top 10 Tribus (Problemas)</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {tribeDistribution && (
            <BarChart 
              data={formatForBarChart(tribeDistribution.data)} 
              height="350px"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProblemsAnalyticsCharts;
