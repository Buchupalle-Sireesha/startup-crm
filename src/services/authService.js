import api from './api.js';

/**
 * Service methods managing user auth network operations.
 * Automatically unwraps Axios response payloads to return response.data.
 */
const authService = {
  /**
   * Registers a new user account.
   */
  async register(name, email, password) {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Authenticates user credentials.
   */
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Handles user logout.
   * Clears stored JWT token from client local storage.
   */
  logout() {
    localStorage.removeItem('crm-token');
  },

  /**
   * Fetches profile of the currently logged-in user.
   */
  async getProfile() {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  /**
   * Updates profile details (name and/or password).
   */
  async updateProfile(data) {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  }
};

export default authService;
