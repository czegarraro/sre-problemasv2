/**
 * Pie Chart with padAngle Component
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface PieChartWithPadAngleProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: string;
}

const PieChartWithPadAngle: React.FC<PieChartWithPadAngleProps> = ({ data, title, height = '400px' }) => {
  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      title: title ? {
        text: title,
        left: 'center',
        textStyle: { color: '#f8fafc', fontSize: 16 },
      } : undefined,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f8fafc' },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'center',
        textStyle: { color: '#94a3b8' },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: true,
          padAngle: 5, // Add padding between slices
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0f172a',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{d}%',
            color: '#f8fafc',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          data,
        },
      ],
    };
  }, [data, title]);

  return <ReactECharts option={option} style={{ height }} />;
};

export default PieChartWithPadAngle;
