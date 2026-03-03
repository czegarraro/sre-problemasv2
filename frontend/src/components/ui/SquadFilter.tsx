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
    <div className="flex flex-col space-y-2">
      <label htmlFor="squad-filter" className="text-xs font-medium text-muted-foreground uppercase">
        Squad
      </label>
      <select
        id="squad-filter"
        value={currentSquad}
        onChange={handleChange}
        disabled={isLoading}
        className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
      >
        <option value="all" className="bg-[#1a1c2e]">Todos</option>
        <option value="UNASSIGNED" className="bg-[#1a1c2e]">Sin Squad</option>
        {squads.map((squad) => (
          <option key={squad._id} value={squad.tagValue} className="bg-[#1a1c2e]">
            {squad.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SquadFilter;
