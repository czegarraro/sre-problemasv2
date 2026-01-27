/**
 * Main Layout Component
 */
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useFiltersStore } from '@/store/filtersStore';
import Header from './Header';
import FilterBar from './FilterBar';

const MainLayout: React.FC = () => {
  const { filters, resetToDefaultFilters } = useFiltersStore();

  // Initialize default filters on first load
  useEffect(() => {
    // Only set default filters if no filters are currently set
    if (!filters.dateFrom && !filters.dateTo) {
      resetToDefaultFilters();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FilterBar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
