import React from "react";
import { Calendar, Download, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function AnalyticsFilters({
  timeframe,
  setTimeframe,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  onExport,
}) {
  const handleExportClick = () => {
    if (onExport) {
      onExport();
    } else {
      toast.success("Analytics report exported successfully!");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        {/* Timeframe Select */}
        <div className="relative w-full sm:w-56">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-505">
            <Calendar size={15} />
          </span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="This Year">This Year</option>
            <option value="Custom Range">Custom Range</option>
          </select>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <ChevronDown size={14} />
          </span>
        </div>

        {/* Custom Range Date Pickers */}
        {timeframe === "Custom Range" && (
          <div className="flex flex-wrap items-center gap-2 animate-fade-in w-full sm:w-auto">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                From
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500 w-full sm:w-auto"
              />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                To
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500 w-full sm:w-auto"
              />
            </div>
          </div>
        )}
      </div>

      {/* Export Action */}
      <button
        onClick={handleExportClick}
        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <Download size={14} />
        Export Report
      </button>
    </div>
  );
}
