import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar Component
 * Controlled input with search icon, clear button, and built-in debounce functionality.
 *
 * @param {Object} props
 * @param {string} props.value - The parent's search query state value.
 * @param {Function} props.onChange - Callback function triggered with the debounced query.
 */
export default function SearchBar({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local state when the prop value changes externally (e.g. filters are cleared)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the input updates by 300ms before notifying the parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative flex-1 max-w-md w-full">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
        <Search size={18} />
      </span>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Search by name, company, or email..."
        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/35 transition-all duration-200"
        aria-label="Search leads by name, company, or email"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          aria-label="Clear search text"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
