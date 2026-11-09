import React, { useState } from "react";
import { Calendar as CalendarIcon, Info } from "lucide-react";

export default function ActivityHeatmap({ data = [] }) {
  const [activeHoverDay, setActiveHoverDay] = useState(null);

  const now = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  // Find start day of the week for the 1st of the current month
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...

  // Weekday headers
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Activity density color selector helper
  const getColorClass = (count) => {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700";
    if (count <= 2) return "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50";
    if (count <= 4) return "bg-emerald-300 dark:bg-emerald-800/40 border-emerald-400 dark:border-emerald-700/50 hover:bg-emerald-400 dark:hover:bg-emerald-700/70";
    if (count <= 7) return "bg-emerald-500 dark:bg-emerald-600 border-emerald-500 hover:bg-emerald-655";
    return "bg-emerald-750 dark:bg-emerald-500 border-emerald-800 hover:bg-emerald-800 dark:hover:bg-emerald-400";
  };

  // Build grid blocks
  const gridBlocks = [];

  // 1. Add blank leading blocks for padding
  for (let i = 0; i < startDayOfWeek; i++) {
    gridBlocks.push({ isPadding: true, key: `pad-${i}` });
  }

  // 2. Add actual days with mapped activities
  data.forEach((dayData) => {
    const dayNum = parseInt(dayData.date.split("-")[2], 10);
    gridBlocks.push({
      isPadding: false,
      key: dayData.date,
      date: dayData.date,
      dayNum,
      count: dayData.count,
      created: dayData.created,
      meetings: dayData.meetings,
      calls: dayData.calls,
    });
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[360px]">
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
            <CalendarIcon size={16} className="text-blue-600 dark:text-blue-400" />
            CRM Activity Heatmap
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
            {currentMonthName} {currentYear}
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
          Daily audit logs of created leads, contacted calls, and scheduled meetings
        </p>
      </div>

      {/* Heatmap Grid */}
      <div className="flex-1 flex flex-col justify-center py-6 relative">
        {/* Calendar Grid Headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
          {weekDays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {gridBlocks.map((block) => {
            if (block.isPadding) {
              return <div key={block.key} className="aspect-square rounded-lg bg-transparent" />;
            }

            const colorClass = getColorClass(block.count);
            const isHovered = activeHoverDay && activeHoverDay.key === block.key;

            return (
              <div
                key={block.key}
                onMouseEnter={() => setActiveHoverDay(block)}
                onMouseLeave={() => setActiveHoverDay(null)}
                className={`aspect-square rounded-lg transition-all duration-150 cursor-pointer border border-transparent flex items-center justify-center text-[10px] font-bold ${colorClass} ${
                  block.count > 0 ? "text-slate-800 dark:text-white" : "text-slate-300 dark:text-slate-700"
                } ${isHovered ? "ring-2 ring-blue-500 scale-105 shadow-sm" : ""}`}
              >
                {block.dayNum}
              </div>
            );
          })}
        </div>

        {/* Hover Floating Tooltip */}
        {activeHoverDay && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-64 bg-slate-900 dark:bg-slate-950 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 z-30 space-y-1.5 animate-fade-in pointer-events-none">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {new Date(activeHoverDay.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-xs font-extrabold text-emerald-400">
              {activeHoverDay.count} Total Activities
            </p>
            <div className="border-t border-slate-800/80 pt-1.5 grid grid-cols-3 gap-2 text-[10px]">
              <div>
                <span className="block font-bold text-slate-450">Created</span>
                <span className="text-xs font-extrabold text-slate-100">{activeHoverDay.created}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-450">Meetings</span>
                <span className="text-xs font-extrabold text-slate-100">{activeHoverDay.meetings}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-450">Calls</span>
                <span className="text-xs font-extrabold text-slate-100">{activeHoverDay.calls}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <span className="flex items-center gap-1">
          <Info size={11} className="text-slate-400" />
          Hover day for details
        </span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800 border" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 border" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-300 dark:bg-emerald-800 border" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-750 dark:bg-emerald-500 border" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
