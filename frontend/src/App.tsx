/**
 * Main App Component
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProblemsPage from '@/pages/ProblemsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import FalsePositivesPage from '@/pages/FalsePositivesPage';
import { DowntimePage } from '@/pages/DowntimePage';
import SREDashboard from '@/pages/SREDashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sre" element={<SREDashboard />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="problems" element={<ProblemsPage />} />
          <Route path="false-positives" element={<FalsePositivesPage />} />
          <Route path="downtime" element={<DowntimePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
