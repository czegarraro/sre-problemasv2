import React, { useEffect, useState } from 'react';
import { useFiltersStore } from '@/store/filtersStore';
import { filtersApi } from '@/services/filtersApi';

const CloudAppFilter: React.FC = () => {
  const { filters, setFilter } = useFiltersStore();
  const [cloudApps, setCloudApps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCloudApps = async () => {
      setIsLoading(true);
      try {
        const data = await filtersApi.getOptions();
        // Filtrar específicamente aquellas que contengan mz-aks
        const mzApps = (data.managementZones || []).filter(mz => 
          mz.toLowerCase().includes('mz-aks')
        );
        setCloudApps(mzApps.sort());
      } catch (error) {
        console.error('Error fetching cloud apps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCloudApps();
  }, []);

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
            key={app} 
            value={app} 
            className="bg-slate-900 text-white text-sm" 
            title={app}
          >
            {app.length > 20 ? app.substring(0, 20) + '...' : app}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CloudAppFilter;
