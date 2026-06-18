import React from 'react';
import StatusBadge from '../leads/StatusBadge';

/**
 * RecentLeads displays a tabular view of the 5 most recently added leads.
 * Each row shows the lead's details (initials avatar, name, email), company, 
 * estimated deal value, sales status badge, and date added.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.leads - Array of lead objects containing information like name, company, value, status, email, and dateAdded.
 * @returns {React.ReactElement} The RecentLeads component.
 */
export default function RecentLeads({ leads = [] }) {
  // Extract the 5 most recent leads. Assuming they are pre-sorted or we sort them by date/id descending.
  // We will slice the first 5 elements.
  const topLeads = leads.slice(0, 5);

  // Helper to generate initials from a name
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 select-none h-full transition-colors duration-200">
      {/* Table Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Recent Leads</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Top leads currently in the acquisition pipeline</p>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="pb-3 pt-1">Lead Name</th>
              <th className="pb-3 pt-1">Company</th>
              <th className="pb-3 pt-1">Est. Value</th>
              <th className="pb-3 pt-1">Status</th>
              <th className="pb-3 pt-1 text-right">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-sm font-medium">
            {topLeads.length > 0 ? (
              topLeads.map((lead) => {
                const initials = lead.initials || getInitials(lead.name);
                const displayValue = typeof lead.value === 'number' 
                  ? `$${lead.value.toLocaleString()}` 
                  : lead.value;

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors group">
                    {/* Name column with avatar */}
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-200">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {lead.name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">{lead.email}</p>
                      </div>
                    </td>
                    
                    {/* Company column */}
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {lead.company}
                    </td>
                    
                    {/* Value column */}
                    <td className="py-3 text-slate-900 dark:text-slate-100 font-semibold">
                      {displayValue}
                    </td>
                    
                    {/* Status badge */}
                    <td className="py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    
                    {/* Date added */}
                    <td className="py-3 text-right text-slate-400 dark:text-slate-500 font-normal text-xs">
                      {lead.dateAdded || 'N/A'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                  No recent leads available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

