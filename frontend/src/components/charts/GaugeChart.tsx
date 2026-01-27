/**
 * Gauge Chart Component (Problem Status)
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface GaugeChartProps {
  value: number;
  title?: string;
  height?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, title = 'Closed Problems', height = '300px' }) => {
  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 10,
          itemStyle: {
            color: value >= 90 ? '#10b981' : value >= 70 ? '#eab308' : '#ef4444',
          },
          progress: {
            show: true,
            width: 18,
          },
          pointer: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              width: 18,
              color: [[1, '#1e293b']],
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: '#f8fafc',
            fontSize: 32,
            offsetCenter: [0, '0%'],
          },
          title: {
            show: true,
            offsetCenter: [0, '80%'],
            color: '#94a3b8',
            fontSize: 14,
          },
          data: [{ value, name: title }],
        },
      ],
    };
  }, [value, title]);

  return <ReactECharts option={option} style={{ height }} />;
};

export default GaugeChart;
