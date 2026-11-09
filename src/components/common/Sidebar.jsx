import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut, 
  Building2,
  ChevronLeft,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Sidebar Footer (user info + profile link + logout) ──────────────────────────
function SidebarFooter() {
  const { user, logout } = useAuth();

  // Generate initials from name
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="p-2.5 lg:p-4 border-t border-slate-50 dark:border-slate-800 space-y-4">
      {/* Clickable user profile tile */}
      <NavLink
        to="/profile"
        className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 px-1.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
        title="View Profile Settings"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-100 dark:shadow-none shrink-0 text-xs group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <div className="flex-1 min-w-0 md:hidden lg:block text-center lg:text-left">
          <p className="text-xs lg:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {user?.name || 'User'}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email || ''}</p>
        </div>
      </NavLink>

      <div className="space-y-1">
        <NavLink
          id="profile-nav-btn"
          to="/profile"
          className={({ isActive }) => `w-full flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3.5 px-2.5 lg:px-4 py-2.5 rounded-xl font-bold text-[10px] lg:text-sm transition-all duration-200 cursor-pointer min-h-[44px] ${
            isActive 
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User size={16} />
          <span className="md:hidden lg:inline">Profile Settings</span>
        </NavLink>
        <button
          id="logout-btn"
          onClick={logout}
          className="w-full flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3.5 px-2.5 lg:px-4 py-2.5 rounded-xl font-bold text-[10px] lg:text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-rose-950/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 cursor-pointer min-h-[44px]"
        >
          <LogOut size={16} />
          <span className="md:hidden lg:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, toggleSidebar }) {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, subLabel: 'Metrics & insights' },
    { name: 'Leads', path: '/leads', icon: Users, subLabel: 'Pipeline registry' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, subLabel: 'Sales performance' },
    { name: 'Profile', path: '/profile', icon: User, subLabel: 'Account & security' },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-slate-950/65 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 
        w-64 md:w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 
        flex flex-col justify-between 
        transition-all duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Header / Branding */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2.5 mx-auto lg:mx-0">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100 dark:shadow-none">
                <Building2 size={20} className="stroke-[2]" />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-slate-200 tracking-tight md:hidden lg:block">NexusCRM</span>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={toggleSidebar} 
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 lg:p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3.5 px-2.5 lg:px-4 py-2.5 lg:py-3 rounded-xl font-bold text-[10px] lg:text-sm transition-all duration-200 cursor-pointer min-h-[44px]
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }
                  `}
                >
                  <Icon size={18} className="stroke-[2] shrink-0" />
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <span className="leading-tight">{item.name}</span>
                    <span className="hidden lg:block text-[9px] opacity-75 font-semibold mt-0.5 whitespace-nowrap">
                      {item.subLabel}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Area / User Info & Actions */}
        <SidebarFooter />
      </aside>
    </>
  );
}
