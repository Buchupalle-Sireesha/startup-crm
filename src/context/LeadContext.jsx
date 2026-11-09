import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import leadService from '../services/leadService.js';
import { useAuth } from './AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../services/api.js';

export const LeadContext = createContext(undefined);

/**
 * LeadProvider component that manages CRM leads states and exposes CRUD handlers via API.
 * Synchronizes list fetching with Auth token status.
 */
export function LeadProvider({ children }) {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });

  /**
   * Fetches leads from the backend using the leadService.
   * Defaults to fetching all recent leads (up to 100) sorted by creation date descending.
   * 
   * @param {Object} params - Query filters, page, sorting.
   */
  const fetchLeads = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      const queryParams = {
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...params
      };
      const response = await leadService.getLeads(queryParams);
      setLeads(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync leads query with authentication state
  useEffect(() => {
    if (token) {
      fetchLeads();
    } else {
      setLeads([]);
      setPagination({ total: 0, page: 1, limit: 20, pages: 0 });
    }
  }, [token, fetchLeads]);

  /**
   * Adds a new lead to the CRM.
   */
  const addLead = async (leadData) => {
    try {
      setIsLoading(true);
      const response = await leadService.createLead(leadData);
      const created = response.data;
      setLeads((prev) => [created, ...prev]);
      toast.success('Successfully added lead!');
      return created;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates an existing lead by ID.
   */
  const updateLead = async (id, updatedData) => {
    try {
      setIsLoading(true);
      const response = await leadService.updateLead(id, updatedData);
      const updated = response.data;
      setLeads((prev) =>
        prev.map((lead) => (lead._id === id || lead.id === id ? updated : lead))
      );
      toast.success('Updated lead details successfully!');
      return updated;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates lead status directly (fast patch) and updates state immediately.
   */
  const updateLeadStatus = async (id, status) => {
    try {
      const response = await leadService.updateLeadStatus(id, status);
      const updated = response.data;
      setLeads((prev) =>
        prev.map((lead) => (lead._id === id || lead.id === id ? updated : lead))
      );
      toast.success(`Status updated to "${status}"`);
      return updated;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  /**
   * Deletes a lead record by ID.
   */
  const deleteLead = async (id) => {
    try {
      setIsLoading(true);
      await leadService.deleteLead(id);
      setLeads((prev) => prev.filter((lead) => lead._id !== id && lead.id !== id));
      toast.success('Lead removed successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Looks up a single lead in active state by ID.
   */
  const getLeadById = (id) => {
    return leads.find((lead) => lead._id === id || lead.id === id);
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        isLoading,
        pagination,
        fetchLeads,
        refreshLeads: fetchLeads,
        addLead,
        updateLead,
        updateLeadStatus,
        deleteLead,
        getLeadById
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

/**
 * Custom React hook to consume the LeadContext safely.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider wrapper');
  }
  return context;
}
