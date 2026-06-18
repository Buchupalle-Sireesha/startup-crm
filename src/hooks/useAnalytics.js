import { useState, useEffect, useMemo, useCallback } from "react";
import { useLeads } from "../context/LeadContext";
import {
  normalizeStatus,
  getStatusDistribution,
  getMonthlyLeads,
  getConversionByMonth,
  getRevenueByMonth,
  getPipelineValue,
  getWonRevenue,
  getAverageSalesCycle,
  getLostRate,
  getLeadSourceStats,
  getFunnelData,
  getSalesVelocity,
  getForecastRevenue,
  getTopPerformers,
  getActivityHeatmapData,
} from "../utils/analyticsHelpers";

export function useAnalytics() {
  const { leads = [] } = useLeads();
  const [timeframe, setTimeframe] = useState("Last 30 Days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Simulate dashboard loading state for visual polishing on filter changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 350); // Small, pleasant delay for skeleton rendering
    return () => clearTimeout(timer);
  }, [timeframe, customStartDate, customEndDate]);

  // Determine current and previous date ranges
  const dateRanges = useMemo(() => {
    const now = new Date();
    // Normalize now to the end of the day
    now.setHours(23, 59, 59, 999);

    let start = new Date();
    let end = new Date(now);

    let prevStart = new Date();
    let prevEnd = new Date();

    switch (timeframe) {
      case "Last 7 Days":
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        
        prevEnd.setDate(now.getDate() - 7);
        prevEnd.setHours(23, 59, 59, 999);
        prevStart.setDate(now.getDate() - 13);
        prevStart.setHours(0, 0, 0, 0);
        break;

      case "Last 30 Days":
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        
        prevEnd.setDate(now.getDate() - 30);
        prevEnd.setHours(23, 59, 59, 999);
        prevStart.setDate(now.getDate() - 59);
        prevStart.setHours(0, 0, 0, 0);
        break;

      case "Last 90 Days":
        start.setDate(now.getDate() - 89);
        start.setHours(0, 0, 0, 0);
        
        prevEnd.setDate(now.getDate() - 90);
        prevEnd.setHours(23, 59, 59, 999);
        prevStart.setDate(now.getDate() - 179);
        prevStart.setHours(0, 0, 0, 0);
        break;

      case "This Year":
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        
        prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        prevStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
        break;

      case "Custom Range":
        if (customStartDate) {
          start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
        } else {
          start.setDate(now.getDate() - 30);
          start.setHours(0, 0, 0, 0);
        }
        
        if (customEndDate) {
          end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
        } else {
          end = new Date(now);
        }
        
        const durationMs = end.getTime() - start.getTime();
        prevEnd = new Date(start.getTime() - 1);
        prevStart = new Date(start.getTime() - durationMs);
        break;

      default:
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        
        prevEnd.setDate(now.getDate() - 30);
        prevEnd.setHours(23, 59, 59, 999);
        prevStart.setDate(now.getDate() - 59);
        prevStart.setHours(0, 0, 0, 0);
    }

    return { start, end, prevStart, prevEnd };
  }, [timeframe, customStartDate, customEndDate]);

  // Filter leads for current and previous period
  const filteredLeads = useMemo(() => {
    const { start, end, prevStart, prevEnd } = dateRanges;

    const current = [];
    const previous = [];

    leads.forEach((lead) => {
      if (!lead || !lead.createdAt) return;
      const createdDate = new Date(lead.createdAt);
      if (isNaN(createdDate.getTime())) return;

      if (createdDate >= start && createdDate <= end) {
        current.push(lead);
      } else if (createdDate >= prevStart && createdDate <= prevEnd) {
        previous.push(lead);
      }
    });

    return { current, previous };
  }, [leads, dateRanges]);

  // Check if there are no leads at all in the system
  const isSystemEmpty = leads.length === 0;

  // Check if current filter yielded no results
  const isFilteredEmpty = filteredLeads.current.length === 0;

  // Compute growth and trend metrics helper
  const calculateGrowth = useCallback((currentVal, previousVal) => {
    if (previousVal === 0) {
      return currentVal > 0 ? 100 : 0;
    }
    return Math.round(((currentVal - previousVal) / previousVal) * 100);
  }, []);

  // Compute all analytics metrics
  const analyticsData = useMemo(() => {
    const current = filteredLeads.current;
    const previous = filteredLeads.previous;

    // --- KPI 1: Total Leads ---
    const totalLeads = current.length;
    const prevTotalLeads = previous.length;
    const totalLeadsGrowth = calculateGrowth(totalLeads, prevTotalLeads);

    // --- KPI 2: Conversion Rate ---
    const getConvRate = (list) => {
      if (list.length === 0) return 0;
      const wonCount = list.filter((l) => normalizeStatus(l.status) === "Won").length;
      return (wonCount / list.length) * 100;
    };
    const conversionRate = Math.round(getConvRate(current));
    const prevConversionRate = Math.round(getConvRate(previous));
    // Percentage points diff for rates
    const conversionRateTrend = conversionRate - prevConversionRate;

    // --- KPI 3: Pipeline Value ---
    const pipelineValue = getPipelineValue(current);
    const prevPipelineValue = getPipelineValue(previous);
    const pipelineValueGrowth = calculateGrowth(pipelineValue, prevPipelineValue);

    // --- KPI 4: Won Revenue ---
    const wonRevenue = getWonRevenue(current);
    const prevWonRevenue = getWonRevenue(previous);
    const wonRevenueGrowth = calculateGrowth(wonRevenue, prevWonRevenue);

    // --- KPI 5: Average Sales Cycle ---
    const avgSalesCycle = getAverageSalesCycle(current);
    const prevAvgSalesCycle = getAverageSalesCycle(previous);
    // Difference in days (negative is good/faster)
    const salesCycleTrend = avgSalesCycle - prevAvgSalesCycle;

    // --- KPI 6: Lost Rate ---
    const lostRate = getLostRate(current);
    const prevLostRate = getLostRate(previous);
    const lostRateTrend = lostRate - prevLostRate;

    // --- Monthly Trends (calculated from all leads to maintain chronological 6-month scale) ---
    // Note: We feed all leads so the chronological 6-month window is populated fully
    const monthlyLeads = getMonthlyLeads(leads);
    const conversionByMonth = getConversionByMonth(leads);
    const revenueByMonth = getRevenueByMonth(leads);

    // --- Distribution, Funnel, Sources, Velocity, Heatmap, Performers ---
    const statusDistribution = getStatusDistribution(current);
    const leadSourceStats = getLeadSourceStats(current);
    const funnelData = getFunnelData(current);
    
    const salesVelocity = getSalesVelocity(current);
    const prevSalesVelocity = getSalesVelocity(previous);
    const salesVelocityGrowth = calculateGrowth(salesVelocity, prevSalesVelocity);

    const forecast = getForecastRevenue(current);
    const topPerformers = getTopPerformers(current);
    const activityHeatmap = getActivityHeatmapData(current);

    return {
      kpis: {
        totalLeads: { value: totalLeads, growth: totalLeadsGrowth },
        conversionRate: { value: conversionRate, trend: conversionRateTrend },
        pipelineValue: { value: pipelineValue, growth: pipelineValueGrowth },
        wonRevenue: { value: wonRevenue, growth: wonRevenueGrowth },
        avgSalesCycle: { value: avgSalesCycle, trend: salesCycleTrend },
        lostRate: { value: lostRate, trend: lostRateTrend },
      },
      statusDistribution,
      monthlyLeads,
      conversionByMonth,
      revenueByMonth,
      leadSourceStats,
      funnelData,
      salesVelocity: { value: salesVelocity, growth: salesVelocityGrowth },
      forecast,
      topPerformers,
      activityHeatmap,
    };
  }, [filteredLeads, leads, calculateGrowth]);

  return {
    timeframe,
    setTimeframe,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    loading,
    isSystemEmpty,
    isFilteredEmpty,
    data: analyticsData,
  };
}
