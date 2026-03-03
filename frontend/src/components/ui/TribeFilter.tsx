import React, { useEffect, useState } from 'react';
import { useFiltersStore } from '@/store/filtersStore';
import { tribeApi, Tribe } from '@/services/tribeApi';

const TribeFilter: React.FC = () => {
  const { filters, setTribes } = useFiltersStore();
  const [availableTribes, setAvailableTribes] = useState<Tribe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTribes = async () => {
      try {
        setIsLoading(true);
        const tribesList = await tribeApi.getTribes();
        setAvailableTribes(tribesList);
      } catch (error) {
        console.error('Failed to fetch tribes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTribes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setTribes([]);
    } else {
      setTribes([value]);
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
            {tribe.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TribeFilter;
