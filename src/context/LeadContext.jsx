import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * TypeScript-style shape of a Lead object:
 * @typedef {Object} Lead
 * @property {string} id - Unique identifier generated using crypto.randomUUID()
 * @property {string} name - Full name of the lead
 * @property {string} company - Associated company name
 * @property {string} email - Email address
 * @property {string} phone - Contact phone number or 'N/A'
 * @property {'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost'} status - Pipeline stage status
 * @property {'Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other'} source - Lead acquisition source channel
 * @property {string} createdAt - ISO date timestamp of lead creation
 * @property {string} [dateAdded] - YYYY-MM-DD format of lead creation for display/backward compatibility
 * @property {number} [value] - Financial value of the deal for pipeline calculations (optional, default 0)
 */

/**
 * @typedef {Object} LeadContextType
 * @property {Lead[]} leads - Global array of CRM leads.
 * @property {(leadData: Omit<Lead, 'id' | 'createdAt'>) => void} addLead - Inserts a new lead into state and storage.
 * @property {(id: string, updatedData: Partial<Lead>) => void} updateLead - Modifies an existing lead by ID.
 * @property {(id: string) => void} deleteLead - Removes a lead by ID from state and storage.
 * @property {(id: string) => Lead | undefined} getLeadById - Looks up and returns a single lead by ID.
 */

/** @type {React.Context<LeadContextType | undefined>} */
export const LeadContext = createContext(undefined);

// Initial mock dataset compliant with the new status and source schema
const MOCK_LEADS = [
  { id: '1', name: 'Sarah Connor', company: 'Cyberdyne Systems', status: 'Proposal Sent', email: 's.connor@cyberdyne.io', phone: '+1 555-0199', source: 'Website', createdAt: '2026-06-10T12:00:00.000Z', dateAdded: '2026-06-10', value: 12500 },
  { id: '2', name: 'Bruce Wayne', company: 'Wayne Enterprises', status: 'Meeting Scheduled', email: 'bruce@waynecorp.com', phone: '+1 555-0100', source: 'Referral', createdAt: '2026-06-11T12:00:00.000Z', dateAdded: '2026-06-11', value: 45000 },
  { id: '3', name: 'Peter Parker', company: 'Daily Bugle', status: 'New', email: 'p.parker@bugle.com', phone: '+1 555-0144', source: 'LinkedIn', createdAt: '2026-06-12T12:00:00.000Z', dateAdded: '2026-06-12', value: 1800 },
  { id: '4', name: 'Tony Stark', company: 'Stark Industries', status: 'Won', email: 'tony@stark.com', phone: '+1 555-0177', source: 'Email Campaign', createdAt: '2026-06-13T12:00:00.000Z', dateAdded: '2026-06-13', value: 95000 },
  { id: '5', name: 'Clark Kent', company: 'Daily Planet', status: 'Contacted', email: 'clark@dailyplanet.com', phone: '+1 555-0188', source: 'Cold Call', createdAt: '2026-06-14T12:00:00.000Z', dateAdded: '2026-06-14', value: 3400 },
  { id: '6', name: 'Diana Prince', company: 'Themyscira Antiques', status: 'Won', email: 'diana@museum.org', phone: '+1 555-0190', source: 'Other', createdAt: '2026-06-15T12:00:00.000Z', dateAdded: '2026-06-15', value: 15000 },
];

/**
 * LeadProvider component that manages CRM leads states and exposes CRUD handlers.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components to wrap.
 * @returns {React.ReactElement} The LeadProvider element.
 */
export function LeadProvider({ children }) {
  const [leads, setLeads] = useState(() => {
    try {
      const storedLeads = localStorage.getItem('nexus_crm_leads');
      return storedLeads ? JSON.parse(storedLeads) : MOCK_LEADS;
    } catch {
      return MOCK_LEADS;
    }
  });

  // Sync leads list to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('nexus_crm_leads', JSON.stringify(leads));
    } catch (e) {
      console.warn('LocalStorage error syncing leads:', e);
    }
  }, [leads]);

  /**
   * Adds a new lead to the CRM.
   * Auto-assigns a unique ID, createdAt ISO date, and formatted dateAdded string.
   * 
   * @param {Omit<Lead, 'id' | 'createdAt'>} leadData - Field parameters for the new lead.
   */
  const addLead = (leadData) => {
    const isoDate = new Date().toISOString();
    const formattedDate = isoDate.split('T')[0];
    
    // Generate UUID string using standard crypto or fallback to timestamp string
    const generatedId = typeof crypto?.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Date.now().toString();

    const newLead = {
      ...leadData,
      id: generatedId,
      createdAt: isoDate,
      dateAdded: leadData.dateAdded || formattedDate,
      value: typeof leadData.value === 'number' ? leadData.value : (parseFloat(leadData.value) || 0),
    };

    setLeads((prev) => [newLead, ...prev]);
  };

  /**
   * Modifies fields of an existing lead matching the given ID.
   * 
   * @param {string} id - The ID of the lead to update.
   * @param {Partial<Lead>} updatedData - Dictionary of modified properties.
   */
  const updateLead = (id, updatedData) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          const finalValue = updatedData.value !== undefined
            ? (typeof updatedData.value === 'number' ? updatedData.value : parseFloat(updatedData.value) || 0)
            : lead.value;

          return {
            ...lead,
            ...updatedData,
            value: finalValue,
          };
        }
        return lead;
      })
    );
  };

  /**
   * Deletes a lead record by ID.
   * 
   * @param {string} id - Unique identifier to delete.
   */
  const deleteLead = (id) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  /**
   * Retrieves a single lead object by ID.
   * 
   * @param {string} id - The ID of the lead to fetch.
   * @returns {Lead | undefined} The matching lead object, or undefined if not found.
   */
  const getLeadById = (id) => {
    return leads.find((lead) => lead.id === id);
  };

  return (
    <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead, getLeadById }}>
      {children}
    </LeadContext.Provider>
  );
}

/**
 * Custom React hook to consume the LeadContext safely.
 * Throws a descriptive error if called outside a LeadProvider block.
 * 
 * @returns {LeadContextType} The active leads context value.
 * @throws {Error} If called outside LeadProvider.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider wrapper');
  }
  return context;
}
