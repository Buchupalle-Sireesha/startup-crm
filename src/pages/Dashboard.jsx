import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Plus, 
  X, 
  UserPlus 
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

// Import newly created dashboard widgets
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';
import { useLeads } from '../context/LeadContext';
import { useTheme } from '../context/ThemeContext';

// Mock performance data for charts (retained from original view)
const pipelineChartData = [
  { month: 'Jan', value: 45000, leads: 120 },
  { month: 'Feb', value: 52000, leads: 145 },
  { month: 'Mar', value: 49000, leads: 130 },
  { month: 'Apr', value: 63000, leads: 175 },
  { month: 'May', value: 58000, leads: 160 },
  { month: 'Jun', value: 85000, leads: 220 },
];

/**
 * Dashboard page represents the core landing view for Startup CRM Lite.
 * It coordinates and displays:
 * - StatsCard widgets showing computed dynamic totals, valuation, conversion rates, and wins.
 * - Sales Pipeline chart displaying pipeline growth over time.
 * - PipelineOverview progress distribution chart.
 * - QuickActions panel for fast workflow triggers.
 * - RecentLeads table detailing the latest prospects in the system.
 * - Modal slide-over form to add a new lead directly into dashboard context.
 *
 * @component
 * @returns {React.ReactElement} The Dashboard page component.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { leads, addLead } = useLeads();
  const { isDarkMode } = useTheme();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for adding a lead from the dashboard
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newStatus, setNewStatus] = useState('New');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Dynamically calculate metrics based on state leads
  const totalLeadsCount = leads.length;
  const pipelineVal = leads.reduce((acc, lead) => acc + (Number(lead.value) || 0), 0);
  const wonLeads = leads.filter((lead) => lead.status.toLowerCase() === 'won');
  const conversionRate = totalLeadsCount > 0 
    ? ((wonLeads.length / totalLeadsCount) * 100).toFixed(1) 
    : '0.0';

  // Stats definition matching component inputs
  const statsList = [
    { title: 'Total Leads', value: totalLeadsCount.toString(), change: '+12.5%', color: 'primary', icon: Users },
    { title: 'Pipeline Value', value: `$${pipelineVal.toLocaleString()}`, change: '+18.2%', color: 'success', icon: DollarSign },
    { title: 'Conversion Rate', value: `${conversionRate}%`, change: '-0.5%', color: 'warning', icon: Target },
    { title: 'Won Deals', value: wonLeads.length.toString(), change: '+8.3%', color: 'primary', icon: TrendingUp }
  ];

  // Callback to add a new lead to the local state list
  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newName || !newCompany || !newEmail) {
      toast.error('Name, Company, and Email are required!');
      return;
    }

    const valueNum = newValue ? parseFloat(newValue) : 0;
    const leadData = {
      name: newName,
      company: newCompany,
      value: valueNum,
      status: newStatus,
      email: newEmail,
      phone: newPhone || 'N/A',
      source: 'Other'
    };

    addLead(leadData);
    toast.success(`Created lead: ${newName}`);

    // Reset Form Fields
    setNewName('');
    setNewCompany('');
    setNewValue('');
    setNewStatus('New');
    setNewEmail('');
    setNewPhone('');
    setIsModalOpen(false);
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
        `"${l.name}"`,
        `"${l.company}"`,
        l.value,
        `"${l.status}"`,
        `"${l.email}"`,
        `"${l.phone || 'N/A'}"`,
        `"${l.dateAdded || 'N/A'}"`
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Welcome back, Sudheer. Here's what's happening today.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-200 dark:shadow-none transition-all duration-200 cursor-pointer"
        >
          <Plus size={16} />
          Create New Lead
        </button>
      </div>

      {/* Grid of Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Pipeline Trend Chart (Col-span 2) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 lg:col-span-2 space-y-4 flex flex-col justify-between shadow-xs transition-colors duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Sales Pipeline</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Value of deals and number of leads generated</p>
            </div>
            <select className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg focus:outline-hidden cursor-pointer">
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
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
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Pipeline Value']}
                />
                <Area type="monotone" dataKey="value" stroke={isDarkMode ? '#38BDF8' : '#2563EB'} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Overview Distribution Widget (Col-span 1) */}
        <div className="lg:col-span-1">
          <PipelineOverview leads={leads} />
        </div>
      </div>

      {/* Bottom Row Grid containing QuickActions and Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads list */}
        <div className="lg:col-span-2">
          <RecentLeads leads={leads} />
        </div>

        {/* QuickActions Panel */}
        <div className="lg:col-span-1">
          <QuickActions 
            onAddLead={() => setIsModalOpen(true)}
            onViewLeads={() => navigate('/leads')}
            onExportData={handleExportCSV}
          />
        </div>
      </div>

      {/* Add Lead Slide-over Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/65 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Modal Panel Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 border-l border-slate-100 dark:border-slate-800 transition-colors duration-200">
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-blue-600 dark:text-blue-400" size={22} />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add New CRM Lead</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95 transition-all cursor-pointer"
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
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
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
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
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
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0123"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Estimated Value */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deal Value ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Lead Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all cursor-pointer"
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
                className="flex-1 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold rounded-xl text-sm active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="dashboard-add-lead-form"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-200 dark:shadow-none active:scale-95 transition-all cursor-pointer"
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

