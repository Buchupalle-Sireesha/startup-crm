import React from 'react';
import { Mail, Phone, Edit, Trash2, Calendar, Compass, Building } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * LeadCard Component
 * Displays individual lead details in a modern visual card format.
 * 
 * @param {Object} props
 * @param {Object} props.lead - The lead data object.
 * @param {Function} props.onEdit - Callback function when edit action is clicked.
 * @param {Function} props.onDelete - Callback function when delete action is clicked.
 */
export default function LeadCard({ lead, onEdit, onDelete }) {
  const { id, name, company, email, phone, status, source, dateAdded } = lead;

  return (
    <div 
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-200/80 dark:hover:border-slate-700/80 transition-all duration-300"
      style={{ contentVisibility: 'auto' }}
    >
      <div className="space-y-4">
        {/* Header Block: Avatar initial / Name & Company / Status */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3 items-center">
            {/* Soft background round visual avatar for leads */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-100/50 dark:border-blue-900/30">
              {name ? name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building size={12} className="text-slate-400 dark:text-slate-500" />
                <span className="line-clamp-1">{company}</span>
              </p>
            </div>
          </div>
          {/* Status Badge */}
          <StatusBadge status={status} />
        </div>

        {/* Info Grid */}
        <div className="space-y-2.5 pt-1 border-t border-slate-50 dark:border-slate-800/40">
          {/* Email */}
          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500">
              <Mail size={13} />
            </span>
            <a 
              href={`mailto:${email}`} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate focus:outline-hidden focus:underline"
              title={email}
            >
              {email}
            </a>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500">
              <Phone size={13} />
            </span>
            {phone && phone !== 'N/A' ? (
              <a 
                href={`tel:${phone}`} 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-hidden focus:underline"
              >
                {phone}
              </a>
            ) : (
              <span className="text-slate-400 italic">No phone provided</span>
            )}
          </div>

          {/* Source Details */}
          {source && (
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500">
                <Compass size={13} />
              </span>
              <span>
                Source: <span className="font-medium text-slate-700 dark:text-slate-200">{source}</span>
              </span>
            </div>
          )}

          {/* Date Added */}
          {dateAdded && (
            <div className="flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500">
              <span className="p-1 rounded-lg bg-slate-50/50 dark:bg-slate-850/50 text-slate-400/80">
                <Calendar size={13} />
              </span>
              <span>Added: {dateAdded}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-4">
        <button
          onClick={() => onEdit(lead)}
          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all duration-200"
          title="Edit Lead"
          aria-label={`Edit ${name}`}
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(id, name)}
          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all duration-200"
          title="Delete Lead"
          aria-label={`Delete ${name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
