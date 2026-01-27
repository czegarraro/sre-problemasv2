/**
 * Time Series Chart Component
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { getSeverityColor } from '@/lib/utils/color.utils';
import { SEVERITY_LEVELS } from '@/lib/constants';

interface TimeSeriesChartProps {
  data: Array<{
    timestamp: string;
    severityBreakdown: Record<string, number>;
  }>;
  height?: string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, height = '400px' }) => {
  const option = useMemo(() => {
    const timestamps = data.map(d => d.timestamp);
    const series = SEVERITY_LEVELS.map(severity => ({
      name: severity,
      type: 'line',
      stack: 'total',
      areaStyle: {},
      emphasis: { focus: 'series' },
      data: data.map(d => d.severityBreakdown[severity] || 0),
      itemStyle: { color: getSeverityColor(severity) },
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f8fafc' },
      },
      legend: {
        data: SEVERITY_LEVELS,
        top: 10,
        textStyle: { color: '#94a3b8' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: { backgroundColor: '#0f172a' },
          dataZoom: {},
          restore: {},
        },
        iconStyle: { borderColor: '#94a3b8' },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timestamps,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#1e293b' } },
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          type: 'slider',
          start: 0,
          end: 100,
          backgroundColor: '#1e293b',
          fillerColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#334155',
          textStyle: { color: '#94a3b8' },
        },
      ],
      series,
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height }} />;
};

export default TimeSeriesChart;
