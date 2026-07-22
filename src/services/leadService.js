import api from './api.js';

/**
 * Service methods managing Lead CRUD and metrics dashboard data operations.
 * Automatically unwraps Axios response payloads to return response.data.
 */
const leadService = {
  /**
   * Retrieves leads with filters, search, and pagination.
   * 
   * @param {Object} params - Query params (status, search, page, limit, sortBy, sortOrder).
   */
  async getLeads(params) {
    const response = await api.get('/api/leads', { params });
    return response.data;
  },

  /**
   * Creates a new lead in the CRM.
   */
  async createLead(leadData) {
    const response = await api.post('/api/leads', leadData);
    return response.data;
  },

  /**
   * Updates an existing lead.
   */
  async updateLead(id, leadData) {
    const response = await api.put(`/api/leads/${id}`, leadData);
    return response.data;
  },

  /**
   * Fast-patches status of a single lead.
   */
  async updateLeadStatus(id, status) {
    const response = await api.patch(`/api/leads/${id}/status`, { status });
    return response.data;
  },

  /**
   * Deletes a lead record by ID.
   */
  async deleteLead(id) {
    const response = await api.delete(`/api/leads/${id}`);
    return response.data;
  },

  /**
   * Fetches computed pipeline summary statistics.
   */
  async getLeadStats() {
    const response = await api.get('/api/leads/stats');
    return response.data;
  },

  /**
   * Fetches monthly lead trends for charts.
   */
  async getMonthlyStats() {
    const response = await api.get('/api/leads/monthly-stats');
    return response.data;
  }
};

export default leadService;
