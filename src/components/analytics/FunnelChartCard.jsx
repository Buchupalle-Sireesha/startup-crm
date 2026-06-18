import React from "react";
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Cell,
  LabelList,
  Tooltip,
} from "recharts";
import { ArrowDown } from "lucide-react";

// Custom Tooltip component for Funnel
const CustomFunnelTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
        <p className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.fill }} />
          {data.stage}
        </p>
        <p className="text-slate-700 dark:text-slate-350">
          Total leads: <span className="font-bold text-slate-900 dark:text-white">{data.count}</span>
        </p>
        <p className="text-slate-500 dark:text-slate-400">
          Conversion from Top: <span className="font-bold text-blue-600 dark:text-blue-400">{data.conversionRate}%</span>
        </p>
        {data.stage !== "New" && (
          <p className="text-slate-500 dark:text-slate-400">
            Conversion from Prev: <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.stageConversion}%</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function FunnelChartCard({ data = [] }) {
  // Map our data to Recharts format: needs value, name, and color/fill
  const chartData = data.map((item) => ({
    value: item.count,
    name: item.stage,
    stage: item.stage,
    count: item.count,
    conversionRate: item.conversionRate,
    stageConversion: item.stageConversion,
    fill: item.fill,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[420px]">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Sales Pipeline Funnel
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
          Cumulative conversion rates and stage drop-offs
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        {/* Recharts Funnel visualization */}
        <div className="lg:col-span-7 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Tooltip content={<CustomFunnelTooltip />} />
              <Funnel
                dataKey="value"
                data={chartData}
                isAnimationActive
                animationDuration={600}
              >
                <Cell />
                <LabelList
                  position="right"
                  fill="#94A3B8"
                  stroke="none"
                  dataKey="name"
                  style={{ fontSize: "11px", fontWeight: "bold" }}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Stats Column */}
        <div className="lg:col-span-5 space-y-3.5">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
            Conversion Metrics
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {data.map((item, idx) => {
              const isFirst = idx === 0;
              return (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-350">
                      {item.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="font-extrabold text-slate-900 dark:text-slate-50 tabular-nums">
                      {item.count}
                    </span>
                    
                    {!isFirst ? (
                      <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                        <span className="font-bold text-emerald-650 dark:text-emerald-400">
                          {item.stageConversion}%
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 inline-flex items-center gap-0.5" title="Drop-off Rate">
                          <ArrowDown size={10} className="text-rose-500" />
                          {item.dropOff}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-bold min-w-[70px]">
                        Baseline
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
