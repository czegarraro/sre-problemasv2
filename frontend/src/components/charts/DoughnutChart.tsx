/**
 * Doughnut Chart Component
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface DoughnutChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: string;
  colors?: string[];
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ 
  data, 
  title, 
  height = '300px',
  colors 
}) => {
  const option = useMemo(() => {
    // Default colors matching the images
    const defaultColors = [
      '#5470c6', // Blue
      '#91cc75', // Green
      '#fac858', // Yellow
      '#ee6666', // Red
      '#73c0de', // Light Blue
      '#3ba272', // Dark Green
      '#fc8452', // Orange
      '#9a60b4', // Purple
      '#ea7ccc', // Pink
    ];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f8fafc' },
        formatter: '{b}: <strong>{c}</strong> ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        top: '0%',
        left: 'center',
        textStyle: {
          color: '#94a3b8',
          fontSize: 12,
        },
        itemWidth: 14,
        itemHeight: 14,
      },
      color: colors || defaultColors,
      series: [
        {
          name: title || 'Distribution',
          type: 'pie',
          radius: ['50%', '75%'], // Inner and outer radius for doughnut
          center: ['50%', '60%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#0f172a',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
              color: '#f8fafc',
              formatter: '{d}%',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map(item => ({
            name: item.name,
            value: item.value,
          })),
        },
      ],
    };
  }, [data, title, colors]);

  return <ReactECharts option={option} style={{ height }} />;
};

export default DoughnutChart;
