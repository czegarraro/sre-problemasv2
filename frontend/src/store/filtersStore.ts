/**
 * Filters Store
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProblemFilters } from '@/types/problem.types';

interface FiltersState {
  filters: ProblemFilters;
  
  // Actions
  setFilter: <K extends keyof ProblemFilters>(key: K, value: ProblemFilters[K]) => void;
  setFilters: (filters: Partial<ProblemFilters>) => void;
  clearFilters: () => void;
  clearFilter: (key: keyof ProblemFilters) => void;
  getActiveFilterCount: () => number;
  resetToDefaultFilters: () => void;
}

const getDefaultFilters = (): ProblemFilters => ({});

// Start with empty filters
const initialFilters: ProblemFilters = getDefaultFilters();

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      filters: initialFilters,

      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
      },

      setFilters: (newFilters) => {
        set({ filters: newFilters });
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      clearFilter: (key) => {
        set((state) => {
          const newFilters = { ...state.filters };
          delete newFilters[key];
          return { filters: newFilters };
        });
      },

      resetToDefaultFilters: () => {
        set({ filters: getDefaultFilters() });
      },

      getActiveFilterCount: () => {
        const filters = get().filters;
        return Object.keys(filters).filter((key) => {
          const value = filters[key as keyof ProblemFilters];
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'boolean') return true;
          if (typeof value === 'string') return value.length > 0;
          if (typeof value === 'number') return true;
          return false;
        }).length;
      },
    }),
    {
      name: 'filters-storage',
    }
  )
);
