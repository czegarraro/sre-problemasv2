/**
 * Filter Bar Component
 */
import React, { useEffect, useState } from 'react';
import { Calendar, Filter, X, Search } from 'lucide-react';
import { useFiltersStore } from '@/store/filtersStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Hardcoded values for filters
const SEVERITY_LEVELS = [
  'AVAILABILITY',
  'CUSTOM_ALERT',
  'ERROR',
  'INFO',
  'MONITORING_UNAVAILABLE',
  'PERFORMANCE',
  'RESOURCE_CONTENTION',
];

const IMPACT_LEVELS = [
  'APPLICATION',
  'ENVIRONMENT',
  'INFRASTRUCTURE',
  'SERVICES',
];

const ROOT_CAUSE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
];

const AUTOREMEDIADO_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'true', label: 'Si' },
  { value: 'false', label: 'No' },
];

const FUNCIONO_AUTOREMEDIACION_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'true', label: 'Si' },
  { value: 'false', label: 'No' },
];

const FilterBar: React.FC = () => {
  const { filters, setFilters, clearFilters, getActiveFilterCount } = useFiltersStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Temporary filter state (not applied until "Buscar" is clicked)
  const [tempFilters, setTempFilters] = useState({
    dateFrom: '',
    dateTo: '',
    severityLevel: '',
    impactLevel: '',
    search: '',
    hasRootCause: 'all',
    autoremediado: 'all',
    funcionoAutoRemediacion: 'all',
    durationMin: '',
    durationMax: '',
  });

  // Initialize temp filters from current filters
  useEffect(() => {
    setTempFilters({
      dateFrom: filters.dateFrom || '',
      dateTo: filters.dateTo || '',
      severityLevel: filters.severityLevel?.[0] || '',
      impactLevel: filters.impactLevel?.[0] || '',
      search: filters.search || '',
      hasRootCause: filters.hasRootCause === true ? 'true' : filters.hasRootCause === false ? 'false' : 'all',
      autoremediado: filters.autoremediado === true ? 'true' : filters.autoremediado === false ? 'false' : 'all',
      funcionoAutoRemediacion: filters.funcionoAutoRemediacion === true ? 'true' : filters.funcionoAutoRemediacion === false ? 'false' : 'all',
      durationMin: filters.durationMin?.toString() || '',
      durationMax: filters.durationMax?.toString() || '',
    });
  }, [filters]);

  const handleApplyFilters = () => {
    const newFilters: any = {};

    // Date filters
    if (tempFilters.dateFrom) newFilters.dateFrom = tempFilters.dateFrom;
    if (tempFilters.dateTo) newFilters.dateTo = tempFilters.dateTo;

    // Select filters
    if (tempFilters.severityLevel) newFilters.severityLevel = [tempFilters.severityLevel];
    if (tempFilters.impactLevel) newFilters.impactLevel = [tempFilters.impactLevel];

    // Text search
    if (tempFilters.search) newFilters.search = tempFilters.search;

    // Boolean/tri-state filters
    if (tempFilters.hasRootCause !== 'all') {
      newFilters.hasRootCause = tempFilters.hasRootCause === 'true';
    }
    if (tempFilters.autoremediado !== 'all') {
      newFilters.autoremediado = tempFilters.autoremediado === 'true';
    }
    if (tempFilters.funcionoAutoRemediacion !== 'all') {
      newFilters.funcionoAutoRemediacion = tempFilters.funcionoAutoRemediacion === 'true';
    }

    // Numeric filters
    if (tempFilters.durationMin) newFilters.durationMin = Number(tempFilters.durationMin);
    if (tempFilters.durationMax) newFilters.durationMax = Number(tempFilters.durationMax);

    // Overwrite the existing filters with the new set
    setFilters(newFilters);
    console.log('Filtros aplicados:', newFilters);
  };

  const handleClearFilters = () => {
    const defaultTempFilters = {
      dateFrom: '',
      dateTo: '',
      severityLevel: '',
      impactLevel: '',
      search: '',
      hasRootCause: 'all',
      autoremediado: 'all',
      funcionoAutoRemediacion: 'all',
      durationMin: '',
      durationMax: '',
    };
    setTempFilters(defaultTempFilters);
    clearFilters(); // This already sets filters to {}
  };

  const activeFilters = getActiveFilterCount();

  return (
    <div className="glass border-b border-white/10">
      <div className="container mx-auto px-4 py-3">
        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros</span>
            {activeFilters > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-xs font-bold">
                {activeFilters}
              </span>
            )}
          </button>

          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {isExpanded && (
          <div className="space-y-4">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
              {/* Date From */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Fecha Inicio (DD/MM/YYYY)
                </label>
                <input
                  type="date"
                  value={tempFilters.dateFrom}
                  onChange={(e) => setTempFilters({ ...tempFilters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Fecha Fin (DD/MM/YYYY)
                </label>
                <input
                  type="date"
                  value={tempFilters.dateTo}
                  onChange={(e) => setTempFilters({ ...tempFilters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Severity Level */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Severidad
                </label>
                <select
                  value={tempFilters.severityLevel}
                  onChange={(e) => setTempFilters({ ...tempFilters, severityLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-white [&>option]:text-gray-900"
                >
                
                
                
                
                  <option value="">Todas</option>
                  {SEVERITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Impact Level */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Impacto
                </label>
                <select
                  value={tempFilters.impactLevel}
                  onChange={(e) => setTempFilters({ ...tempFilters, impactLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-white [&>option]:text-gray-900"
                >
                  <option value="">Todos</option>
                  {IMPACT_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Search */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Buscar Título
                </label>
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={tempFilters.search}
                  onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Second Row - Root Cause and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-4">
              {/* Root Cause Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Causa Raíz
                </label>
                <select
                  value={tempFilters.hasRootCause}
                  onChange={(e) => setTempFilters({ ...tempFilters, hasRootCause: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-white [&>option]:text-gray-900"
                >
                  {ROOT_CAUSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Min */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Duración Mínima (min)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={tempFilters.durationMin}
                  onChange={(e) => setTempFilters({ ...tempFilters, durationMin: e.target.value })}
                  className="w-full"
                  min="0"
                />
              </div>

              {/* Duration Max */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Duración Máxima (min)
                </label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={tempFilters.durationMax}
                  onChange={(e) => setTempFilters({ ...tempFilters, durationMax: e.target.value })}
                  className="w-full"
                  min="0"
                />
              </div>

              {/* Autoremediado Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  ¿Autoremediado?
                </label>
                <select
                  value={tempFilters.autoremediado}
                  onChange={(e) => setTempFilters({ ...tempFilters, autoremediado: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-white [&>option]:text-gray-900"
                >
                  {AUTOREMEDIADO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* FuncionoAutoremediacion Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  ¿Funciono el Autoremediado?
                </label>
                <select
                  value={tempFilters.funcionoAutoRemediacion}
                  onChange={(e) => setTempFilters({ ...tempFilters, funcionoAutoRemediacion: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-white [&>option]:text-gray-900"
                >
                  {FUNCIONO_AUTOREMEDIACION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-end gap-2 px-4 pb-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleApplyFilters}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
