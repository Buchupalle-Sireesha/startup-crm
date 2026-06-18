import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { CHART_THEME } from "../../constants/analyticsColors";

// Custom Tooltip component
const CustomSourceTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-0.5">
        <p className="font-bold text-slate-800 dark:text-slate-200">{data.name}</p>
        <p className="font-extrabold text-sm" style={{ color: data.color }}>
          {data.count} Leads
        </p>
      </div>
    );
  }
  return null;
};

export default function LeadSourceChart({ data = [] }) {
  const { isDarkMode } = useTheme();
  const textStroke = isDarkMode ? CHART_THEME.text.dark : CHART_THEME.text.light;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[360px]">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Lead Source Distribution
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
          Top lead acquisition channels ranked by count
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          No source data available
        </div>
      ) : (
        <div className="h-64 w-full pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                stroke={textStroke}
                fontSize={11}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <Tooltip content={<CustomSourceTooltip />} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={16}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  style={{
                    fill: textStroke,
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                  dx={6}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
