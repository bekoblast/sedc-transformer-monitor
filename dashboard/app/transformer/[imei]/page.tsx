import { DEVICES } from '@/lib/devices';
import { TransformerDetailView } from './TransformerDetailView';

// Pre-generate a static page per IMEI for Netlify static export.
export function generateStaticParams() {
  return DEVICES.map((d) => ({ imei: d.IMEI }));
}

export const dynamicParams = false;

export default function Page() {
  return <TransformerDetailView />;
}
