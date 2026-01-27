/**
 * Bar Chart Component (Top Entities)
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface BarChartProps {
  data: Array<{ name: string; type: string; problemCount: number }>;
  height?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, height = '400px' }) => {
  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f8fafc' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#1e293b' } },
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
      },
      series: [
        {
          name: 'Problems',
          type: 'bar',
          data: data.map(d => d.problemCount),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#8b5cf6' },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            color: '#f8fafc',
          },
        },
      ],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height }} />;
};

export default BarChart;
