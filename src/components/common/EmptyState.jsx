import React from 'react';
import { Inbox, Search } from 'lucide-react';

/**
 * EmptyState Component
 * Displays a friendly screen when no leads are found in the system or when search/filters return zero results.
 *
 * @param {Object} props
 * @param {number} props.totalLeadsCount - Total number of leads in the CRM database before filtering.
 * @param {Function} props.onClearFilters - Callback function to clear search query and reset filters.
 */
export default function EmptyState({ totalLeadsCount, onClearFilters }) {
  const isDatabaseEmpty = totalLeadsCount === 0;

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-4 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-850/60 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800">
        {isDatabaseEmpty ? (
          <Inbox className="w-8 h-8 animate-pulse text-blue-600 dark:text-blue-400" />
        ) : (
          <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        )}
      </div>
      
      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {isDatabaseEmpty ? 'Start building your pipeline' : 'No leads found'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {isDatabaseEmpty
            ? 'Your CRM pipeline is currently empty. Click the "Add Lead" button at the top to create your first sales contact.'
            : 'No leads matched your current search query or active filter. Try adjusting your search text or resetting filters.'}
        </p>
      </div>

      {!isDatabaseEmpty && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-2 inline-flex items-center justify-center px-4.5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-450 font-semibold text-sm rounded-xl cursor-pointer transition-colors duration-200"
          aria-label="Reset all search queries and status filters"
        >
          Clear filters & search
        </button>
      )}
    </div>
  );
}
