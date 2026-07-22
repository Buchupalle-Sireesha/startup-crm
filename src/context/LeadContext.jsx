import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import leadService from '../services/leadService.js';
import { useAuth } from './AuthContext.jsx';
import { toast } from 'react-hot-toast';

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
   * 
   * @param {Object} params - Query filters, page, sorting.
   */
  const fetchLeads = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      const response = await leadService.getLeads(params);
      setLeads(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch leads from server');
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
      setLeads((prev) => [response.data, ...prev]);
      toast.success('Successfully added lead!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add lead');
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
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id || lead._id === id ? response.data : lead))
      );
      toast.success('Updated lead details successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update lead');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a lead record by ID.
   */
  const deleteLead = async (id) => {
    try {
      setIsLoading(true);
      await leadService.deleteLead(id);
      setLeads((prev) => prev.filter((lead) => lead.id !== id && lead._id !== id));
      toast.success('Lead removed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Looks up a single lead in active state by ID.
   */
  const getLeadById = (id) => {
    return leads.find((lead) => lead.id === id || lead._id === id);
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        isLoading,
        pagination,
        fetchLeads,
        addLead,
        updateLead,
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
