import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Configure standard Axios client instance.
 * Automatically loads the backend base URL from environment variables.
 */
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  return import.meta.env.VITE_API_URL || '';
};

const api = axios.create({
  baseURL: getBaseURL()
});

/**
 * Parses Axios error objects to return user-friendly, descriptive messages.
 * Maps exact cases: invalid credentials, access denied, invalid endpoint, database failure, CORS, network offline, etc.
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
      return data?.message || 'Access denied. You do not have permission.';
    }
    if (status === 404) {
      return data?.message || 'Invalid API endpoint. The requested resource was not found.';
    }
    if (status === 400) {
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors.map(err => err.msg || err.message).join(', ');
      }
      return data?.message || 'Invalid request or data format.';
    }
    if (status === 500) {
      // Check if it is database connection failure
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
    if (error.message === 'Network Error') {
      return 'Cannot connect to server. Check your connection or CORS configuration.';
    }
    return 'No response from server. Check your network or verify the backend is running.';
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

// Response Interceptor: Capture session timeouts (401) or network failures
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if unauthorized response status is returned (session expired/invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('crm-token');
      
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    } 
    // Check if network error (server is offline/unreachable)
    else if (!error.response) {
      toast.error('Cannot connect to server. Check your connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
