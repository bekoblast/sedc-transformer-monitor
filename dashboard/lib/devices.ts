import type { Device } from './types';

// Three real SEDC sites from the original 2023 production system.
// Coordinates, capacities, and limits are exactly as deployed.
export const DEVICES: Device[] = [
  {
    IMEI: '862506048536646',
    name: 'SEDC-001',
    site_name_en: 'Jabra - Alsajdeen',
    site_name_ar: 'الساجدين - جبرة',
    city: 'Khartoum',
    address: 'Jabra 18th square, Khartoum, Sudan',
    lat: 15.520419,
    long: 32.521363,
    LRV: '433 V',
    LRA: 1333.4,
    RP: '1000 KVA',
    rated_kva: 1000,
    I_limit: 700,
    V2_limit: 420,
  },
  {
    IMEI: '865583041220517',
    name: 'SEDC-002',
    site_name_en: 'Ombada Alhara 1 - Ahmed Altayeb',
    site_name_ar: 'أحمد الطيب - أمبدة الحارة الأولى',
    city: 'Omdurman',
    address: 'Ombada, Omdurman, Sudan',
    lat: 15.671521,
    long: 32.451118,
    LRV: '433 V',
    LRA: 1333.4,
    RP: '1000 KVA',
    rated_kva: 1000,
    I_limit: 1100,
    V2_limit: 400,
  },
  {
    IMEI: '864086061228973',
    name: 'SEDC-003',
    site_name_en: 'Shambat Square 11 - Mohammed Awad Hamza',
    site_name_ar: 'محمد عوض حمزة - شمبات مربع 11',
    city: 'Khartoum North',
    address: 'Shambat Extension, Khartoum North, Sudan',
    lat: 15.656971,
    long: 32.535061,
    LRV: '433 V',
    LRA: 2000,
    RP: '1500 KVA',
    rated_kva: 1500,
    I_limit: 1000,
    V2_limit: 410,
  },
];

export function deviceByImei(imei: number | string): Device | undefined {
  return DEVICES.find((d) => d.IMEI === String(imei));
}
