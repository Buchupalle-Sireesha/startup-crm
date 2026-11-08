import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut, 
  Settings, 
  Building2,
  ChevronLeft,
  X,
  Save,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import authService from '../../services/authService.js';
import { toast } from 'react-hot-toast';

// ── Settings Modal ──────────────────────────────────────────────────────────
function SettingsModal({ onClose }) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    if (newPassword && !oldPassword) { toast.error('Enter your current password to set a new one'); return; }
    if (newPassword && newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }

    try {
      setSaving(true);
      const payload = { name };
      if (newPassword) { payload.oldPassword = oldPassword; payload.newPassword = newPassword; }
      const data = await authService.updateProfile(payload);
      setUser(data.user);
      toast.success('Settings saved successfully');
      setOldPassword(''); setNewPassword('');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <Settings size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Account Settings</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Change Password <span className="normal-case font-normal">(optional)</span></p>
            
            {/* Current Password */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  id="settings-old-password"
                  type={showOld ? 'text' : 'password'}
                  placeholder="Current password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  {showOld ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              
              <div className="relative">
                <input
                  id="settings-new-password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="New password (min. 6 chars)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  {showNew ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200 dark:shadow-none disabled:opacity-50 cursor-pointer"
            >
              {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={15}/>}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar Footer (user info + settings + logout) ──────────────────────────
function SidebarFooter() {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Generate initials from name
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <div className="p-2.5 lg:p-4 border-t border-slate-50 dark:border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 px-1.5 py-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-100 dark:shadow-none shrink-0 text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0 md:hidden lg:block text-center lg:text-left">
            <p className="text-xs lg:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email || ''}</p>
          </div>
        </div>

        <div className="space-y-1">
          <button
            id="settings-btn"
            onClick={() => setShowSettings(true)}
            className="w-full flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3.5 px-2.5 lg:px-4 py-2.5 rounded-xl font-bold text-[10px] lg:text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 cursor-pointer min-h-[44px]"
          >
            <Settings size={16} />
            <span className="md:hidden lg:inline">Settings</span>
          </button>
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
    </>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, toggleSidebar }) {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, subLabel: 'Metrics & insights' },
    { name: 'Leads', path: '/leads', icon: Users, subLabel: 'Pipeline registry' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, subLabel: 'Sales performance' },
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
