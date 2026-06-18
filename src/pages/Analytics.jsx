import React from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import AnalyticsFilters from "../components/analytics/AnalyticsFilters";
import StatsCards from "../components/analytics/StatsCards";
import PieChartCard from "../components/analytics/PieChartCard";
import FunnelChartCard from "../components/analytics/FunnelChartCard";
import BarChartCard from "../components/analytics/BarChartCard";
import LineChartCard from "../components/analytics/LineChartCard";
import RevenueChartCard from "../components/analytics/RevenueChartCard";
import LeadSourceChart from "../components/analytics/LeadSourceChart";
import SalesVelocityCard from "../components/analytics/SalesVelocityCard";
import ForecastCard from "../components/analytics/ForecastCard";
import ActivityHeatmap from "../components/analytics/ActivityHeatmap";
import TopPerformersCard from "../components/analytics/TopPerformersCard";
import EmptyAnalyticsState from "../components/analytics/EmptyAnalyticsState";
import LoadingSkeleton from "../components/analytics/LoadingSkeleton";
import toast from "react-hot-toast";

export default function Analytics() {
  const {
    timeframe,
    setTimeframe,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    loading,
    isSystemEmpty,
    isFilteredEmpty,
    data,
  } = useAnalytics();

  const handleExport = () => {
    // Generate CSV data from leads if needed, or trigger visual download
    toast.success("Preparing PDF/CSV analytics report for download...");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-905 dark:text-slate-50 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Track sales performance, lead distributions, and revenue growth trends.
          </p>
        </div>
      </div>

      {/* Date Filters Section */}
      <AnalyticsFilters
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        onExport={handleExport}
      />

      {/* Content Rendering based on state */}
      {loading ? (
        <LoadingSkeleton />
      ) : isFilteredEmpty || isSystemEmpty ? (
        <EmptyAnalyticsState />
      ) : (
        <div className="space-y-8">
          {/* Section 1: KPI Cards */}
          <StatsCards kpis={data.kpis} />

          {/* Section 2: Pie Chart & Funnel Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartCard data={data.statusDistribution} />
            <FunnelChartCard data={data.funnelData} />
          </div>

          {/* Section 3: Monthly Leads & Conversion Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartCard data={data.monthlyLeads} />
            <LineChartCard data={data.conversionByMonth} />
          </div>

          {/* Section 4: Revenue & Lead Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChartCard data={data.revenueByMonth} />
            <LeadSourceChart data={data.leadSourceStats} />
          </div>

          {/* Section 5: Activity Heatmap & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityHeatmap data={data.activityHeatmap} />
            <TopPerformersCard data={data.topPerformers} />
          </div>

          {/* Section 6: Forecast & Sales Velocity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ForecastCard forecastData={data.forecast} />
            <SalesVelocityCard velocity={data.salesVelocity} />
          </div>
        </div>
      )}
    </div>
  );
}
