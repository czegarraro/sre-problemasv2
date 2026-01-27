import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { downtimeApi, DowntimeStats, MonthlySummary } from '../../lib/api/downtime.api';
import { es } from 'date-fns/locale';
import { endOfMonth, parseISO, format } from 'date-fns';

const SEVERITY_COLORS: Record<string, string> = {
  'AVAILABILITY': '#d63031',
  'ERROR': '#e17055',
  'PERFORMANCE': '#fdcb6e',
  'RESOURCE_CONTENTION': '#74b9ff',
  'CUSTOM_ALERT': '#a29bfe',
  'UNKNOWN': '#95a5a6'
};

export const DowntimeDashboard: React.FC = () => {
  const [data, setData] = useState<DowntimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ 
    start: '2025-01-01', 
    end: format(new Date(), 'yyyy-MM-dd') 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Using a wide range to capture all relevant data as requested
        // In a real app, these could be controlled by a date picker
        const startDate = '2025-01-01';
        const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd'); // Current month end
        
        setDateRange({ start: startDate, end: endDate });

        console.log(`🔍 Fetching downtime data from DB (${startDate} to ${endDate})...`);
        
        const stats = await downtimeApi.getDowntimeStats(startDate, endDate);
        console.log('📊 Real DB data received:', stats);
        
        setData(stats);
        
      } catch (err) {
        console.error('❌ Error loading downtime data:', err);
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-blue-400 font-medium flex items-center gap-2">
            <span className="animate-spin">⏳</span> Cargando datos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            Error: {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">No hay datos disponibles</div>
      </div>
    );
  }

  // Dynamic Chart Title
  const chartTitle = `Distribución por Indisponibilidad`;

  // Donut Chart Options - Monthly Distribution
  const donutChartOptions = {
    title: {
      text: chartTitle,
      left: 'center',
      top: 20,
      textStyle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `<div class="font-bold border-b border-gray-600 pb-1 mb-1">${params.name}</div>
                <div>Problemas: ${params.data.problemCount}</div>
                <div>Horas: ${params.value.toLocaleString()} h</div>
                <div class="text-xs text-gray-400 mt-1">(${params.percent}%)</div>`;
      },
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: {
        color: '#ccc'
      },
      formatter: (name: string) => {
         return name.length > 15 ? name.substring(0, 15) + '...' : name;
      }
    },
    series: [
      {
        name: 'Indisponibilidad',
        type: 'pie',
        radius: ['45%', '75%'], // Thinner donut
        center: ['40%', '50%'], // Moved slightly left to accommodate legend
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#1a1a2e',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff',
            formatter: '{b}\n{c} h'
          },
          itemStyle: {
             shadowBlur: 10,
             shadowOffsetX: 0,
             shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: data.monthlySummary.map((month: MonthlySummary, index: number) => {
          // Dynamic month name generation
          let monthName = month.month;
          try {
             // Parse YYYY-MM to Date object to format
             const date = parseISO(`${month.month}-01`);
             monthName = format(date, 'MMMM yyyy', { locale: es });
             // Capitalize first letter
             monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
          } catch (e) {
             console.warn('Error formatting date:', month.month);
          }
          
          // Enhanced color palette
          const colors = [
              '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', 
              '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'
          ];
          
          return {
            name: monthName,
            value: month.hours,
            problemCount: month.problems, // Custom data for tooltip
            itemStyle: { color: colors[index % colors.length] }
          };
        })
      }
    ]
  };

  // Calculate trend
  const getTrend = () => {
    if (data.monthlySummary.length < 2) return 'Estable';
    const lastMonth = data.monthlySummary[data.monthlySummary.length - 1];
    const prevMonth = data.monthlySummary[data.monthlySummary.length - 2];
    const change = lastMonth.downtimePercent - prevMonth.downtimePercent;
    
    if (change < -0.01) return 'Mejorando 📉';
    if (change > 0.01) return 'Empeorando 📈';
    return 'Estable';
  };

  return (
    <div className="p-6 space-y-6 bg-[#0f0f23] min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          📊 Dashboard de Indisponibilidad Real
        </h1>
        <p className="text-gray-400">
           {format(parseISO(dateRange.start), 'MMMM yyyy', { locale: es })} - {format(parseISO(dateRange.end), 'MMMM yyyy', { locale: es })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Problemas Reales</div>
          <div className="text-3xl font-bold text-blue-400">{data.totalProblems}</div>
        </div>
        <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Horas Downtime</div>
          <div className="text-3xl font-bold text-blue-400">{data.totalHours.toFixed(2)} h</div>
        </div>
        <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Downtime Global</div>
          <div className="text-3xl font-bold text-blue-400">{data.downtimePercent.toFixed(3)}%</div>
        </div>
        <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Tendencia</div>
          <div className="text-2xl font-bold text-blue-400">{getTrend()}</div>
        </div>
      </div>

      {/* Donut Chart and Monthly Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
          <ReactECharts option={donutChartOptions} style={{ height: '400px' }} />
        </div>

        {/* Monthly Summary */}
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-xl font-bold text-white mb-4 sticky top-0 bg-[#0f0f23] py-2 z-10">Resumen Mensual</h2>
          {data.monthlySummary.map((month: MonthlySummary) => {
            let monthName = month.month;
            try {
               const date = parseISO(`${month.month}-01`);
               monthName = format(date, 'MMMM yyyy', { locale: es });
               monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            } catch (e) {}
            
            return (
              <div key={month.month} className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">{monthName}</h3>
                  <span className="text-sm text-gray-400">
                    {month.problems} problemas | {month.hours.toFixed(2)} h | {month.downtimePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(month.bySeverity).map(([severity, stats]) => (
                    <div key={severity} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: SEVERITY_COLORS[severity] || '#95a5a6' }}
                      />
                      <span className="text-gray-300">
                        {severity}: {stats.hours.toFixed(1)}h ({stats.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 10 Problems Table */}
      <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Top 10 Problemas Más Largos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">#</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Problema</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Servicio</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Severidad</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Fecha</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Horas</th>
              </tr>
            </thead>
            <tbody>
              {data.topProblems.map((problem, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-[#252542]">
                  <td className="py-3 px-4 text-gray-300">{index + 1}</td>
                  <td className="py-3 px-4 text-blue-400 font-mono text-xs">{problem.displayId}</td>
                  <td className="py-3 px-4 text-white max-w-md truncate">{problem.title}</td>
                  <td className="py-3 px-4 text-gray-300">{problem.affectedService}</td>
                  <td className="py-3 px-4">
                    <span 
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{ 
                        backgroundColor: `${SEVERITY_COLORS[problem.severity]}20`,
                        color: SEVERITY_COLORS[problem.severity] || '#95a5a6'
                      }}
                    >
                      {problem.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {format(new Date(problem.startTime), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-400">
                    {problem.durationHours.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
