import React from "react";
import {
  Users,
  Percent,
  Compass,
  DollarSign,
  Clock,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Indian Currency Formatter helper
const formatRupee = (value) => {
  if (value === undefined || value === null) return "₹0";
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

export default function StatsCards({ kpis }) {
  if (!kpis) return null;

  const {
    totalLeads,
    conversionRate,
    pipelineValue,
    wonRevenue,
    avgSalesCycle,
    lostRate,
  } = kpis;

  // Configuration for each card
  const cards = [
    {
      title: "Total Leads",
      value: totalLeads.value.toLocaleString(),
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50",
      trend: totalLeads.growth,
      trendType: "percentage",
      isLowerBetter: false,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.value}%`,
      icon: Percent,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50",
      trend: conversionRate.trend,
      trendType: "diff",
      isLowerBetter: false,
    },
    {
      title: "Pipeline Value",
      value: formatRupee(pipelineValue.value),
      icon: Compass,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50",
      trend: pipelineValue.growth,
      trendType: "percentage",
      isLowerBetter: false,
    },
    {
      title: "Won Revenue",
      value: formatRupee(wonRevenue.value),
      icon: DollarSign,
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900/50",
      trend: wonRevenue.growth,
      trendType: "percentage",
      isLowerBetter: false,
    },
    {
      title: "Average Sales Cycle",
      value: `${avgSalesCycle.value} Days`,
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50",
      trend: avgSalesCycle.trend,
      trendType: "days",
      isLowerBetter: true,
    },
    {
      title: "Lost Rate",
      value: `${lostRate.value}%`,
      icon: TrendingDown,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50",
      trend: lostRate.trend,
      trendType: "diff",
      isLowerBetter: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        const trendVal = card.trend;
        
        // Determine color of trend badge
        let isPositiveTrend = trendVal > 0;
        if (card.isLowerBetter) {
          isPositiveTrend = trendVal < 0;
        }

        const isZero = trendVal === 0;

        let trendClass;
        let trendText;

        if (isZero) {
          trendClass = "text-slate-400 bg-slate-50 dark:bg-slate-800 dark:text-slate-500";
          trendText = "0%";
        } else if (isPositiveTrend) {
          trendClass = "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40";
          if (card.trendType === "percentage") trendText = `+${trendVal}%`;
          else if (card.trendType === "diff") trendText = `+${trendVal}%`;
          else if (card.trendType === "days") trendText = `${trendVal} days`; // Negative diff is good (e.g. -2 days)
        } else {
          trendClass = "text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40";
          if (card.trendType === "percentage") trendText = `${trendVal}%`;
          else if (card.trendType === "diff") trendText = `${trendVal}%`;
          else if (card.trendType === "days") trendText = `+${trendVal} days`; // Positive diff is bad
        }

        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider leading-tight">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border shrink-0 ${card.iconBg}`}>
                <IconComponent size={16} className={card.iconColor} />
              </div>
            </div>

            <div className="mt-3.5 space-y-1.5">
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {card.value}
              </h4>
              <div className="flex flex-wrap items-center gap-1">
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold leading-none ${trendClass}`}>
                  {!isZero && (isPositiveTrend ? (
                    <ArrowUpRight size={10} className="stroke-[3]" />
                  ) : (
                    <ArrowDownRight size={10} className="stroke-[3]" />
                  ))}
                  {trendText}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  vs last period
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
