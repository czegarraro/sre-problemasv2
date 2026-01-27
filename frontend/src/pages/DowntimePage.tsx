import React from 'react';
import { DowntimeDashboard } from '../components/dashboard/DowntimeDashboard';

export const DowntimePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f0f23]">
      <DowntimeDashboard />
    </div>
  );
};
