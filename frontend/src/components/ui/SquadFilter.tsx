import React, { useEffect, useState } from 'react';
import { useFiltersStore } from '@/store/filtersStore';
import { analyticsApi } from '@/lib/api/analytics.api';

const SquadFilter: React.FC = () => {
  const { filters, setFilter } = useFiltersStore();
  const [squads, setSquads] = useState<{ name: string; tagValue: string; problemCount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Re-fetch squads when cloud app OR tribe changes (cascading: CloudApp → Tribe → Squad)
  useEffect(() => {
    const fetchSquads = async () => {
      setIsLoading(true);
      try {
        // Pass managementZones and tribes as parent filters
        const parentFilters: any = {};
        if (filters.managementZones && filters.managementZones.length > 0) {
          parentFilters.managementZones = filters.managementZones;
        }
        if (filters.tribes && filters.tribes.length > 0) {
          parentFilters.tribes = filters.tribes;
        }

        const data = await analyticsApi.getCascadingFilterOptions(parentFilters);
        setSquads(data.squads || []);

        // If the currently selected squad is no longer in the options, reset it
        if (filters.squads && filters.squads.length > 0) {
          const currentSquad = filters.squads[0];
          const stillValid = (data.squads || []).some((s: any) => s.tagValue === currentSquad);
          if (!stillValid && currentSquad !== 'UNASSIGNED') {
            setFilter('squads', undefined);
          }
        }
      } catch (error) {
        console.error('Error fetching squads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSquads();
  }, [filters.managementZones, filters.tribes]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setFilter('squads', undefined);
    } else {
      setFilter('squads', [value]);
    }
  };

  const currentSquad = filters.squads && filters.squads.length > 0 ? filters.squads[0] : 'all';

  return (
    <div className="flex flex-col">
      <label htmlFor="squad-filter" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        SQUAD
      </label>
      <select
        id="squad-filter"
        value={currentSquad}
        onChange={handleChange}
        disabled={isLoading}
        className="bg-white/5 border border-white/10 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 disabled:opacity-50"
      >
        <option value="all" className="bg-slate-900 text-white text-sm font-semibold">Todos</option>
        <option value="UNASSIGNED" className="bg-slate-900 text-white text-sm font-semibold">Sin Squad</option>
        {squads.map((squad) => (
          <option 
            key={squad.tagValue} 
            value={squad.tagValue} 
            className="bg-slate-900 text-white text-sm"
          >
            {squad.name} ({squad.problemCount})
          </option>
        ))}
      </select>
    </div>
  );
};

export default SquadFilter;
