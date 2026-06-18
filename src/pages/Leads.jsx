import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  SlidersHorizontal, 
  X, 
  LayoutGrid, 
  Table, 
  UserPlus
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
 * Main page assembling LeadTable, LeadCard list, and LeadForm inside a modal/slide-over.
 * Manages full CRUD operations with react-hot-toast notifications.
 */
export default function Leads() {
  // --- CONTEXT ---
  const { leads, addLead, updateLead, deleteLead } = useLeads();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // name, company, dateAdded
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [viewMode, setViewMode] = useState('table'); // table, card
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null); // null means create mode, object means edit mode

  // --- CRUD ACTIONS ---
  
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
  const handleFormSubmit = (formData) => {
    if (selectedLead) {
      // Edit Flow
      updateLead(selectedLead.id, formData);
      toast.success(`Updated lead details for ${formData.name}`);
    } else {
      // Create Flow
      addLead(formData);
      toast.success(`Successfully added lead: ${formData.name}`);
    }

    setIsModalOpen(false);
    setSelectedLead(null);
  };

  // Handles deleting a lead
  const handleDeleteLead = (id, name) => {
    // Standard red notifications for deletes as required
    deleteLead(id);
    toast.error(`Removed lead: ${name}`, {
      icon: '🗑️',
      style: {
        borderRadius: '12px',
        background: '#FFF1F2',
        color: '#E11D48',
        border: '1px solid #FECDD3',
      },
    });
  };

  // Handles changing sorting criteria
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Clear filters utility passed down to EmptyState
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilter('All');
  };

  // --- COMPUTATIONS (Memoized) ---
  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => activeFilter === 'All' || lead.status === activeFilter)
      .filter(lead => 
        (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (lead.company || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'dateAdded') {
          comparison = new Date(a.dateAdded || a.createdAt) - new Date(b.dateAdded || b.createdAt);
        } else {
          comparison = (a[sortBy] || '').localeCompare(b[sortBy] || '');
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [leads, searchQuery, activeFilter, sortBy, sortOrder]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Leads</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage and track your startup's customer pipeline.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-semibold shadow-xs shadow-blue-200/40 dark:shadow-none transition-all duration-150 cursor-pointer"
          aria-label="Add New Lead"
        >
          <Plus size={16} />
          Add Lead
        </button>
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
                onClick={() => handleSort('dateAdded')} 
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${sortBy === 'dateAdded' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                Date {sortBy === 'dateAdded' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            </div>
          </div>

          {/* Toggle View mode controllers */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">View:</span>
            <div className="flex bg-slate-50 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setViewMode('table')} 
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="Table List View"
                aria-label="Toggle to Table View"
              >
                <Table size={15} />
              </button>
              <button 
                onClick={() => setViewMode('card')} 
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'card' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="Card Grid View"
                aria-label="Toggle to Card View"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Horizontal scrolling on small mobile viewports) */}
      <FilterBar 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        leads={leads}
      />

      {/* Main Content Listings */}
      {viewMode === 'table' ? (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block">
            {filteredLeads.length > 0 ? (
              <LeadTable 
                leads={filteredLeads}
                onEdit={handleEditClick}
                onDelete={handleDeleteLead}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            ) : (
              <EmptyState 
                totalLeadsCount={leads.length}
                onClearFilters={handleClearFilters}
              />
            )}
          </div>
          {/* Mobile Stacking Cards View (Forces grid when table is selected on mobile screens) */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <LeadCard 
                  key={lead.id}
                  lead={lead}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteLead}
                />
              ))
            ) : (
              <EmptyState 
                totalLeadsCount={leads.length}
                onClearFilters={handleClearFilters}
              />
            )}
          </div>
        </>
      ) : (
        /* Full Grid of Cards View (Responsive structure for both desktop and mobile) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <LeadCard 
                key={lead.id}
                lead={lead}
                onEdit={handleEditClick}
                onDelete={handleDeleteLead}
              />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState 
                totalLeadsCount={leads.length}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}
        </div>
      )}

      {/* Slide-over Modal Drawer for Lead Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          {/* Backdrop Overlay with Blur */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/65 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Drawer Slide-in Panel */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-in">
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
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95 transition-all cursor-pointer"
                  aria-label="Close Form Drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Render the Form inside the drawer container */}
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
