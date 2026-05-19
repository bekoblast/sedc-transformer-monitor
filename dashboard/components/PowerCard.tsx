// Compact card showing one large power value with subtle unit + label.
// Used for P_TOTAL (kW), S_TOTAL (kVA), Net_E (kWh), Frequency (Hz), etc.

type Props = {
  label: string;
  value: number;
  unit: string;
  decimals?: number;
  icon?: React.ReactNode;
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  sub?: string;
};

const ACCENT = {
  blue: 'text-canar-blue bg-canar-blue/10',
  green: 'text-canar-green bg-canar-green/10',
  amber: 'text-canar-amber bg-canar-amber/10',
  red: 'text-canar-red bg-canar-red/10',
  purple: 'text-canar-purple bg-canar-purple/10',
  gray: 'text-zinc-600 bg-zinc-200/60',
} as const;

export function PowerCard({ label, value, unit, decimals = 1, icon, accent = 'blue', sub }: Props) {
  // Compact large numbers
  const formatted = Math.abs(value) >= 1_000_000
    ? `${(value / 1_000_000).toFixed(decimals)} M`
    : Math.abs(value) >= 10_000
    ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : value.toLocaleString(undefined, { maximumFractionDigits: decimals });

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-3 flex items-center gap-3">
      {icon && (
        <div className={`size-10 rounded-md flex items-center justify-center shrink-0 ${ACCENT[accent]}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xs text-zinc-500 uppercase tracking-wider">{label}</div>
        <div className="font-bold tabular-tight text-zinc-900 text-lg leading-tight">
          {formatted}<span className="text-xs font-medium text-zinc-400 ml-1">{unit}</span>
        </div>
        {sub && <div className="text-xs text-zinc-400 truncate">{sub}</div>}
      </div>
    </div>
  );
}
