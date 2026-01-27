/**
 * Heatmap Chart Component (Impact vs Severity Matrix)
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { IMPACT_LEVELS, SEVERITY_LEVELS } from '@/lib/constants';

interface HeatmapChartProps {
  matrix: Record<string, Record<string, number>>;
  height?: string;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ matrix, height = '400px' }) => {
  const option = useMemo(() => {
    const data: Array<[number, number, number]> = [];
    
    IMPACT_LEVELS.forEach((impact, i) => {
      SEVERITY_LEVELS.forEach((severity, j) => {
        const value = matrix[impact]?.[severity] || 0;
        data.push([i, j, value]);
      });
    });

    const maxValue = Math.max(...data.map(d => d[2]));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f8fafc' },
        formatter: (params: any) => {
          const impact = IMPACT_LEVELS[params.data[0]];
          const severity = SEVERITY_LEVELS[params.data[1]];
          return `${impact}<br/>${severity}: <strong>${params.data[2]}</strong> problems`;
        },
      },
      grid: {
        left: '20%',
        right: '5%',
        bottom: '20%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: IMPACT_LEVELS,
        splitArea: { show: true },
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { 
          color: '#e2e8f0', 
          rotate: 45,
          fontSize: 12,
          fontWeight: 'bold',
          margin: 10,
        },
      },
      yAxis: {
        type: 'category',
        data: SEVERITY_LEVELS,
        splitArea: { show: true },
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { 
          color: '#e2e8f0',
          fontSize: 12,
          fontWeight: 'bold',
          margin: 10,
        },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#1e293b', '#3b82f6', '#ef4444'],
        },
        textStyle: { color: '#94a3b8' },
      },
      series: [
        {
          name: 'Problems',
          type: 'heatmap',
          data,
          label: {
            show: true,
            color: '#f8fafc',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }, [matrix]);

  return <ReactECharts option={option} style={{ height }} />;
};

export default HeatmapChart;
