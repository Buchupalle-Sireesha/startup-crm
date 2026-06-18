import React from 'react';

const STATUSES = ['All', 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

/**
 * FilterBar Component
 * Renders a row of tabs/buttons representing lead statuses, showing the number of leads in each category.
 *
 * @param {Object} props
 * @param {string} props.activeFilter - The currently active status filter.
 * @param {Function} props.onFilterChange - Callback function triggered when a filter button is clicked.
 * @param {Array} props.leads - Raw array of lead objects to calculate status counts.
 */
export default function FilterBar({ activeFilter, onFilterChange, leads = [] }) {
  // Compute counts for each status
  const getCount = (status) => {
    if (status === 'All') {
      return leads.length;
    }
    return leads.filter((lead) => lead.status === status).length;
  };

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-100 dark:border-slate-800 pb-1.5 -mx-4 px-4 sm:mx-0 sm:px-0">
      {STATUSES.map((status) => {
        const isActive = activeFilter === status;
        const count = getCount(status);
        return (
          <button
            key={status}
            type="button"
            onClick={() => onFilterChange(status)}
            className={`px-4.5 py-2 rounded-t-xl text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer flex-shrink-0 flex items-center gap-1.5 border-b-2 ${
              isActive
                ? 'bg-blue-50/70 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-600'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <span>{status}</span>
            <span 
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium transition-colors duration-300 ${
                isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
