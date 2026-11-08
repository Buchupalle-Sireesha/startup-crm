import axios from 'axios';

/**
 * Configure standard Axios client instance.
 * Automatically resolves the backend base URL:
 * - If VITE_API_URL is configured, use it.
 * - In local development mode (DEV), defaults to local backend 'http://localhost:5000'.
 * - In production mode, defaults to deployed Render backend 'https://startup-crm-backend-1k2o.onrender.com'.
 */
export const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  return 'https://startup-crm-backend-1k2o.onrender.com';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

/**
 * Parses Axios error objects to return user-friendly, descriptive messages.
 * Maps exact cases: invalid credentials, access denied, invalid endpoint, duplicate records,
 * database failure, CORS, network offline, or timeout.
 * 
 * @param {Object} error - The caught Axios error.
 * @returns {string} User-facing error message.
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  // Check if server responded with an error status code (4xx, 5xx)
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      return data?.message || 'Invalid email or password.';
    }
    if (status === 403) {
      return data?.message || 'Access denied. Account is deactivated or unauthorized.';
    }
    if (status === 404) {
      return data?.message || 'Invalid API endpoint. The requested resource was not found.';
    }
    if (status === 409) {
      return data?.message || 'A record with these details already exists.';
    }
    if (status === 400) {
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors.map(err => err.msg || err.message).join(', ');
      }
      return data?.message || 'Invalid request format or missing data.';
    }
    if (status === 500) {
      const errorMsg = data?.message?.toLowerCase() || '';
      if (errorMsg.includes('database') || errorMsg.includes('mongo') || errorMsg.includes('connection')) {
        return 'Database connection failure. Please contact administrator.';
      }
      return data?.message || 'Internal Server Error. Please try again later.';
    }
    return data?.message || `Server error (${status}). Please try again.`;
  }

  // Check if request was made but no response was received (Network / CORS / Server offline)
  if (error.request) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. The server took too long to respond.';
    }
    return 'Cannot connect to server. Check your connection or CORS configuration.';
  }

  return error.message || 'An unexpected error occurred.';
};

// Request Interceptor: Inject JWT token into Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle session expiration cleanly without redundant notifications
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If unauthorized response status is returned on authenticated session
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes('/api/auth/login') ||
        error.config?.url?.includes('/api/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('crm-token');
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
