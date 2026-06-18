import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { CHART_THEME } from "../../constants/analyticsColors";

const formatRupee = (value) => {
  if (value === 0) return "₹0";
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`; // e.g. ₹4.8L
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}k`; // e.g. ₹25k
  }
  return `₹${value}`;
};

const formatFullRupee = (value) => {
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

// Custom Tooltip component
const CustomAreaTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-0.5">
        <p className="font-bold text-slate-800 dark:text-slate-200">{data.month}</p>
        <p className="text-emerald-600 dark:text-emerald-450 font-extrabold text-sm">
          {formatFullRupee(data.Revenue)} Won Revenue
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChartCard({ data = [] }) {
  const { isDarkMode } = useTheme();

  // Resolve styles depending on dark mode state
  const gridStroke = isDarkMode ? CHART_THEME.grid.dark : CHART_THEME.grid.light;
  const textStroke = isDarkMode ? CHART_THEME.text.dark : CHART_THEME.text.light;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[360px]">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Won Revenue Analytics
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
          Monthly breakdown of closed-won deal volume
        </p>
      </div>

      <div className="h-64 w-full pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis
              dataKey="month"
              stroke={textStroke}
              fontSize={11}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke={textStroke}
              fontSize={11}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatRupee}
              dx={-8}
            />
            <Tooltip content={<CustomAreaTooltip />} />
            <Area
              type="monotone"
              dataKey="Revenue"
              stroke="#22C55E"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
