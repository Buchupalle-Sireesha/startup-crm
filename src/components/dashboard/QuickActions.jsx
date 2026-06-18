import { UserPlus, ArrowRight, FileDown } from 'lucide-react';

/**
 * QuickActions provides card-style action buttons for core dashboard workflows:
 * adding a new lead, viewing all leads, and exporting CRM data.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {function} props.onAddLead - Callback invoked when "Add New Lead" is clicked.
 * @param {function} props.onViewLeads - Callback invoked when "View All Leads" is clicked.
 * @param {function} props.onExportData - Callback invoked when "Export Data" is clicked.
 * @returns {React.ReactElement} The QuickActions component.
 */
export default function QuickActions({ onAddLead, onViewLeads, onExportData }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 select-none h-full transition-colors duration-200">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Quick Actions</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Frequent tasks and utilities</p>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-1 gap-3.5 pt-2 flex-1 justify-center">
        {/* Add New Lead Action */}
        <button
          onClick={onAddLead}
          className="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300 group cursor-pointer active:scale-98"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white border border-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 dark:bg-slate-900 dark:border-blue-900/40 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-colors">
              <UserPlus size={18} className="stroke-[2.25]" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold block">Add New Lead</span>
              <span className="text-[10px] text-blue-400 dark:text-blue-500 group-hover:text-blue-200 dark:group-hover:text-blue-300 block font-semibold animate-pulse-slow">
                Register a new prospect
              </span>
            </div>
          </div>
          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
        </button>

        {/* View All Leads Action */}
        <button
          onClick={onViewLeads}
          className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-500 hover:text-white dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-500 dark:hover:text-white transition-all duration-300 group cursor-pointer active:scale-98"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white border border-slate-100 rounded-lg text-slate-600 group-hover:bg-slate-600 group-hover:text-white group-hover:border-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-600 dark:group-hover:text-white transition-colors">
              <ArrowRight size={18} className="stroke-[2.25]" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold block">View All Leads</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-200 dark:group-hover:text-slate-305 block font-semibold">
                Browse pipeline registry
              </span>
            </div>
          </div>
          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
        </button>

        {/* Export Data Action */}
        <button
          onClick={onExportData}
          className="flex items-center justify-between p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-650 dark:hover:text-white transition-all duration-300 group cursor-pointer active:scale-98"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white border border-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 dark:bg-slate-900 dark:border-emerald-900/40 dark:text-emerald-400 dark:group-hover:bg-emerald-500 dark:group-hover:text-white transition-colors">
              <FileDown size={18} className="stroke-[2.25]" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold block">Export Data</span>
              <span className="text-[10px] text-emerald-400 dark:text-emerald-500 group-hover:text-emerald-200 dark:group-hover:text-emerald-305 block font-semibold">
                Download spreadsheet (CSV)
              </span>
            </div>
          </div>
          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
        </button>
      </div>
    </div>
  );
}
