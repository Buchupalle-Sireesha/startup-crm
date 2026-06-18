import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector, Tooltip } from "recharts";

// Render active expanded sector on hover
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 2}
      outerRadius={outerRadius + 8} // expand by 8px outwards
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

// Custom Tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
        <p className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {data.count} Leads ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function PieChartCard({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Compute total leads across all statuses
  const totalLeads = data.reduce((sum, item) => sum + item.count, 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[420px]">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Status Distribution
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Breakdown of generated leads across pipeline stages
        </p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-6 pt-4">
        {/* Doughnut Chart representation */}
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationDuration={600}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center absolute text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              {totalLeads}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
              Total Leads
            </span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex-1 w-full max-w-[280px] space-y-2.5">
          {data.map((entry, index) => (
            <div
              key={index}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              className={`flex items-center justify-between p-2 rounded-xl border border-transparent transition-all duration-200 cursor-pointer ${
                activeIndex === index
                  ? "bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-semibold text-slate-650 dark:text-slate-350 truncate">
                  {entry.name}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {entry.count}{" "}
                <span className="text-slate-400 dark:text-slate-505 font-medium ml-1">
                  ({entry.percentage}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
