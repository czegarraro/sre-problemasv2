/**
 * Funnel Chart Component (Remediation Pipeline)
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface FunnelChartProps {
  data: Array<{ name: string; count: number; percentage: number }>;
  height?: string;
}

const FunnelChart: React.FC<FunnelChartProps> = ({ data, height = '500px' }) => {
  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: <strong>{c}</strong> ({d}%)',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f8fafc' },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: '#94a3b8' },
      },
      series: [
        {
          name: 'Remediation Funnel',
          type: 'funnel',
          left: '20%',
          top: 60,
          bottom: 60,
          width: '60%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}: {c}',
            color: '#fff',
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid',
            },
          },
          itemStyle: {
            borderColor: '#0f172a',
            borderWidth: 1,
          },
          emphasis: {
            label: {
              fontSize: 16,
            },
          },
          data: data.map((item, index) => ({
            value: item.count,
            name: item.name,
            itemStyle: {
              color: ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981'][index],
            },
          })),
        },
      ],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height }} />;
};

export default FunnelChart;
