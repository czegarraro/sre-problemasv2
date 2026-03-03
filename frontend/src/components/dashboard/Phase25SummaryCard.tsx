/**
 * Phase 2.5 Summary Card Component
 * Displays flapping and maintenance window statistics
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Moon, RefreshCw, TrendingDown, Shield } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

export interface Phase25Summary {
  chronicOffenders: any[];
  maintenanceWindowAlerts: number;
  flappingEntityCount: number;
  maintenanceNoisePercent: number;
}

interface Phase25SummaryCardProps {
  data: Phase25Summary | null;
  isLoading?: boolean;
}

const Phase25SummaryCard: React.FC<Phase25SummaryCardProps> = ({
  data,
  isLoading = false,
}) => {
  const metrics = data ? [
    {
      label: 'Entidades Flapping',
      value: data.flappingEntityCount,
      icon: RefreshCw,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      description: '>3 alertas en 24h'
    },
    {
      label: 'Alertas en Mantenimiento',
      value: data.maintenanceWindowAlerts,
      icon: Moon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: '02:00-05:00 batch window'
    },
    {
      label: 'Ruido por Mantenimiento',
      value: `${data.maintenanceNoisePercent}%`,
      icon: TrendingDown,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      description: 'del total mensual'
    },
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card variant="glass" className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle>Phase 2.5: Advanced Heuristics</CardTitle>
              <CardDescription>
                Flapping Detection + Maintenance Windows
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No hay datos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className={cn('inline-flex p-2 rounded-lg mb-2', metric.bgColor)}>
                    <metric.icon className={cn('w-5 h-5', metric.color)} />
                  </div>
                  <div className={cn('text-2xl font-bold', metric.color)}>
                    {metric.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-0.5">
                    {metric.description}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Phase25SummaryCard;
