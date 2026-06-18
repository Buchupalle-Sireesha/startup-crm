import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800/80 rounded-lg"></div>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-3.5 w-24 bg-slate-100 dark:bg-slate-800/80 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Pie Chart & Funnel Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 min-h-[350px] flex flex-col"
          >
            <div className="space-y-2">
              <div className="h-4.5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800/80 rounded-md"></div>
            </div>
            <div className="flex-1 flex items-center justify-center pt-4">
              <div className="h-44 w-44 rounded-full border-[16px] border-slate-100 dark:border-slate-800/80 flex items-center justify-center">
                <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Bar Chart & Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 min-h-[350px] flex flex-col"
          >
            <div className="space-y-2">
              <div className="h-4.5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-3 w-56 bg-slate-100 dark:bg-slate-800/80 rounded-md"></div>
            </div>
            <div className="flex-1 flex items-end justify-between pt-8 px-4 gap-4">
              {[35, 60, 45, 90, 70, 50, 80, 65].map((height, idx) => (
                <div
                  key={idx}
                  className="bg-slate-200 dark:bg-slate-855 rounded-t-md flex-1"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Row 3: Area/Revenue Chart & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 min-h-[350px] flex flex-col">
          <div className="space-y-2">
            <div className="h-4.5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="h-3 w-60 bg-slate-100 dark:bg-slate-800/80 rounded-md"></div>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950/20 rounded-xl mt-4 border border-dashed border-slate-250 dark:border-slate-800 flex items-center justify-center">
            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 min-h-[350px]">
          <div className="space-y-2">
            <div className="h-4.5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="h-3 w-60 bg-slate-100 dark:bg-slate-800/80 rounded-md"></div>
          </div>
          <div className="space-y-4 pt-6">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                  <div className="h-3.5 w-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
