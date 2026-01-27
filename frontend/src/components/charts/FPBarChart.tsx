/**
 * Simple Bar Chart Component for False Positives
 * Generic version that accepts {name, count} data
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface FPBarChartProps {
  data: Array<{ name: string; count: number }>;
  height?: string;
  color?: string;
  horizontal?: boolean;
}

const FPBarChart: React.FC<FPBarChartProps> = ({ 
  data, 
  height = '300px', 
  color = '#3b82f6',
  horizontal = false 
}) => {
  const option = useMemo(() => {
    const xAxisConfig = horizontal
      ? { type: 'value' as const, axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } }
      : { type: 'category' as const, data: data.map(d => d.name), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94a3b8', rotate: 45, fontSize: 10 } };

    const yAxisConfig = horizontal
      ? { type: 'category' as const, data: data.map(d => d.name), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94a3b8', fontSize: 10 } }
      : { type: 'value' as const, axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } };

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
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: xAxisConfig,
      yAxis: yAxisConfig,
      series: [
        {
          name: 'Cantidad',
          type: 'bar',
          data: data.map(d => d.count),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: horizontal ? 1 : 0,
              y2: horizontal ? 0 : 1,
              colorStops: [
                { offset: 0, color: color },
                { offset: 1, color: adjustColor(color, 40) },
              ],
            },
            borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: horizontal ? 'right' : 'top',
            color: '#94a3b8',
            fontSize: 10,
          },
        },
      ],
    };
  }, [data, color, horizontal]);

  return <ReactECharts option={option} style={{ height }} />;
};

// Helper to lighten/darken a color
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

export default FPBarChart;
