import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Plus } from "lucide-react";

export default function EmptyAnalyticsState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs text-center transition-all duration-300">
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl mb-4 border border-blue-100 dark:border-blue-900/50 animate-bounce-slow">
        <BarChart3 size={36} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
        No analytics available yet
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
        Add your first lead to start tracking business performance, conversion rates, and revenue trends.
      </p>
      <button
        onClick={() => navigate("/leads")}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        <Plus size={16} />
        Add Lead
      </button>
    </div>
  );
}
