import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService.js';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../services/api.js';

export const AuthContext = createContext(undefined);

/**
 * AuthProvider component that wraps the app and manages authentication state.
 * Syncs the token to localStorage and handles session restoration on mount.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('crm-token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session on mount if token is found
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('crm-token');
      if (storedToken) {
        try {
          const response = await authService.getProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Clear credentials on token verification failure
          localStorage.removeItem('crm-token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  /**
   * Logs in a user, saves token to localStorage, updates state, and redirects to dashboard.
   */
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('crm-token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(data.message || 'Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      const errMsg = getErrorMessage(error);
      toast.error(errMsg);
      throw error;
    }
  };

  /**
   * Registers a new user, saves token to localStorage, updates state, and redirects to dashboard.
   */
  const register = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('crm-token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(data.message || 'Account registered successfully');
      navigate('/dashboard');
    } catch (error) {
      const errMsg = getErrorMessage(error);
      toast.error(errMsg);
      throw error;
    }
  };

  /**
   * Logs out the user, clearing local storage and auth states, then redirects to /login.
   */
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom React hook to consume the AuthContext safely.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider wrapper');
  }
  return context;
}
