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

    const total = data.reduce((sum, item) => sum + item.value, 0);

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
          fontSize: 11,
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 8,
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '55%',
          style: {
            text: total.toLocaleString(),
            textAlign: 'center',
            fill: '#f8fafc',
            fontSize: 22,
            fontWeight: 'bold',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '63%',
          style: {
            text: 'total',
            textAlign: 'center',
            fill: '#64748b',
            fontSize: 11,
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
      ],
      color: colors || defaultColors,
      series: [
        {
          name: title || 'Distribution',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '60%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#0f172a',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
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
