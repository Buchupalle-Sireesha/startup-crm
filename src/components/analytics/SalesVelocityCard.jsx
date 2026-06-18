import React from "react";
import { Zap, ArrowUpRight, ArrowDownRight, HelpCircle } from "lucide-react";

const formatRupee = (value) => {
  if (value === undefined || value === null) return "₹0";
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

export default function SalesVelocityCard({ velocity }) {
  if (!velocity) return null;

  const { value, growth } = velocity;

  const isPositive = growth > 0;
  const isZero = growth === 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[280px]">
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
            <Zap size={16} className="text-amber-500 fill-amber-500/20" />
            Sales Velocity
          </h3>
          <div
            className="group relative cursor-pointer text-slate-400 dark:text-slate-500 hover:text-slate-650"
            title="Formula: (Opportunities * Win Rate * Avg Deal Size) / Avg Sales Cycle"
          >
            <HelpCircle size={15} />
            <div className="absolute right-0 bottom-6 hidden group-hover:block bg-slate-800 text-white text-[10px] p-2.5 rounded-lg w-52 z-30 shadow-xl leading-normal">
              Sales Velocity calculates the speed at which value is added to your business daily based on active pipeline metrics.
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
          Expected revenue generation rate per day
        </p>
      </div>

      <div className="my-5">
        <h4 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          {formatRupee(value)}
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 ml-1">
            / day
          </span>
        </h4>

        <div className="flex items-center gap-1.5 mt-2">
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-bold ${
              isZero
                ? "text-slate-400 bg-slate-50 dark:bg-slate-800"
                : isPositive
                ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
                : "text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40"
            }`}
          >
            {!isZero && (isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
            {isZero ? "0%" : `${isPositive ? "+" : ""}${growth}%`}
          </span>
          <span className="text-xs text-slate-450 dark:text-slate-500">
            vs previous period
          </span>
        </div>
      </div>

      <div className="p-3.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
          How to accelerate
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          Increase opportunities in pipeline, improve conversion win rates, raise prices (deal size), or close deals faster.
        </p>
      </div>
    </div>
  );
}
