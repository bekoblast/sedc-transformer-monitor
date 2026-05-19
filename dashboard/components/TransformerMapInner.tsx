'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TransformerUpdate } from '@/lib/types';
import { getStatus } from '@/lib/types';

// Load-percent → color: green (ok) → amber (warn) → red (critical)
function loadColor(loadPct: number, hasAlarm: boolean): string {
  if (hasAlarm) return '#ed0a0a';
  if (loadPct > 100) return '#ed0a0a';
  if (loadPct > 85) return '#efab16';
  if (loadPct > 60) return '#23b832';
  return '#2369a7';
}

function FitBounds({ updates }: { updates: TransformerUpdate[] }) {
  const map = useMap();
  useEffect(() => {
    if (updates.length === 0) return;
    const bounds = L.latLngBounds(updates.map((u) => [u.site.lat, u.site.long] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
  }, [updates, map]);
  return null;
}

export function TransformerMapInner({ updates, height = 480 }: { updates: TransformerUpdate[]; height?: number }) {
  // Khartoum metro area
  const center: [number, number] = useMemo(() => [15.59, 32.52], []);

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-zinc-200">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds updates={updates} />
        {updates.map((u) => {
          const status = getStatus(u);
          const color = loadColor(u.reading.load_percent, u.alarms.any);
          return (
            <CircleMarker
              key={u.imei}
              center={[u.site.lat, u.site.long]}
              radius={u.alarms.any ? 16 : 12}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor: color,
                fillOpacity: 0.92,
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold text-zinc-900">{u.device}</div>
                  <div className="text-xs text-zinc-600">{u.site.name_en}</div>
                  <div className="text-xs text-zinc-500 pt-1 border-t border-zinc-200 mt-1 space-y-0.5">
                    <div>Load: <strong className="text-zinc-900">{u.reading.load_percent.toFixed(1)}%</strong> ({u.spec.RP})</div>
                    <div>V<sub>avg</sub>: <strong className="text-zinc-900">{u.reading.V_AVG.toFixed(0)} V</strong></div>
                    <div>I<sub>avg</sub>: <strong className="text-zinc-900">{u.reading.I_AVG.toFixed(0)} A</strong></div>
                    <div>P<sub>tot</sub>: <strong className="text-zinc-900">{(u.reading.P_TOTAL / 1000).toFixed(1)} kW</strong></div>
                    <div>F: <strong className="text-zinc-900">{u.reading.F.toFixed(2)} Hz</strong></div>
                    {u.alarms.any && (
                      <div className="text-canar-red font-semibold pt-1">⚠ Active alarms</div>
                    )}
                  </div>
                  <a
                    href={`/transformer/${u.imei}`}
                    className="block text-xs text-canar-blue font-medium pt-1 hover:underline"
                  >
                    View details →
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
