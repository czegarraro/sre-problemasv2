import React, { useEffect, useState } from 'react';
import { useFiltersStore } from '@/store/filtersStore';
import { analyticsApi } from '@/lib/api/analytics.api';

const CloudAppFilter: React.FC = () => {
  const { filters, setFilter } = useFiltersStore();
  const [cloudApps, setCloudApps] = useState<{ name: string; problemCount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Re-fetch cloud apps when tribes or squads change (cascading UP)
  useEffect(() => {
    const fetchCloudApps = async () => {
      setIsLoading(true);
      try {
        // Pass tribes and squads as parent filters to get only relevant cloud apps
        const parentFilters: any = {};
        if (filters.tribes && filters.tribes.length > 0) parentFilters.tribes = filters.tribes;
        if (filters.squads && filters.squads.length > 0) parentFilters.squads = filters.squads;

        const data = await analyticsApi.getCascadingFilterOptions(parentFilters);
        setCloudApps(data.cloudApps || []);
      } catch (error) {
        console.error('Error fetching cloud apps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCloudApps();
  }, [filters.tribes, filters.squads]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setFilter('managementZones', undefined);
    } else {
      setFilter('managementZones', [value]);
    }
  };

  const currentApp = filters.managementZones && filters.managementZones.length > 0 ? filters.managementZones[0] : 'all';

  return (
    <div className="flex flex-col">
      <label htmlFor="cloud-app-filter" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        CLOUD APP
      </label>
      <select
        id="cloud-app-filter"
        value={currentApp}
        onChange={handleChange}
        disabled={isLoading}
        className="bg-white/5 border border-white/10 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 disabled:opacity-50 max-w-[200px]"
        style={{ minWidth: "150px" }}
      >
        <option value="all" className="bg-slate-900 text-white text-sm font-semibold">Todas</option>
        <option value="UNASSIGNED" className="bg-slate-900 text-white text-sm font-semibold">Sin Cloud App</option>
        {cloudApps.map((app) => (
          <option 
            key={app.name} 
            value={app.name} 
            className="bg-slate-900 text-white text-sm" 
            title={app.name}
          >
            {app.name.length > 20 ? app.name.substring(0, 20) + '...' : app.name} ({app.problemCount})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CloudAppFilter;
