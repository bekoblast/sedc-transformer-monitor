'use client';

import { useTransformerStream } from '@/hooks/useTransformerStream';
import { StatusCard } from '@/components/StatusCard';
import { TransformerCard } from '@/components/TransformerCard';
import { AlarmsTable } from '@/components/AlarmsTable';
import { TransformerMap } from '@/components/TransformerMap';
import { LiveIndicator } from '@/components/LiveIndicator';
import { AboutBanner } from '@/components/AboutBanner';
import { getStatus } from '@/lib/types';
import { Zap, CheckCircle2, AlertTriangle, AlertOctagon, PowerOff } from 'lucide-react';

export default function OverviewPage() {
  const { transformers, source, connected } = useTransformerStream();
  const updates = Array.from(transformers.values()).sort((a, b) => a.device.localeCompare(b.device));

  const total = updates.length;
  const totalRated = updates.reduce((sum, u) => sum + u.spec.rated_kva, 0);
  const counts = updates.reduce(
    (acc, u) => {
      const s = getStatus(u);
      acc[s]++;
      return acc;
    },
    { ok: 0, warning: 0, critical: 0, inactive: 0 }
  );

  return (
    <div className="space-y-6">
      <AboutBanner />

      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Transformer Fleet Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Live 3-phase monitoring of {total} transformer{total === 1 ? '' : 's'} (total rated capacity: {totalRated.toLocaleString()} kVA).
          </p>
        </div>
        <LiveIndicator source={source} connected={connected} />
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatusCard label="Total" value={total} color="blue" icon={<Zap className="size-6 text-white" />} />
        <StatusCard label="Online" value={counts.ok} color="green" icon={<CheckCircle2 className="size-6 text-white" />} />
        <StatusCard label="Inactive" value={counts.inactive} color="gray" icon={<PowerOff className="size-6 text-white" />} />
        <StatusCard label="Warning" value={counts.warning} color="amber" icon={<AlertTriangle className="size-6 text-white" />} />
        <StatusCard label="Alarms" value={counts.critical} color="red" icon={<AlertOctagon className="size-6 text-white" />} />
      </div>

      {/* Map + Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200">
              <div className="font-semibold text-zinc-900">Transformer Locations</div>
              <div className="text-xs text-zinc-500">Markers color-coded by load (blue → green → amber → red)</div>
            </div>
            <TransformerMap updates={updates} height={480} />
          </div>
        </div>
        <div>
          <AlarmsTable updates={updates} />
        </div>
      </div>

      {/* Transformer cards grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-zinc-900">All Transformers</h2>
          <div className="text-xs text-zinc-500">Click a card for per-phase details</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {updates.map((u) => (
            <TransformerCard key={u.imei} update={u} />
          ))}
        </div>
      </div>
    </div>
  );
}
