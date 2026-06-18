import React from 'react';

/**
 * PipelineOverview aggregates lead statistics by their sales pipeline status
 * and displays a visual horizontal bar chart with colored segments representing
 * the proportion of leads in each stage, alongside a detailed metric legend.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.leads - Array of lead objects containing status and value.
 * @returns {React.ReactElement} The PipelineOverview component.
 */
export default function PipelineOverview({ leads = [] }) {
  // Define the canonical pipeline stages in progress order based on LeadContext values
  const STAGES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

  // Styling properties for each stage
  const stageMeta = {
    New: { colorClass: 'bg-slate-300 dark:bg-slate-700', dotClass: 'bg-slate-400 dark:bg-slate-500', textClass: 'text-slate-600 dark:text-slate-400' },
    Contacted: { colorClass: 'bg-blue-400 dark:bg-blue-600', dotClass: 'bg-blue-500 dark:bg-blue-500', textClass: 'text-blue-600 dark:text-blue-400' },
    'Meeting Scheduled': { colorClass: 'bg-purple-400 dark:bg-purple-600', dotClass: 'bg-purple-500 dark:bg-purple-500', textClass: 'text-purple-600 dark:text-purple-400' },
    'Proposal Sent': { colorClass: 'bg-amber-400 dark:bg-amber-600', dotClass: 'bg-amber-500 dark:bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400' },
    Won: { colorClass: 'bg-emerald-400 dark:bg-emerald-600', dotClass: 'bg-emerald-500 dark:bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400' },
    Lost: { colorClass: 'bg-rose-400 dark:bg-rose-600', dotClass: 'bg-rose-500 dark:bg-rose-500', textClass: 'text-rose-600 dark:text-rose-400' },
  };

  // Safe helper to extract and clean lead financial values
  const getLeadValue = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Calculate totals and aggregates
  const totalLeads = leads.length;
  
  const aggregates = STAGES.reduce((acc, stage) => {
    acc[stage] = { count: 0, totalValue: 0 };
    return acc;
  }, {});

  leads.forEach((lead) => {
    const stage = lead.status;
    const value = getLeadValue(lead.value);
    
    // Fallback if status isn't matched in defined canonical stages
    const matchedStage = STAGES.find(s => s.toLowerCase() === (stage || '').toLowerCase());
    if (matchedStage) {
      aggregates[matchedStage].count += 1;
      aggregates[matchedStage].totalValue += value;
    }
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6 select-none h-full transition-colors duration-200">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Pipeline Overview</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Visual stage distribution and combined lead valuation</p>
      </div>

      {/* Segmented Progress Bar */}
      <div className="w-full">
        {totalLeads > 0 ? (
          <div className="h-4.5 w-full flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-850 border border-slate-50 dark:border-slate-800 shadow-inner">
            {STAGES.map((stage) => {
              const count = aggregates[stage].count;
              const percentage = (count / totalLeads) * 100;
              const meta = stageMeta[stage];

              if (count === 0) return null;

              return (
                <div
                  key={stage}
                  style={{ width: `${percentage}%` }}
                  className={`${meta.colorClass} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:brightness-95 cursor-pointer relative group/segment`}
                  title={`${stage}: ${count} leads (${percentage.toFixed(0)}%)`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/segment:block bg-slate-800 dark:bg-slate-950 text-white dark:text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap z-10 shadow-md border border-slate-700/30">
                    {stage}: {count} leads (${aggregates[stage].totalValue.toLocaleString()})
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-4.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">No leads to display</span>
          </div>
        )}
      </div>

      {/* Legend / Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
        {STAGES.map((stage) => {
          const count = aggregates[stage].count;
          const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
          const totalVal = aggregates[stage].totalValue;
          const meta = stageMeta[stage];

          return (
            <div key={stage} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${meta.dotClass}`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">{stage}</span>
              </div>
              <div className="pl-4 space-y-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">
                  {count} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">({percentage.toFixed(0)}%)</span>
                </p>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  ${totalVal.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

