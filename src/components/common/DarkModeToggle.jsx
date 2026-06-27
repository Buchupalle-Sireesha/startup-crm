import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 select-none">
      <span className="hidden md:inline text-xs font-bold text-slate-500 dark:text-slate-450 tracking-tight">
        {isDarkMode ? "Dark Mode" : "Light Mode"}
      </span>

      {/* Mobile Toggle Button (44x44px Touch Target) */}
      <button
        onClick={toggleTheme}
        className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 active:scale-95 transition-all cursor-pointer"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? (
          <Sun size={18} className="text-amber-500 stroke-[2]" />
        ) : (
          <Moon size={18} className="text-slate-500 stroke-[2]" />
        )}
      </button>

      {/* Desktop Sliding Toggle */}
      <button
        onClick={toggleTheme}
        className="hidden md:flex relative items-center justify-between w-14 h-7 p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-hidden transition-colors duration-200 shadow-inner"
        aria-label="Toggle Dark Mode"
      >
        {/* Sliding thumb */}
        <span
          className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-transform duration-200 ease-out flex items-center justify-center border border-slate-100 dark:border-slate-800 ${
            isDarkMode ? "translate-x-7" : "translate-x-0"
          }`}
        >
          {isDarkMode ? (
            <Moon size={11} className="text-blue-500 fill-blue-500/10 stroke-[2.5]" />
          ) : (
            <Sun size={11} className="text-amber-500 fill-amber-500/10 stroke-[2.5]" />
          )}
        </span>

        {/* Static Background Icons */}
        <Sun size={11} className={`ml-1.5 text-amber-550 transition-opacity duration-200 ${isDarkMode ? "opacity-30" : "opacity-100"}`} />
        <Moon size={11} className={`mr-1.5 text-blue-400 transition-opacity duration-200 ${isDarkMode ? "opacity-100" : "opacity-30"}`} />
      </button>
    </div>
  );
}
