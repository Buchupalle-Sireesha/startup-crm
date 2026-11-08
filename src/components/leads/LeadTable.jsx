import React from 'react';
import { Mail, Phone, Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown, Compass } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * LeadTable Component
 * Renders a structured, semantic table of CRM leads for desktop screens.
 * 
 * @param {Object} props
 * @param {Array} props.leads - Array of lead data objects.
 * @param {Function} props.onEdit - Callback function when edit action is clicked.
 * @param {Function} props.onDelete - Callback function when delete action is clicked.
 * @param {string} props.sortBy - Currently sorted column field.
 * @param {string} props.sortOrder - Sort order direction ('asc' or 'desc').
 * @param {Function} props.onSort - Callback function to handle column sorting trigger.
 */
export default function LeadTable({ leads, onEdit, onDelete, sortBy, sortOrder, onSort }) {
  
  // Helper to render sort indicator icons next to column headers
  const renderSortIndicator = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={12} className="opacity-40 group-hover:opacity-100 transition-opacity ml-1.5" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp size={12} className="text-blue-600 dark:text-blue-400 ml-1.5" />
      : <ChevronDown size={12} className="text-blue-600 dark:text-blue-400 ml-1.5" />;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="CRM Leads Table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              {/* Sortable: Name */}
              <th className="px-6 py-4.5">
                <button
                  type="button"
                  onClick={() => onSort('name')}
                  className="flex items-center hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus:outline-hidden font-bold focus:underline group"
                >
                  Name {renderSortIndicator('name')}
                </button>
              </th>
              
              {/* Sortable: Company */}
              <th className="px-6 py-4.5">
                <button
                  type="button"
                  onClick={() => onSort('company')}
                  className="flex items-center hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus:outline-hidden font-bold focus:underline group"
                >
                  Company {renderSortIndicator('company')}
                </button>
              </th>
              
              {/* Status */}
              <th className="px-6 py-4.5 font-bold">Status</th>
              
              {/* Contact (Email / Phone) */}
              <th className="px-6 py-4.5 font-bold">Email</th>
              
              {/* Source */}
              <th className="hidden lg:table-cell px-6 py-4.5 font-bold">Source</th>
              
              {/* Sortable: Date Added */}
              <th className="hidden lg:table-cell px-6 py-4.5">
                <button
                  type="button"
                  onClick={() => onSort('dateAdded')}
                  className="flex items-center hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus:outline-hidden font-bold focus:underline group"
                >
                  Date Added {renderSortIndicator('dateAdded')}
                </button>
              </th>
              
              {/* Actions */}
              <th className="px-6 py-4.5 text-right font-bold" scope="col">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr 
                  key={lead._id || lead.id} 
                  className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors group"
                >
                  {/* Lead Name with avatar-like style */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-100/50 dark:border-blue-900/30">
                        {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {lead.name}
                      </span>
                    </div>
                  </td>
                  
                  {/* Company */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                    {lead.company}
                  </td>
                  
                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  
                  {/* Email & Phone Details */}
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <a 
                          href={`mailto:${lead.email}`} 
                          className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors text-xs font-medium truncate max-w-[180px]"
                          title={lead.email}
                        >
                          {lead.email}
                        </a>
                      </div>
                      {lead.phone && lead.phone !== 'N/A' && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                          <Phone size={10} className="flex-shrink-0" />
                          <a href={`tel:${lead.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                            {lead.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Source */}
                  <td className="hidden lg:table-cell px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
                      <Compass size={12} className="text-slate-400 dark:text-slate-500" />
                      <span>{lead.source || 'Other'}</span>
                    </div>
                  </td>
                  
                  {/* Date Added */}
                  <td className="hidden lg:table-cell px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium">
                    {lead.dateAdded || (lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : 'N/A')}
                  </td>
                  
                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(lead)}
                        className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all duration-150"
                        title="Edit Lead"
                        aria-label={`Edit ${lead.name}`}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(lead._id || lead.id, lead.name)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all duration-150"
                        title="Delete Lead"
                        aria-label={`Delete ${lead.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                  No leads found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
