import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/common/Layout';

// Lazy loading views
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Analytics = lazy(() => import('../pages/Analytics'));
const NotFound = lazy(() => import('../pages/NotFound'));

export default function AppRoutes() {
  return (
    <Routes>
      {/* Wrap protected routes inside standard Layout shell */}
      <Route path="/" element={<Layout />}>
        {/* Redirect base URL to /dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Individual dashboard routes */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
