/**
 * Time Series Bar Chart Component
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface TimeSeriesBarChartProps {
  data: Array<{
    timestamp: string;
    [key: string]: any; // Accommodate different value keys like 'count' or 'avgResolutionTime'
  }>;
  valueKey: string;
  seriesName: string;
  height?: string;
}

const TimeSeriesBarChart: React.FC<TimeSeriesBarChartProps> = ({ 
  data, 
  valueKey, 
  seriesName,
  height = '400px' 
}) => {
  const option = useMemo(() => {
    const timestamps = data.map(d => d.timestamp);
    const values = data.map(d => d[valueKey] || 0);

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
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: timestamps,
          axisTick: { alignWithLabel: true },
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8' },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#1e293b' } },
        },
      ],
      series: [
        {
          name: seriesName,
          type: 'bar',
          barWidth: '60%',
          data: values,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#8b5cf6' }, // a brighter color
                { offset: 1, color: '#3b82f6' }, // a base color
              ],
            },
          },
        },
      ],
    };
  }, [data, valueKey, seriesName]);

  return <ReactECharts option={option} style={{ height }} />;
};

export default TimeSeriesBarChart;
