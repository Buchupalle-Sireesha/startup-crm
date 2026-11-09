import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Plus, 
  X, 
  UserPlus,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

// Import dashboard widgets
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';
import { useAuth } from '../context/AuthContext.jsx';
import { useLeads } from '../context/LeadContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Dashboard page represents the core landing view for Startup CRM Lite.
 * Coordinates dynamic totals, pipeline valuations, conversion rates,
 * live Recharts sales curves, recent prospects, and quick actions.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leads, addLead } = useLeads();
  const { isDarkMode } = useTheme();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('Last 6 Months');

  // Form states for adding a lead from the dashboard
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newStatus, setNewStatus] = useState('New');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Dynamically calculate metrics based on authenticated user's actual leads
  const totalLeadsCount = leads.length;
  const pipelineVal = leads.reduce((acc, lead) => acc + (Number(lead.value) || 0), 0);
  const wonLeads = leads.filter((lead) => (lead.status || '').toLowerCase() === 'won');
  const wonVal = wonLeads.reduce((acc, lead) => acc + (Number(lead.value) || 0), 0);
  const conversionRate = totalLeadsCount > 0 
    ? ((wonLeads.length / totalLeadsCount) * 100).toFixed(1) 
    : '0.0';

  // Stats cards definition derived from live database data
  const statsList = [
    { 
      title: 'Total Leads', 
      value: totalLeadsCount.toString(), 
      change: `${totalLeadsCount} active prospects`, 
      color: 'primary', 
      icon: Users 
    },
    { 
      title: 'Pipeline Value', 
      value: `$${pipelineVal.toLocaleString()}`, 
      change: 'Combined deal size', 
      color: 'success', 
      icon: DollarSign 
    },
    { 
      title: 'Conversion Rate', 
      value: `${conversionRate}%`, 
      change: `${wonLeads.length} won of ${totalLeadsCount}`, 
      color: 'warning', 
      icon: Target 
    },
    { 
      title: 'Won Deals', 
      value: wonLeads.length.toString(), 
      change: `$${wonVal.toLocaleString()} closed`, 
      color: 'primary', 
      icon: TrendingUp 
    }
  ];

  // Dynamic calculation of Sales Pipeline trend from actual leads
  const pipelineChartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    if (timeframe === 'Last 30 Days') {
      // 4 week intervals
      const weeks = [
        { month: 'Week 1', value: 0, leads: 0 },
        { month: 'Week 2', value: 0, leads: 0 },
        { month: 'Week 3', value: 0, leads: 0 },
        { month: 'Week 4', value: 0, leads: 0 }
      ];

      leads.forEach((lead) => {
        const leadDate = lead.createdAt ? new Date(lead.createdAt) : new Date();
        const diffDays = Math.floor((now - leadDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30 && diffDays >= 0) {
          const idx = Math.min(3, Math.floor(diffDays / 7.5));
          weeks[3 - idx].value += Number(lead.value) || 0;
          weeks[3 - idx].leads += 1;
        }
      });
      return weeks;
    }

    if (timeframe === 'This Year') {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const months = [];
      for (let m = 0; m <= currentMonth; m++) {
        months.push({
          month: monthNames[m],
          year: currentYear,
          monthIndex: m,
          value: 0,
          leads: 0
        });
      }

      leads.forEach((lead) => {
        const leadDate = lead.createdAt ? new Date(lead.createdAt) : new Date();
        if (leadDate.getFullYear() === currentYear) {
          const m = leadDate.getMonth();
          if (months[m]) {
            months[m].value += Number(lead.value) || 0;
            months[m].leads += 1;
          }
        }
      });
      return months.map(({ month, value, leads: count }) => ({ month, value, leads: count }));
    }

    // Default: Last 6 Months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        value: 0,
        leads: 0
      });
    }

    leads.forEach((lead) => {
      const leadDate = lead.createdAt ? new Date(lead.createdAt) : (lead.dateAdded ? new Date(lead.dateAdded) : new Date());
      const item = months.find((m) => m.year === leadDate.getFullYear() && m.monthIndex === leadDate.getMonth());
      if (item) {
        item.value += Number(lead.value) || 0;
        item.leads += 1;
      }
    });

    return months.map(({ month, value, leads: count }) => ({ month, value, leads: count }));
  }, [leads, timeframe]);

  // Callback to add a new lead from dashboard quick modal
  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newCompany.trim() || !newEmail.trim()) {
      toast.error('Name, Company, and Email are required!');
      return;
    }

    const valueNum = newValue !== '' ? parseFloat(newValue) : 0;
    if (isNaN(valueNum) || valueNum < 0) {
      toast.error('Deal value must be a valid non-negative number');
      return;
    }

    const leadData = {
      name: newName.trim(),
      company: newCompany.trim(),
      value: valueNum,
      status: newStatus,
      email: newEmail.trim(),
      phone: newPhone.trim() || 'N/A',
      source: 'Other'
    };

    try {
      await addLead(leadData);
      // Reset Form Fields
      setNewName('');
      setNewCompany('');
      setNewValue('');
      setNewStatus('New');
      setNewEmail('');
      setNewPhone('');
      setIsModalOpen(false);
    } catch {
      // Error handled by LeadContext toast
    }
  };

  // Callback to export data as CSV format
  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error('No lead data available to export.');
      return;
    }

    const headers = ['Name', 'Company', 'Value', 'Status', 'Email', 'Phone', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...leads.map((l) => [
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${(l.company || '').replace(/"/g, '""')}"`,
        Number(l.value || 0),
        `"${l.status || 'New'}"`,
        `"${l.email || ''}"`,
        `"${l.phone || 'N/A'}"`,
        `"${l.dateAdded || (l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : 'N/A')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crm_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Leads data exported to CSV successfully!');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Dashboard Top Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'User'}</span>! Here's what's happening today.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-200/50 dark:shadow-none transition-all duration-200 cursor-pointer"
        >
          <Plus size={16} />
          Create New Lead
        </button>
      </div>

      {/* Grid of Metric Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            color={stat.color}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Empty State Banner when no leads exist */}
      {totalLeadsCount === 0 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Welcome to your Startup CRM!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              You haven't registered any prospects yet. Click below to add your first lead and watch your pipeline metrics come alive.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} /> Add First Lead
          </button>
        </div>
      )}

      {/* Main Content Layout Grid: Sales Pipeline & Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Pipeline Trend Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 flex flex-col justify-between shadow-xs transition-colors duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Sales Pipeline</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Value of deals and leads over time</p>
            </div>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          {/* Area Chart visualization using Recharts */}
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineChartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDarkMode ? '#38BDF8' : '#2563EB'} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={isDarkMode ? '#38BDF8' : '#2563EB'} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#F1F5F9'} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', 
                    border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: isDarkMode ? '#F8FAFC' : '#0F172A'
                  }}
                  itemStyle={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }}
                  labelStyle={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                  formatter={(value, name) => {
                    if (name === 'value') return [`$${Number(value).toLocaleString()}`, 'Pipeline Value'];
                    return [value, 'Total Leads'];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isDarkMode ? '#38BDF8' : '#2563EB'} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Overview Distribution Widget */}
        <div>
          <PipelineOverview leads={leads} />
        </div>
      </div>

      {/* Bottom Row Grid: Recent Leads + QuickActions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <RecentLeads leads={leads} />
        </div>

        <div>
          <QuickActions 
            onAddLead={() => setIsModalOpen(true)}
            onViewLeads={() => navigate('/leads')}
            onExportData={handleExportCSV}
          />
        </div>
      </div>

      {/* Add Lead Slide-over Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
          {/* Overlay */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/65 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Modal Panel Container */}
          <div className="relative w-full h-[100dvh] md:h-auto md:max-w-lg bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 rounded-none md:rounded-2xl border-l md:border border-slate-100 dark:border-slate-800 transition-colors duration-200">
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-blue-600 dark:text-blue-400" size={22} />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add New CRM Lead</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateLead} className="space-y-4" id="dashboard-add-lead-form">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@acme.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
                  />
                </div>

                {/* Grid for Phone & Deal Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 555-0123"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
                    />
                  </div>

                  {/* Estimated Value */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deal Value ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 5000"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Lead Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px] cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Meeting Scheduled">Meeting Scheduled</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Modal Control Buttons */}
            <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold rounded-xl text-sm active:scale-95 transition-all cursor-pointer min-h-[44px] flex items-center justify-center border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="dashboard-add-lead-form"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-200/50 dark:shadow-none active:scale-95 transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Create Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
