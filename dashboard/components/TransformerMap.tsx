'use client';

import dynamic from 'next/dynamic';
import type { TransformerUpdate } from '@/lib/types';

const TransformerMapInner = dynamic(
  () => import('./TransformerMapInner').then((m) => m.TransformerMapInner),
  { ssr: false, loading: () => <MapSkeleton /> }
);

export function TransformerMap(props: { updates: TransformerUpdate[]; height?: number }) {
  return <TransformerMapInner {...props} />;
}

function MapSkeleton() {
  return (
    <div className="w-full h-full bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 text-sm">
      Loading map…
    </div>
  );
}
