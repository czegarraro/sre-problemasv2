/**
 * Treemap Chart Component (Management Zones)
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface TreemapChartProps {
  data: Array<{ name: string; problemCount: number; avgSeverity: number }>;
  height?: string;
}

const TreemapChart: React.FC<TreemapChartProps> = ({ data, height = '400px' }) => {
  const option = useMemo(() => {
    const treeData = data.map(zone => ({
      name: zone.name,
      value: zone.problemCount,
      itemStyle: {
        color: zone.avgSeverity >= 4 ? '#ef4444' : zone.avgSeverity >= 3 ? '#f59e0b' : '#3b82f6',
      },
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (params: any) => {
          const zone = data.find(z => z.name === params.name);
          return `${params.name}<br/>Problems: <strong>${params.value}</strong><br/>Avg Severity: <strong>${zone?.avgSeverity.toFixed(2)}</strong>`;
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#f8fafc' },
      },
      series: [
        {
          type: 'treemap',
          data: treeData,
          roam: false,
          label: {
            show: true,
            formatter: '{b}\n{c}',
            color: '#fff',
          },
          itemStyle: {
            borderColor: '#0f172a',
            borderWidth: 2,
            gapWidth: 2,
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 5,
              },
            },
            {
              itemStyle: {
                gapWidth: 1,
              },
            },
          ],
        },
      ],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height }} />;
};

export default TreemapChart;
