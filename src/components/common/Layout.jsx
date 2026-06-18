import React, { useState, Suspense } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import { 
  Menu, 
  Bell, 
  Search, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  BarChart3 
} from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

// A premium loading skeleton for Suspense loading states
const PageLoader = () => (
  <div className="p-8 w-full max-w-7xl mx-auto space-y-8 animate-pulse">
    {/* Page Header Skeleton */}
    <div className="flex justify-between items-center">
      <div className="space-y-2.5">
        <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
      </div>
      <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
    </div>

    {/* Metric Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-3.5 w-36 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Content Table/Chart Skeleton */}
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  // Determine current section title based on pathname
  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Overview';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-roboto text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open Sidebar Menu"
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumb / Title */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>Nexus</span>
              <ChevronRight size={12} />
              <span className="text-slate-700 dark:text-slate-300 font-bold text-sm tracking-tight">{getPageTitle()}</span>
            </div>
            
            <h1 className="sm:hidden text-lg font-bold text-slate-800 dark:text-slate-100">{getPageTitle()}</h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search leads, reports..."
                className="w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Theme Toggle */}
            <DarkModeToggle />

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border border-white dark:border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 dark:bg-slate-950/20 pb-20 md:pb-0">
          {/* Lazy loaded Page Suspense wrapping */}
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-4 z-40 shadow-lg transition-colors duration-200">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] min-w-[44px]
                  ${isActive ? 'text-blue-650 dark:text-blue-400' : 'text-slate-500 dark:text-slate-450 hover:text-slate-800'}
                `}
              >
                <Icon size={20} className="stroke-[2]" />
                <span className="text-[9px] font-bold tracking-tight">{item.name}</span>
              </NavLink>
            );
        </div>
      </div>
    </div>
  );
}

