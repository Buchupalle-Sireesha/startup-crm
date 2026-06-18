

/**
 * StatsCard displays a key performance metric with an associated icon,
 * current value, and a percentage change showing the trend compared to the previous month.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.title - The label or description of the metric (e.g., "Total Leads").
 * @param {string|number} props.value - The metric value to display (e.g., "$245,800" or "1,482").
 * @param {React.ComponentType} props.icon - A Lucide React icon component representing the metric.
 * @param {string} props.change - The percentage change vs last month (e.g., "+12.5%", "-0.5%").
 * @param {'primary'|'success'|'warning'|'danger'} [props.color='primary'] - Theme color for the icon background.
 * @returns {React.ReactElement} The StatsCard component.
 */
export default function StatsCard({ title, value, icon: Icon, change, color = 'primary' }) {
  // Determine if trend is positive or negative
  const isNegative = change.trim().startsWith('-');

  // Map color prop to specific Tailwind classes for icon container styling (supporting dark mode)
  const colorStyles = {
    primary: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100/80 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/30',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 dark:hover:bg-emerald-900/30',
    warning: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 dark:hover:bg-amber-900/30',
    danger: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 dark:hover:bg-rose-900/30',
  };

  const selectedColorStyle = colorStyles[color] || colorStyles.primary;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-36 select-none group">
      {/* Top row: Label and Icon */}
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-200">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${selectedColorStyle}`}>
          <Icon size={18} className="stroke-[2.25]" />
        </div>
      </div>

      {/* Bottom row: Value and Trend */}
      <div className="space-y-1.5">
        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-105 tracking-tight leading-none">
          {value}
        </h3>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-extrabold inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md border ${
              isNegative
                ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/25 dark:text-rose-400 dark:border-rose-900/40'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/40'
            }`}
          >
            {change}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-550 font-medium">vs last month</span>
        </div>
      </div>
    </div>
  );
}
