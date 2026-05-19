'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTransformerStream } from '@/hooks/useTransformerStream';
import { PhaseTriad } from '@/components/PhaseTriad';
import { PowerCard } from '@/components/PowerCard';
import { TimeseriesChart } from '@/components/TimeseriesChart';
import { TransformerMap } from '@/components/TransformerMap';
import { LiveIndicator } from '@/components/LiveIndicator';
import { getStatus, PHASE_COLORS } from '@/lib/types';
import { ChevronLeft, Battery, Cpu, Radio, MapPin, Zap, Gauge, Activity, Sigma } from 'lucide-react';

const MAX_HISTORY = 40;

type HistoryPoint = {
  time: string;
  V_A: number; V_B: number; V_C: number;
  I_A: number; I_B: number; I_C: number;
  P_TOTAL: number;
  F: number;
};

export function TransformerDetailView() {
  const params = useParams<{ imei: string }>();
  const imei = parseInt(params.imei, 10);
  const { transformers, source, connected } = useTransformerStream();
  const update = transformers.get(imei);

  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const lastTsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!update) return;
    if (update.timestamp === lastTsRef.current) return;
    lastTsRef.current = update.timestamp;
    const { reading } = update;
    setHistory((h) => {
      const next: HistoryPoint[] = [
        ...h,
        {
          time: new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          V_A: reading.V_A, V_B: reading.V_B, V_C: reading.V_C,
          I_A: reading.I_A, I_B: reading.I_B, I_C: reading.I_C,
          P_TOTAL: reading.P_TOTAL / 1000,
          F: reading.F,
        },
      ];
      return next.slice(-MAX_HISTORY);
    });
  }, [update]);

  if (!update) {
    return (
      <div className="text-center py-24 text-zinc-500">
        <p>Waiting for transformer data...</p>
        <Link href="/" className="text-canar-blue hover:underline text-sm mt-2 inline-block">
          ← Back to overview
        </Link>
      </div>
    );
  }

  const status = getStatus(update);
  const statusBadge =
    status === 'critical' ? 'bg-canar-red text-white' :
    status === 'warning' ? 'bg-canar-amber text-white' :
    status === 'inactive' ? 'bg-canar-gray text-white' :
    'bg-canar-green text-white';

  const r = update.reading;
  const s = update.spec;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-canar-blue gap-1 mb-2">
          <ChevronLeft className="size-4" />
          Back to overview
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-zinc-900">{update.device}</h1>
              <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider ${statusBadge}`}>
                {status === 'critical' ? 'ALARM' : status.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-500 font-medium">{s.RP} · {s.LRV}</span>
            </div>
            <div className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
              <MapPin className="size-3.5" />
              {update.site.name_en} · {update.site.city}
            </div>
          </div>
          <LiveIndicator source={source} connected={connected} />
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <PowerCard label="Active Power" value={r.P_TOTAL / 1000} unit="kW" icon={<Zap className="size-5" />} accent="blue" decimals={2} />
        <PowerCard label="Apparent" value={r.S_TOTAL / 1000} unit="kVA" icon={<Sigma className="size-5" />} accent="purple" decimals={2} />
        <PowerCard label="Reactive" value={r.Q_TOTAL / 1000} unit="kVAR" icon={<Activity className="size-5" />} accent="amber" decimals={2} />
        <PowerCard label="Power Factor" value={r.SPF} unit="" icon={<Gauge className="size-5" />} accent="green" decimals={3} />
        <PowerCard label="Frequency" value={r.F} unit="Hz" icon={<Activity className="size-5" />} accent="blue" decimals={2} />
        <PowerCard label="Net Energy" value={r.Net_E} unit="kWh" icon={<Battery className="size-5" />} accent="gray" decimals={0} />
      </div>

      {/* Phase triads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PhaseTriad
          label="Voltage (Line - Neutral)"
          sublabel={`Rated ${(parseFloat(s.LRV) / Math.sqrt(3)).toFixed(0)} V`}
          values={{ A: r.V_A, B: r.V_B, C: r.V_C }}
          unit="V"
          max={parseFloat(s.LRV) / Math.sqrt(3) * 1.2}
          warningAt={parseFloat(s.LRV) / Math.sqrt(3) * 1.05}
          decimals={1}
        />
        <PhaseTriad
          label="Voltage (Line - Line)"
          sublabel={`Limit ${s.V2_limit} V`}
          values={{ A: r.V_AB, B: r.V_BC, C: r.V_AC }}
          unit="V"
          max={s.V2_limit * 1.1}
          warningAt={s.V2_limit * 0.95}
          criticalAt={s.V2_limit}
          decimals={1}
        />
        <PhaseTriad
          label="Current"
          sublabel={`Limit ${s.I_limit} A`}
          values={{ A: r.I_A, B: r.I_B, C: r.I_C }}
          unit="A"
          max={s.I_limit * 1.15}
          warningAt={s.I_limit * 0.85}
          criticalAt={s.I_limit}
          decimals={1}
        />
      </div>

      {/* Power factor + voltage angles triads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PhaseTriad
          label="Power Factor (per phase)"
          values={{ A: r.PF_A, B: r.PF_B, C: r.PF_C }}
          unit=""
          max={1}
          warningAt={0.88}
          decimals={3}
        />
        <PhaseTriad
          label="Voltage Angle"
          sublabel="ideal 120° apart"
          values={{ A: r.VAngle_AB, B: r.VAngle_BC, C: r.VAngle_AC }}
          unit="°"
          max={180}
          decimals={1}
        />
      </div>

      {/* Time series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MultiSeriesChart
          title="Phase Voltage (L-N) over time"
          data={history.map((h) => ({ time: h.time, A: h.V_A, B: h.V_B, C: h.V_C }))}
          unit="V"
        />
        <MultiSeriesChart
          title="Phase Current over time"
          data={history.map((h) => ({ time: h.time, A: h.I_A, B: h.I_B, C: h.I_C }))}
          unit="A"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TimeseriesChart
          data={history.map((h) => ({ time: h.time, value: h.P_TOTAL }))}
          title="Active Power"
          unit=" kW"
          color="#8af321"
          yDomain={[0, Math.max(...history.map((h) => h.P_TOTAL), 50) * 1.1]}
        />
        <TimeseriesChart
          data={history.map((h) => ({ time: h.time, value: h.F }))}
          title="Frequency"
          unit=" Hz"
          color="#efab16"
          yDomain={[49, 51]}
        />
      </div>

      {/* Location + device info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200">
              <div className="font-semibold text-zinc-900">Location</div>
              <div className="text-xs text-zinc-500">{update.site.address}</div>
            </div>
            <TransformerMap updates={[update]} height={300} />
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 p-4">
          <div className="font-semibold text-zinc-900 mb-3">Device & site specifications</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SpecRow icon={<Cpu className="size-4" />} label="Model" value="Energy Meter v1.1" />
            <SpecRow icon={<Radio className="size-4" />} label="IMEI" value={String(update.imei)} />
            <SpecRow icon={<Zap className="size-4" />} label="Rated Power" value={s.RP} />
            <SpecRow icon={<Activity className="size-4" />} label="Reference Voltage" value={s.LRV} />
            <SpecRow icon={<Activity className="size-4" />} label="Reference Current" value={`${s.LRA} A`} />
            <SpecRow icon={<Gauge className="size-4" />} label="Load %" value={`${r.load_percent.toFixed(1)}%`} />
            <SpecRow icon={<MapPin className="size-4" />} label="Latitude" value={update.site.lat.toFixed(6)} />
            <SpecRow icon={<MapPin className="size-4" />} label="Longitude" value={update.site.long.toFixed(6)} />
            <SpecRow icon={<MapPin className="size-4" />} label="Site (Arabic)" value={update.site.name_ar} dir="rtl" />
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
            Last reading <strong className="text-zinc-700 tabular-tight">{update.rtc}</strong> on{' '}
            <strong className="text-zinc-700 tabular-tight">{update.date}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ icon, label, value, dir }: { icon: React.ReactNode; label: string; value: string; dir?: 'rtl' }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <div className="text-zinc-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium text-zinc-900 truncate" dir={dir}>{value}</div>
      </div>
    </div>
  );
}

// Custom multi-series chart for 3-phase data
function MultiSeriesChart({ title, data, unit }: { title: string; data: Array<{ time: string; A: number; B: number; C: number }>; unit: string }) {
  // Use recharts directly here since the generic TimeseriesChart is single-series
  // Lazy import via dynamic if needed, but it's already a client component context
  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
        <div className="font-semibold text-zinc-900 text-sm">{title}</div>
        <div className="flex items-center gap-2 text-xs">
          {(['A', 'B', 'C'] as const).map((p) => (
            <span key={p} className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ background: PHASE_COLORS[p] }} />
              <span className="font-mono text-zinc-600">Ph {p}</span>
            </span>
          ))}
        </div>
      </div>
      <ThreePhaseChart data={data} unit={unit} />
    </div>
  );
}

// Imported lazily inside the file to keep it co-located
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function ThreePhaseChart({ data, unit }: { data: Array<{ time: string; A: number; B: number; C: number }>; unit: string }) {
  if (data.length === 0) {
    return (
      <div style={{ background: '#001b62', height: 280 }} className="flex items-center justify-center text-white/60 text-sm">
        Waiting for readings…
      </div>
    );
  }
  return (
    <div style={{ background: '#001b62', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="#545454" strokeOpacity={0.3} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            stroke="rgba(255,255,255,0.6)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.6)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
            tickFormatter={(v) => `${Math.round(v)}${unit}`}
          />
          <Tooltip
            contentStyle={{ background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 12 }}
            formatter={(v) => `${Number(v).toFixed(1)}${unit}`}
          />
          <Legend wrapperStyle={{ display: 'none' }} />
          <Line type="monotone" dataKey="A" stroke={PHASE_COLORS.A} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="B" stroke={PHASE_COLORS.B} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="C" stroke={PHASE_COLORS.C} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
