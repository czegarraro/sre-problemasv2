/**
 * Chronic Offenders Card Component
 * Phase 2.5: Displays top flapping entities (>3 alerts/24h)
 */
import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

export interface ChronicOffender {
  entityId: string;
  entityName: string;
  alertCount: number;
  lastTitle: string;
  lastOccurrence: string;
  isFlapping: boolean;
}

interface ChronicOffendersCardProps {
  offenders: ChronicOffender[];
  isLoading?: boolean;
  windowHours?: number;
}

const ChronicOffendersCard: React.FC<ChronicOffendersCardProps> = ({
  offenders,
  isLoading = false,
  windowHours = 24,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="glass" className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <RefreshCw className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <CardTitle>Chronic Offenders</CardTitle>
                <CardDescription>Entidades con &gt;3 alertas en {windowHours}h</CardDescription>
              </div>
            </div>
            {offenders.length > 0 && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-400">
                {offenders.length} entidades
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : offenders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
              <p>No hay entidades "flapping" detectadas</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {offenders.map((offender, index) => (
                <motion.div
                  key={offender.entityId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'p-3 rounded-lg border border-white/10',
                    'bg-white/5 hover:bg-white/10 transition-colors'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {offender.entityName || offender.entityId.slice(0, 16) + '...'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {offender.lastTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={cn(
                        'px-2 py-1 text-xs font-bold rounded-full',
                        offender.alertCount > 5 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      )}>
                        {offender.alertCount}x
                      </span>
                    </div>
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

export default ChronicOffendersCard;
