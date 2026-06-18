import React from "react";
import { TrendingUp, Award, ShieldAlert, Activity } from "lucide-react";

const formatRupee = (value) => {
  if (value === undefined || value === null) return "₹0";
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

export default function ForecastCard({ forecastData }) {
  if (!forecastData) return null;

  const { forecast, confidenceScore } = forecastData;

  // Determine confidence status and colors
  let confidenceLevel = "Moderate";
  let confidenceColor = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30";
  let progressColor = "bg-amber-500";

  if (confidenceScore >= 75) {
    confidenceLevel = "High";
    confidenceColor = "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30";
    progressColor = "bg-emerald-500";
  } else if (confidenceScore < 40) {
    confidenceLevel = "Low";
    confidenceColor = "text-rose-700 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/30";
    progressColor = "bg-rose-500";
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[280px]">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
          <TrendingUp size={16} className="text-blue-500" />
          Revenue Forecasting
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
          Predictive analytics based on 6-month historical averages
        </p>
      </div>

      <div className="my-4 space-y-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">
          Predicted Revenue Next Month
        </span>
        <h4 className="text-3xl font-black text-slate-905 dark:text-slate-50 tracking-tight">
          {formatRupee(forecast)}
        </h4>
      </div>

      {/* Confidence Score Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Activity size={12} className="text-blue-500" />
            Confidence Score
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${confidenceColor}`}>
            {confidenceLevel} ({confidenceScore}%)
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} rounded-full transition-all duration-500`}
            style={{ width: `${confidenceScore}%` }}
          />
        </div>
      </div>

      <div className="text-[11px] text-slate-450 dark:text-slate-400 leading-normal border-t border-slate-100 dark:border-slate-800/80 pt-3 flex gap-1.5 items-start mt-2">
        <Award size={13} className="text-slate-400 mt-0.5 shrink-0" />
        <p>
          Calculations are adjusted by historical win rates and active pipeline deal weights to minimize prediction skew.
        </p>
      </div>
    </div>
  );
}
