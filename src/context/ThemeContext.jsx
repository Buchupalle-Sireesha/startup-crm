import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @typedef {Object} ThemeContextType
 * @property {boolean} isDarkMode - True if the theme is dark mode.
 * @property {() => void} toggleTheme - Function to toggle between light and dark modes.
 */

/** @type {React.Context<ThemeContextType | undefined>} */
export const ThemeContext = createContext(undefined);

/**
 * ThemeProvider component that wraps the React application and provides theme states.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components to be wrapped.
 * @returns {React.ReactElement} The ThemeProvider element.
 */
export function ThemeProvider({ children }) {
  // Read state from localStorage, defaulting to system preference if not set
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const storedTheme = localStorage.getItem('nexus_crm_theme');
      if (storedTheme !== null) {
        return storedTheme === 'true' || JSON.parse(storedTheme) === true;
      }
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply/remove 'dark' class from html document element and sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexus_crm_theme', JSON.stringify(isDarkMode));
    } catch (e) {
      console.warn('LocalStorage error syncing theme:', e);
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  /**
   * Toggles the theme between light and dark mode.
   */
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom React hook to consume the ThemeContext safely.
 * Throws a descriptive error if called outside a ThemeProvider block.
 * 
 * @returns {ThemeContextType} The active theme context value.
 * @throws {Error} If called outside ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider wrapper');
  }
  return context;
}
