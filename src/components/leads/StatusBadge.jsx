import React from 'react';

/**
 * StatusBadge Component
 * Renders a stylized, pill-shaped colored badge based on the lead status.
 * 
 * Supported statuses:
 * - 'New': Gray/Slate
 * - 'Contacted': Blue
 * - 'Meeting Scheduled': Purple
 * - 'Proposal Sent': Amber
 * - 'Won': Emerald/Green
 * - 'Lost': Rose/Red
 * 
 * @param {Object} props
 * @param {string} props.status - The current status of the lead.
 */
export default function StatusBadge({ status }) {
  // Safe default normalization
  const normalizedStatus = (status || 'New').trim();

  const getStatusStyles = (val) => {
    switch (val.toLowerCase()) {
      case 'new':
        return 'bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50';
      case 'contacted':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/45';
      case 'meeting scheduled':
        return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900/45';
      case 'proposal sent':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/45';
      case 'won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/45';
      case 'lost':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/45';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(normalizedStatus)} transition-colors duration-150`}
      role="status"
    >
      {normalizedStatus}
    </span>
  );
}
