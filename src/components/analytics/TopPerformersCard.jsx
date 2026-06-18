import React from "react";
import { Trophy, Award, Medal, Circle } from "lucide-react";

const formatRupee = (value) => {
  if (value === undefined || value === null) return "₹0";
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

export default function TopPerformersCard({ data = [] }) {
  // Find highest performer value to compute relative progress bars
  const maxRevenue = data.length > 0 ? data[0].value : 1;

  // Rank icon selectors
  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-lg border border-amber-100 dark:border-amber-900/30">
          <Trophy size={14} className="fill-amber-500/10" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg border border-slate-200 dark:border-slate-750">
          <Medal size={14} />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="p-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-500 rounded-lg border border-orange-100 dark:border-orange-900/30">
          <Award size={14} />
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100 dark:border-slate-800">
        #{rank}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return "SR";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[360px]">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Top Sales Performers
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
          Ranking of sales representatives by closed won deal value
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          No top performers recorded
        </div>
      ) : (
        <div className="flex-1 space-y-4 pt-6">
          {data.map((performer) => {
            const relativePercent = Math.round((performer.value / maxRevenue) * 100);

            return (
              <div key={performer.rank} className="flex items-center gap-3.5">
                {/* Ranking Badge */}
                <div className="shrink-0 w-8 flex justify-center">
                  {getRankBadge(performer.rank)}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 flex items-center justify-center text-xs font-black border border-blue-100 dark:border-blue-900/30 shrink-0">
                  {getInitials(performer.name)}
                </div>

                {/* Representative Name & Progress */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-850 dark:text-slate-200 truncate">
                      {performer.name}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white tab-nums">
                      {formatRupee(performer.value)}
                    </span>
                  </div>
                  
                  {/* Progress bar comparison */}
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${relativePercent}%` }}
                    />
                  </div>
                  
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-none">
                    {performer.count} deals won
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
