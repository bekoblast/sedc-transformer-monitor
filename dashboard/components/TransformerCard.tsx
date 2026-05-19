import Link from 'next/link';
import type { TransformerUpdate } from '@/lib/types';
import { getStatus, PHASE_COLORS } from '@/lib/types';
import { Zap, Activity, Gauge } from 'lucide-react';

type Props = { update: TransformerUpdate };

const STATUS_BADGE = {
  ok: { bg: 'bg-canar-green/10', border: 'border-canar-green/30', dot: 'bg-canar-green', text: 'text-canar-green', label: 'OK' },
  warning: { bg: 'bg-canar-amber/10', border: 'border-canar-amber/30', dot: 'bg-canar-amber', text: 'text-canar-amber', label: 'WARN' },
  critical: { bg: 'bg-canar-red/10', border: 'border-canar-red/30', dot: 'bg-canar-red', text: 'text-canar-red', label: 'ALARM' },
  inactive: { bg: 'bg-zinc-100', border: 'border-zinc-300', dot: 'bg-zinc-400', text: 'text-zinc-500', label: 'OFFLINE' },
};

export function TransformerCard({ update }: Props) {
  const status = getStatus(update);
  const s = STATUS_BADGE[status];
  const load = update.reading.load_percent;
  const loadColor =
    load > 100 ? 'bg-canar-red' : load > 85 ? 'bg-canar-amber' : 'bg-canar-green';

  return (
    <Link
      href={`/transformer/${update.imei}`}
      className="bg-white rounded-lg border border-zinc-200 hover:border-canar-blue/40 hover:shadow-md transition-all p-4 block group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate group-hover:text-canar-blue transition-colors">
            {update.device}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            {update.site.city} · {update.spec.RP}
          </div>
        </div>
        <div className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${s.bg} ${s.border} ${s.text} flex items-center gap-1`}>
          <span className={`size-1.5 rounded-full ${s.dot} ${status === 'ok' ? 'live-dot' : ''}`} />
          {s.label}
        </div>
      </div>

      {/* Load bar */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Load</span>
          <span className="text-lg font-bold tabular-tight text-zinc-900 leading-none">
            {load.toFixed(1)}<span className="text-xs text-zinc-400 font-medium">%</span>
          </span>
        </div>
        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${loadColor}`}
            style={{ width: `${Math.min(100, load)}%` }}
          />
        </div>
      </div>

      {/* Phase chips */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {(['A', 'B', 'C'] as const).map((p) => {
          const v = update.reading[`V_${p}` as 'V_A'];
          const i = update.reading[`I_${p}` as 'I_A'];
          return (
            <div key={p} className="rounded border border-zinc-200 p-1.5 text-center">
              <div
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: PHASE_COLORS[p] }}
              >
                Ph {p}
              </div>
              <div className="text-xs font-bold tabular-tight text-zinc-900 leading-tight mt-0.5">{v.toFixed(0)}<span className="text-[9px] text-zinc-400">V</span></div>
              <div className="text-[10px] tabular-tight text-zinc-500 leading-tight">{i.toFixed(0)}<span className="text-[9px] text-zinc-400">A</span></div>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100">
        <Stat icon={<Zap className="size-3.5" />} value={`${(update.reading.P_TOTAL / 1000).toFixed(1)} kW`} />
        <Stat icon={<Gauge className="size-3.5" />} value={`${update.reading.F.toFixed(1)} Hz`} />
        <Stat icon={<Activity className="size-3.5" />} value={`PF ${update.reading.SPF.toFixed(2)}`} />
      </div>
    </Link>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-zinc-600">
      <span className="text-zinc-400">{icon}</span>
      <span className="tabular-tight font-medium truncate">{value}</span>
    </div>
  );
}
