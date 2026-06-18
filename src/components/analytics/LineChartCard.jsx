import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { CHART_THEME } from "../../constants/analyticsColors";

// Custom Tooltip component
const CustomLineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-0.5">
        <p className="font-bold text-slate-800 dark:text-slate-205">{data.month}</p>
        <p className="text-green-600 dark:text-green-400 font-extrabold text-sm">
          {data.Conversion}% Conversion
        </p>
      </div>
    );
  }
  return null;
};

export default function LineChartCard({ data = [] }) {
  const { isDarkMode } = useTheme();

  // Resolve styles depending on dark mode state
  const gridStroke = isDarkMode ? CHART_THEME.grid.dark : CHART_THEME.grid.light;
  const textStroke = isDarkMode ? CHART_THEME.text.dark : CHART_THEME.text.light;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[360px]">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Conversion Trend
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
          Month-over-month ratio of won deals to total leads generated
        </p>
      </div>

      <div className="h-64 w-full pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
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
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              dx={-8}
            />
            <Tooltip content={<CustomLineTooltip />} />
            <Line
              type="monotone"
              dataKey="Conversion"
              stroke={CHART_THEME.success}
              strokeWidth={3}
              dot={{ stroke: CHART_THEME.success, strokeWidth: 2, r: 4, fill: "#FFFFFF" }}
              activeDot={{ stroke: CHART_THEME.success, strokeWidth: 2, r: 6, fill: CHART_THEME.success }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
