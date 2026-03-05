import React, { useEffect, useState } from 'react';
import { useFiltersStore } from '@/store/filtersStore';
import { squadsApi, Squad } from '@/services/squadsApi';

const SquadFilter: React.FC = () => {
  const { filters, setFilter } = useFiltersStore();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSquads = async () => {
      setIsLoading(true);
      try {
        const data = await squadsApi.getSquads();
        setSquads(data);
      } catch (error) {
        console.error('Error fetching squads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSquads();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      // Si queremos "Todos", limpiamos el filtro de squads o lo manejamos según la lógica de la app
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
            key={squad._id} 
            value={squad.tagValue} 
            className="bg-slate-900 text-white text-sm"
          >
            {squad.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SquadFilter;
