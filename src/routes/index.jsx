import React, { lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext.jsx';

// Lazy loading views for bundle optimization
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Profile = lazy(() => import('../pages/Profile'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));

/**
 * ProtectedRoute component that blocks unauthenticated requests.
 * Evaluates JWT presence and handles page loading states to prevent layout flashes.
 */
function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  // Render a full-screen loading spinner while restoring user session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading workspace...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if token is missing
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Allow navigation access
  return <Outlet />;
}

/**
 * Global Routing Table for Startup CRM Lite.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Secure Pages (Nested in Route Protection and Layout Frame) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Fallback 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
