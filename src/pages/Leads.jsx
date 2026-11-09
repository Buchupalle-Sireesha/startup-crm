import { useState, useMemo } from 'react';
import { 
  Plus, 
  SlidersHorizontal, 
  X, 
  LayoutGrid, 
  Table, 
  UserPlus,
  FileDown,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import LeadForm from '../components/leads/LeadForm';
import LeadCard from '../components/leads/LeadCard';
import LeadTable from '../components/leads/LeadTable';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import EmptyState from '../components/common/EmptyState';
import { useLeads } from '../context/LeadContext';

/**
 * Leads Page Component
 * Coordinates lead filtering, multi-field search, sorting, status fast-patching,
 * view modes (table/cards), deletion with confirmation dialog, and CSV export.
 */
export default function Leads() {
  // Context operations
  const { leads, addLead, updateLead, deleteLead, updateLeadStatus } = useLeads();

  // Component states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dateAdded'); // name, company, value, dateAdded
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [viewMode, setViewMode] = useState('table'); // table, card
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null); // null = create mode, object = edit mode
  const [leadToDelete, setLeadToDelete] = useState(null); // confirmation dialog target

  // Handles opening the form modal for editing a specific lead
  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  // Handles opening the form modal for adding a new lead
  const handleAddClick = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  // Handles adding or updating a lead when form is submitted
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedLead) {
        const leadId = selectedLead._id || selectedLead.id;
        await updateLead(leadId, formData);
      } else {
        await addLead(formData);
      }
      setIsModalOpen(false);
      setSelectedLead(null);
    } catch {
      // Error handled by LeadContext toast
    }
  };

  // Open confirmation dialog before deleting
  const handleDeletePrompt = (id, name) => {
    setLeadToDelete({ id, name });
  };

  // Confirmed delete handler
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead(leadToDelete.id);
      setLeadToDelete(null);
    } catch {
      // Error handled by LeadContext toast
    }
  };

  // Handles changing sorting criteria
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'value' || field === 'dateAdded' ? 'desc' : 'asc');
    }
  };

  // Clear filters utility passed down to EmptyState
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilter('All');
  };

  // Filtered and sorted leads computation
  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => activeFilter === 'All' || (lead.status || '').toLowerCase() === activeFilter.toLowerCase())
      .filter(lead => 
        (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (lead.company || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        let comparison;
        if (sortBy === 'dateAdded') {
          const dateA = new Date(a.dateAdded || a.createdAt || 0).getTime();
          const dateB = new Date(b.dateAdded || b.createdAt || 0).getTime();
          comparison = dateA - dateB;
        } else if (sortBy === 'value') {
          const valA = Number(a.value) || 0;
          const valB = Number(b.value) || 0;
          comparison = valA - valB;
        } else {
          comparison = (a[sortBy] || '').toString().localeCompare((b[sortBy] || '').toString());
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [leads, searchQuery, activeFilter, sortBy, sortOrder]);

  // CSV Export utility
  const handleExportCSV = () => {
    const listToExport = filteredLeads.length > 0 ? filteredLeads : leads;
    if (listToExport.length === 0) {
      toast.error('No lead records to export');
      return;
    }

    const headers = ['Name', 'Company', 'Deal Value ($)', 'Status', 'Email', 'Phone', 'Source', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...listToExport.map((l) => [
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${(l.company || '').replace(/"/g, '""')}"`,
        Number(l.value || 0),
        `"${l.status || 'New'}"`,
        `"${l.email || ''}"`,
        `"${l.phone || 'N/A'}"`,
        `"${l.source || 'Website'}"`,
        `"${l.dateAdded || (l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : 'N/A')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${listToExport.length} leads to CSV`);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative select-none">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Leads</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Manage, filter, and track your customer pipeline registry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-sm font-semibold transition-all cursor-pointer shadow-xs"
            title="Export Leads to CSV"
          >
            <FileDown size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button 
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-semibold shadow-xs shadow-blue-200/40 dark:shadow-none transition-all duration-150 cursor-pointer"
            aria-label="Add New Lead"
          >
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Control bar (Search, Sort & View Mode Toggle) */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        
        {/* Search Input Box */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Sort Controls (Applies to both Card & Table layouts) */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <SlidersHorizontal size={13} /> Sort By:
            </span>
            <div className="flex bg-slate-50 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <button 
                onClick={() => handleSort('name')} 
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${sortBy === 'name' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
              <button 
                onClick={() => handleSort('company')} 
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${sortBy === 'company' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                Company {sortBy === 'company' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
              <button 
                onClick={() => handleSort('value')} 
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${sortBy === 'value' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                Value {sortBy === 'value' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
              <button 
                onClick={() => handleSort('dateAdded')} 
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${sortBy === 'dateAdded' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                Date {sortBy === 'dateAdded' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            </div>
          </div>

          {/* View mode toggle: Available across Desktop and Tablet */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">View:</span>
            <div className="flex bg-slate-50 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setViewMode('table')} 
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="Table List View"
                aria-label="Toggle to Table View"
              >
                <Table size={15} />
              </button>
              <button 
                onClick={() => setViewMode('card')} 
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'card' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="Card Grid View"
                aria-label="Toggle to Card View"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterBar 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        leads={leads}
      />

      {/* Main Content Listings */}
      {filteredLeads.length > 0 ? (
        <>
          {/* Mobile Viewport: Cards */}
          <div className="block sm:hidden space-y-4">
            {filteredLeads.map((lead) => (
              <LeadCard 
                key={lead._id || lead.id}
                lead={lead}
                onEdit={handleEditClick}
                onDelete={handleDeletePrompt}
                onStatusChange={updateLeadStatus}
              />
            ))}
          </div>

          {/* Desktop & Tablet Viewport: Responsive toggle between Table and Card Grid */}
          <div className="hidden sm:block">
            {viewMode === 'table' ? (
              <LeadTable 
                leads={filteredLeads}
                onEdit={handleEditClick}
                onDelete={handleDeletePrompt}
                onStatusChange={updateLeadStatus}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map((lead) => (
                  <LeadCard 
                    key={lead._id || lead.id}
                    lead={lead}
                    onEdit={handleEditClick}
                    onDelete={handleDeletePrompt}
                    onStatusChange={updateLeadStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyState 
          totalLeadsCount={leads.length}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Delete Confirmation Modal Dialog */}
      {leadToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="alertdialog">
          <div 
            onClick={() => setLeadToDelete(null)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Lead?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to permanently delete <span className="font-semibold text-slate-800 dark:text-slate-200">{leadToDelete.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4" role="dialog" aria-modal="true">
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/65 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Drawer Slide-in Panel */}
          <div className="relative w-full h-[100dvh] md:h-auto md:max-w-lg bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 rounded-none md:rounded-2xl border-l md:border border-slate-100 dark:border-slate-800 transition-colors duration-200">
            <div className="space-y-6">
              {/* Drawer Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-blue-600 dark:text-blue-400" size={22} />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {selectedLead ? 'Edit CRM Lead Details' : 'Add New CRM Lead'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close Form Drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form inside drawer container */}
              <LeadForm 
                initialData={selectedLead}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsModalOpen(false);
                  setSelectedLead(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
