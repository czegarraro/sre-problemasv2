/**
 * KPI Card Component
 */
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import { formatNumber } from '@/lib/utils/format.utils';
import { cn } from '@/lib/utils/cn';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
  trend?: number;
  delay?: number;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card variant="glass" className="hover:scale-105 transition-transform duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.h3
                className="text-3xl font-bold mt-2"
                style={{ color }}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, type: 'spring' }}
              >
                {formatNumber(value)}
              </motion.h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            
            <div
              className={cn('p-3 rounded-lg')}
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
          </div>

          {trend !== undefined && (
            <div className="mt-4 flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
                )}
              >
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KPICard;
