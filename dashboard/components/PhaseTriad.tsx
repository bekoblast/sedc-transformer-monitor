// 3-phase value display — A / B / C side by side, color-coded with the
// traditional electrical phase colors (red / yellow / blue).
// Used for voltages, currents, power factors, etc.

import { PHASE_COLORS } from '@/lib/types';

type Props = {
  values: { A: number; B: number; C: number };
  unit: string;
  max: number;             // scale max for the bar
  warningAt?: number;      // value at which bar turns amber
  criticalAt?: number;     // value at which bar turns red
  label: string;
  decimals?: number;
  sublabel?: string;
};

const PHASES: Array<keyof typeof PHASE_COLORS> = ['A', 'B', 'C'];

export function PhaseTriad({
  values, unit, max, warningAt, criticalAt, label, decimals = 1, sublabel,
}: Props) {
  // Compute imbalance: (max - min) / avg * 100
  const arr = [values.A, values.B, values.C];
  const avg = arr.reduce((a, b) => a + b, 0) / 3;
  const imbalance = avg > 0 ? ((Math.max(...arr) - Math.min(...arr)) / avg) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">{label}</div>
          {sublabel && <div className="text-xs text-zinc-500">{sublabel}</div>}
        </div>
        <div className="text-xs text-zinc-500 tabular-tight">
          imbalance <strong className={imbalance > 5 ? 'text-canar-amber' : 'text-zinc-700'}>{imbalance.toFixed(1)}%</strong>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PHASES.map((phase) => {
          const v = values[phase];
          const pct = Math.max(0, Math.min(100, (v / max) * 100));
          const isCritical = criticalAt !== undefined && v >= criticalAt;
          const isWarning = !isCritical && warningAt !== undefined && v >= warningAt;
          const barColor = isCritical
            ? '#ed0a0a'
            : isWarning
            ? '#efab16'
            : PHASE_COLORS[phase];
          return (
            <div key={phase} className="flex flex-col">
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: PHASE_COLORS[phase] }}
                >
                  {phase}
                </span>
                {isCritical && (
                  <span className="text-[9px] font-bold uppercase text-canar-red tracking-wider">!</span>
                )}
              </div>
              <div className="text-xl font-bold tabular-tight text-zinc-900 leading-none">
                {v.toFixed(decimals)}
                <span className="text-xs font-medium text-zinc-400 ml-0.5">{unit}</span>
              </div>
              {/* Visual bar */}
              <div className="mt-2 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
