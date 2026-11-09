import React from 'react';
import { Mail, Phone, Edit, Trash2, Calendar, Compass, Building } from 'lucide-react';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

/**
 * LeadCard Component
 * Displays individual lead details in a modern visual card format.
 * 
 * @param {Object} props
 * @param {Object} props.lead - The lead data object.
 * @param {Function} props.onEdit - Callback function when edit action is clicked.
 * @param {Function} props.onDelete - Callback function when delete action is clicked.
 * @param {Function} [props.onStatusChange] - Optional callback to quick-patch lead status.
 */
export default function LeadCard({ lead, onEdit, onDelete, onStatusChange }) {
  const { id, _id, name, company, email, phone, status, source, value, dateAdded, createdAt } = lead;
  const leadId = _id || id;
  const formattedDate = dateAdded || (createdAt ? new Date(createdAt).toISOString().split('T')[0] : null);
  const formattedValue = typeof value === 'number' 
    ? `$${value.toLocaleString()}` 
    : (value ? `$${Number(value).toLocaleString()}` : '$0');

  return (
    <div 
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300"
    >
      <div className="space-y-4">
        {/* Header Block: Avatar initial / Name & Company / Deal Value */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3 items-center min-w-0">
            {/* Round visual avatar for leads */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-100/50 dark:border-blue-900/30">
              {name ? name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                <Building size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{company}</span>
              </p>
            </div>
          </div>
          
          {/* Deal Value Pill */}
          <div className="text-right shrink-0">
            <span className="inline-flex items-center text-xs font-extrabold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
              {formattedValue}
            </span>
          </div>
        </div>

        {/* Status Row with Quick Dropdown */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-800/40">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status:</span>
          {onStatusChange ? (
            <select
              value={status || 'New'}
              onChange={(e) => onStatusChange(leadId, e.target.value)}
              className="text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-900">
                  {st}
                </option>
              ))}
            </select>
          ) : (
            <StatusBadge status={status} />
          )}
        </div>

        {/* Info Grid */}
        <div className="space-y-2 pt-1 border-t border-slate-50 dark:border-slate-800/40 text-xs">
          {/* Email */}
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
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
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
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
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <span className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500">
                <Compass size={13} />
              </span>
              <span>
                Source: <span className="font-medium text-slate-700 dark:text-slate-200">{source}</span>
              </span>
            </div>
          )}

          {/* Date Added */}
          {formattedDate && (
            <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
              <span className="p-1 rounded-lg bg-slate-50/50 dark:bg-slate-850/50 text-slate-400/80">
                <Calendar size={13} />
              </span>
              <span>Added: {formattedDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-4">
        <button
          onClick={() => onEdit(lead)}
          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all duration-200 cursor-pointer"
          title="Edit Lead"
          aria-label={`Edit ${name}`}
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(leadId, name)}
          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all duration-200 cursor-pointer"
          title="Delete Lead"
          aria-label={`Delete ${name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
