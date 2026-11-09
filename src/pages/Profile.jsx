import { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/authService.js';
import { getErrorMessage } from '../services/api.js';
import toast from 'react-hot-toast';

/**
 * Profile Page Component.
 * Allows the authenticated user to view their account info, update their display name,
 * and securely change their account password.
 */
export default function Profile() {
  const { user, setUser } = useAuth();

  // Profile Information state
  const [name, setName] = useState(user?.name || '');
  
  // Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // User initials for the avatar badge
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recent Member';

  // Handler: Update Display Name
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim()) {
      setProfileError('Display name cannot be empty');
      return;
    }

    if (name.trim() === user?.name) {
      setProfileSuccess('No changes to save.');
      return;
    }

    try {
      setSavingProfile(true);
      const response = await authService.updateProfile({ name: name.trim() });
      if (response.user) {
        setUser(response.user);
      }
      setProfileSuccess('Profile name updated successfully!');
      toast.success('Profile updated successfully');
    } catch (err) {
      const msg = getErrorMessage(err);
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handler: Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      const response = await authService.updateProfile({
        name: user?.name,
        oldPassword,
        newPassword
      });

      if (response.user) {
        setUser(response.user);
      }
      setPasswordSuccess('Password changed successfully!');
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = getErrorMessage(err);
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 select-none min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Header Section */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Account Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your personal details, email credentials, and security preferences.
        </p>
      </div>

      {/* User Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-blue-500/20 shrink-0">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                <BadgeCheck size={13} />
                {user?.role || 'Member'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400" />
              {user?.email}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pt-0.5">
              <Calendar size={12} />
              Member since {memberSince}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Account Active
          </span>
        </div>
      </div>

      {/* Main Grid: Profile Settings + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Panel 1: Personal Details */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-7 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Personal Information</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your public display name</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs border border-rose-100 dark:border-rose-900/30">
              <AlertCircle size={16} className="shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateName} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User size={16} />
                </span>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Email Address</span>
                <span className="text-[11px] text-slate-400 lowercase font-normal">(cannot be changed)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  id="profile-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Save size={15} />
                )}
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Panel 2: Security & Password */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-7 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Security Credentials</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your account password</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs border border-rose-100 dark:border-rose-900/30">
              <AlertCircle size={16} className="shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label htmlFor="old-password" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <KeyRound size={16} />
                </span>
                <input
                  id="old-password"
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showOldPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                New Password <span className="normal-case font-normal text-slate-400">(min. 6 chars)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingPassword ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <KeyRound size={15} />
                )}
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
