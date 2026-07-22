import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Configure standard Axios client instance.
 * Automatically loads the backend base URL from environment variables.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

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
