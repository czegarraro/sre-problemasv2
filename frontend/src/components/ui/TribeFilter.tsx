import React, { useEffect, useState } from 'react';
import { useFiltersStore } from '@/store/filtersStore';
import { analyticsApi } from '@/lib/api/analytics.api';

const TribeFilter: React.FC = () => {
  const { filters, setTribes, setFilter } = useFiltersStore();
  const [availableTribes, setAvailableTribes] = useState<{ name: string; tagValue: string; problemCount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Re-fetch tribes when cloud app changes (cascading: CloudApp → Tribe)
  useEffect(() => {
    const fetchTribes = async () => {
      try {
        setIsLoading(true);
        // Pass managementZones as parent filter to get only relevant tribes
        const parentFilters: any = {};
        if (filters.managementZones && filters.managementZones.length > 0) {
          parentFilters.managementZones = filters.managementZones;
        }

        const data = await analyticsApi.getCascadingFilterOptions(parentFilters);
        setAvailableTribes(data.tribes || []);

        // If the currently selected tribe is no longer in the options, reset it
        if (filters.tribes && filters.tribes.length > 0) {
          const currentTribe = filters.tribes[0];
          const stillValid = (data.tribes || []).some((t: any) => t.tagValue === currentTribe);
          if (!stillValid && currentTribe !== 'UNASSIGNED') {
            setTribes([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tribes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTribes();
  }, [filters.managementZones]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setTribes([]);
      // Also clear the squad because it depends on tribe
      setFilter('squads', undefined);
    } else {
      setTribes([value]);
      // Clear squad when tribe changes (child must reset)
      setFilter('squads', undefined);
    }
  };

  const selectedTribe = filters.tribes?.[0] || 'all';

  return (
    <div className="flex flex-col">
      <label htmlFor="tribe-filter" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        TRIBU
      </label>
      <select
        id="tribe-filter"
        value={selectedTribe}
        onChange={handleChange}
        disabled={isLoading}
        className="bg-white/5 border border-white/10 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 disabled:opacity-50"
      >
        <option value="all" className="bg-slate-900 text-white text-sm font-semibold">Todas</option>
        <option value="UNASSIGNED" className="bg-slate-900 text-white text-sm font-semibold">Sin Tribu</option>
        {availableTribes.map((tribe) => (
          <option 
            key={tribe.tagValue} 
            value={tribe.tagValue}
            className="bg-slate-900 text-white text-sm"
          >
            {tribe.name} ({tribe.problemCount})
          </option>
        ))}
      </select>
    </div>
  );
};

export default TribeFilter;
