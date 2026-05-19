import type { TransformerUpdate } from '@/lib/types';
import { AlertTriangle, Zap, Activity } from 'lucide-react';

type Alarm = {
  imei: number;
  device: string;
  site: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  detail: string;
  timestamp: string;
};

function extractAlarms(updates: TransformerUpdate[]): Alarm[] {
  const alarms: Alarm[] = [];
  for (const u of updates) {
    const { reading, alarms: a, spec } = u;
    if (a.V_AB_alarm) {
      alarms.push({ imei: u.imei, device: u.device, site: u.site.city, type: 'Overvoltage L-L (AB)', severity: 'critical', detail: `V_AB = ${reading.V_AB} V (limit ${spec.V2_limit} V)`, timestamp: u.timestamp });
    }
    if (a.V_BC_alarm) {
      alarms.push({ imei: u.imei, device: u.device, site: u.site.city, type: 'Overvoltage L-L (BC)', severity: 'critical', detail: `V_BC = ${reading.V_BC} V (limit ${spec.V2_limit} V)`, timestamp: u.timestamp });
    }
    if (a.V_AC_alarm) {
      alarms.push({ imei: u.imei, device: u.device, site: u.site.city, type: 'Overvoltage L-L (AC)', severity: 'critical', detail: `V_AC = ${reading.V_AC} V (limit ${spec.V2_limit} V)`, timestamp: u.timestamp });
    }
    if (a.I_A_alarm) {
      alarms.push({ imei: u.imei, device: u.device, site: u.site.city, type: 'Overcurrent (Phase A)', severity: 'critical', detail: `I_A = ${reading.I_A} A (limit ${spec.I_limit} A)`, timestamp: u.timestamp });
    }
    if (a.I_B_alarm) {
      alarms.push({ imei: u.imei, device: u.device, site: u.site.city, type: 'Overcurrent (Phase B)', severity: 'critical', detail: `I_B = ${reading.I_B} A (limit ${spec.I_limit} A)`, timestamp: u.timestamp });
    }
    if (a.I_C_alarm) {
      alarms.push({ imei: u.imei, device: u.device, site: u.site.city, type: 'Overcurrent (Phase C)', severity: 'critical', detail: `I_C = ${reading.I_C} A (limit ${spec.I_limit} A)`, timestamp: u.timestamp });
    }
    if (!a.any && reading.load_percent > 85) {
      alarms.push({ imei: u.imei, device: u.device, site: u.site.city, type: 'High load', severity: 'warning', detail: `${reading.load_percent.toFixed(1)}% of rated ${spec.RP}`, timestamp: u.timestamp });
    }
    if (Math.abs(reading.F - 50) > 0.5) {
      alarms.push({ imei: u.imei, device: u.device, site: u.site.city, type: 'Frequency deviation', severity: 'warning', detail: `${reading.F.toFixed(2)} Hz (nominal 50.00 Hz)`, timestamp: u.timestamp });
    }
  }
  return alarms.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 } as const;
    return order[a.severity] - order[b.severity];
  });
}

const SEV = {
  critical: { color: 'text-canar-red', bg: 'bg-canar-red/5', icon: <AlertTriangle className="size-4" />, label: 'CRITICAL' },
  warning: { color: 'text-canar-amber', bg: 'bg-canar-amber/5', icon: <Activity className="size-4" />, label: 'WARNING' },
  info: { color: 'text-canar-blue', bg: 'bg-canar-blue/5', icon: <Zap className="size-4" />, label: 'INFO' },
} as const;

export function AlarmsTable({ updates }: { updates: TransformerUpdate[] }) {
  const alarms = extractAlarms(updates);

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
        <div className="font-semibold text-zinc-900">Active Alarms</div>
        <div className="text-xs text-zinc-500 tabular-tight">{alarms.length} event{alarms.length === 1 ? '' : 's'}</div>
      </div>
      {alarms.length === 0 ? (
        <div className="px-4 py-12 text-center text-zinc-400 text-sm">
          No active alarms — all transformers operating normally.
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
          {alarms.map((a, i) => {
            const sev = SEV[a.severity];
            return (
              <div key={i} className={`px-4 py-3 flex items-start gap-3 ${sev.bg}`}>
                <div className={`shrink-0 mt-0.5 ${sev.color}`}>{sev.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${sev.color}`}>{sev.label}</span>
                    <span className="text-sm font-medium text-zinc-900">{a.type}</span>
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    <span className="font-medium">{a.device}</span> · {a.site} · {a.detail}
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 shrink-0 tabular-tight">
                  {new Date(a.timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
