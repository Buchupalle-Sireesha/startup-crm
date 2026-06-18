import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-6 py-12 transition-colors duration-200">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-100 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/10 rounded-full blur-xl opacity-75 animate-pulse"></div>
            <div className="relative bg-red-50 dark:bg-red-950/20 p-6 rounded-full border border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400">
              <AlertCircle size={56} className="stroke-[1.5]" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/35 uppercase tracking-wider">
            Error 404
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-200 dark:shadow-none"
          >
            <Home size={18} />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 transition-all border border-transparent dark:border-slate-700"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
