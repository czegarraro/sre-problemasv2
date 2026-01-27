import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';

interface EntityTagData {
  tagName: string;
  count: number;
  percentage: string;
  isPrefix?: boolean;
}

interface TopEntityTagsResponse {
  totalProblems: number;
  topEntityTags: EntityTagData[];
  summary: {
    uniqueTags: number;
    uniquePrefixes: number;
    averageProblemsPerTag: string;
  };
}

const TopEntityTagsChart: React.FC = () => {
  const [data, setData] = useState<TopEntityTagsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('bar');

  useEffect(() => {
    fetchTopEntityTags();
  }, []);

  const fetchTopEntityTags = async () => {
    try {
      console.log('🔄 Fetching top entity tags...');
      setLoading(true);
      
      const response = await fetch('/api/v1/analytics/top-entity-tags');
      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      console.log('📦 Response data:', result);
      
      if (result.success) {
        console.log('✅ Setting data:', result.data);
        setData(result.data);
      } else {
        console.error('❌ API error:', result);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPieChartOption = () => ({
    title: {
      text: 'TOP EntityTags Distribution',
      left: 'center',
      textStyle: { color: '#fff', fontSize: 16 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#fff' }
    },
    series: [
      {
        name: 'EntityTags',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#1e293b',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        labelLine: {
          show: false
        },
        data: data?.topEntityTags.map(tag => ({
          value: tag.count,
          name: `${tag.tagName} (${tag.percentage}%)`
        })) || []
      }
    ],
    backgroundColor: 'transparent'
  });

  const getBarChartOption = () => ({
    title: {
      text: 'TOP EntityTags - Frequency Analysis',
      left: 'center',
      textStyle: { color: '#fff', fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>Count: ${data.value}<br/>Percentage: ${data.data.percentage}%`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data?.topEntityTags.map(tag => tag.tagName) || [],
      axisLabel: {
        color: '#94a3b8',
        rotate: 45,
        fontSize: 10
      },
      axisLine: {
        lineStyle: { color: '#334155' }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1e293b' } }
    },
    series: [
      {
        name: 'Count',
        type: 'bar',
        data: data?.topEntityTags.map(tag => ({
          value: tag.count,
          percentage: tag.percentage,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' }
            ])
          }
        })) || [],
        itemStyle: {
          borderRadius: [8, 8, 0, 0]
        }
      }
    ],
    backgroundColor: 'transparent'
  });

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">TOP EntityTags Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading EntityTags data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-white">TOP EntityTags Analysis</CardTitle>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'bar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'pie' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Pie
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Total Problems</div>
                <div className="text-2xl font-bold text-white">{data.totalProblems}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Unique Prefixes</div>
                <div className="text-2xl font-bold text-blue-400">{data.summary.uniquePrefixes || 0}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Avg Problems/Tag</div>
                <div className="text-2xl font-bold text-green-400">{data.summary.averageProblemsPerTag}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              <ReactECharts 
                option={chartType === 'pie' ? getPieChartOption() : getBarChartOption()}
                style={{ height: '100%', width: '100%' }}
              />
            </div>

            {/* Top Tags Table */}
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-3">Top EntityTags Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-3 text-slate-400">Rank</th>
                      <th className="text-left py-2 px-3 text-slate-400">Tag Name</th>
                      <th className="text-right py-2 px-3 text-slate-400">Count</th>
                      <th className="text-right py-2 px-3 text-slate-400">Percentage</th>
                      <th className="text-right py-2 px-3 text-slate-400">Problems/Tag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topEntityTags.map((tag, index) => (
                      <tr key={tag.tagName} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                        <td className="py-2 px-3 text-slate-300 font-medium">#{index + 1}</td>
                        <td className="py-2 px-3 text-white font-mono text-xs max-w-xs truncate" title={tag.tagName}>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-2 ${
                            tag.isPrefix ? 'bg-purple-900 text-purple-300' : 'bg-slate-600 text-slate-300'
                          }`}>
                            {tag.isPrefix ? '🏷️' : '📋'}
                          </span>
                          {tag.tagName}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                            {tag.count}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            parseFloat(tag.percentage) > 10 ? 'bg-red-900 text-red-300' :
                            parseFloat(tag.percentage) > 5 ? 'bg-orange-900 text-orange-300' :
                            'bg-green-900 text-green-300'
                          }`}>
                            {tag.percentage}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          {(data.totalProblems / data.topEntityTags.length).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Summary Statistics */}
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-slate-400">Total Problems Analyzed</div>
                    <div className="text-xl font-bold text-white">{data.totalProblems}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">Problems with Tags</div>
                    <div className="text-xl font-bold text-blue-400">{data.summary.uniqueTags > 0 ? data.topEntityTags.reduce((sum, tag) => sum + tag.count, 0) : 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">Coverage Rate</div>
                    <div className="text-xl font-bold text-green-400">
                      {data.summary.uniqueTags > 0 ? 
                        ((data.topEntityTags.reduce((sum, tag) => sum + tag.count, 0) / data.totalProblems) * 100).toFixed(1) 
                        : '0.0'}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TopEntityTagsChart;
