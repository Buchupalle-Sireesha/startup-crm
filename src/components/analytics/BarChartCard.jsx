import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { CHART_THEME } from "../../constants/analyticsColors";

// Custom Tooltip component
const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-0.5">
        <p className="font-bold text-slate-800 dark:text-slate-200">{data.month}</p>
        <p className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">
          {data.Leads} Leads
        </p>
      </div>
    );
  }
  return null;
};

export default function BarChartCard({ data = [] }) {
  const { isDarkMode } = useTheme();

  // Resolve styles depending on dark mode state
  const gridStroke = isDarkMode ? CHART_THEME.grid.dark : CHART_THEME.grid.light;
  const textStroke = isDarkMode ? CHART_THEME.text.dark : CHART_THEME.text.light;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[360px]">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Monthly Leads Trend
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
          Volume of incoming CRM leads over the last 6 months
        </p>
      </div>

      <div className="h-64 w-full pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
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
              dx={-8}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar
              dataKey="Leads"
              fill={CHART_THEME.primary}
              radius={[6, 6, 0, 0]}
              animationDuration={800}
              barSize={32}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  className="hover:opacity-90 transition-opacity duration-200"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
