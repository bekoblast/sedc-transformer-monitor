export type TransformerUpdate = {
  type: 'transformer_update';
  timestamp: string;
  imei: number;
  device: string;
  site: {
    name_en: string;
    name_ar: string;
    city: string;
    address: string;
    lat: number;
    long: number;
  };
  spec: {
    LRV: string;       // Line Reference Voltage, e.g. "433 V"
    LRA: number;       // Line Reference Amperage
    RP: string;        // Rated Power, e.g. "1000 KVA"
    rated_kva: number;
    I_limit: number;   // current alarm threshold (A)
    V2_limit: number;  // line-line voltage alarm threshold (V)
  };
  reading: {
    V_A: number; V_B: number; V_C: number;
    V_AB: number; V_BC: number; V_AC: number;
    I_A: number; I_B: number; I_C: number;
    P_A: number; P_B: number; P_C: number;
    Q_A: number; Q_B: number; Q_C: number;
    S_A: number; S_B: number; S_C: number;
    PF_A: number; PF_B: number; PF_C: number;
    VAngle_AB: number; VAngle_BC: number; VAngle_AC: number;
    V_AVG: number;
    V2_AVG: number;
    I_AVG: number;
    P_TOTAL: number;
    Q_TOTAL: number;
    S_TOTAL: number;
    VAngle_AVG: number;
    SPF: number;
    F: number;
    Net_E: number;
    load_percent: number;
  };
  alarms: {
    V_AB_alarm: boolean;
    V_BC_alarm: boolean;
    V_AC_alarm: boolean;
    I_A_alarm: boolean;
    I_B_alarm: boolean;
    I_C_alarm: boolean;
    V_Alarm: boolean;
    I_Alarm: boolean;
    any: boolean;
  };
  rtc: string;
  date: string;
};

export type Device = {
  IMEI: string;
  name: string;
  site_name_en: string;
  site_name_ar: string;
  city: string;
  address: string;
  lat: number;
  long: number;
  LRV: string;
  LRA: number;
  RP: string;
  rated_kva: number;
  I_limit: number;
  V2_limit: number;
  // Demo scenario seed for the browser simulator. Determines whether this
  // transformer behaves as a normal site, a warning site (high load), an
  // alarm site (overcurrent), or an inactive site (stale telemetry).
  scenario?: 'normal' | 'warning' | 'alarm' | 'inactive';
};

export type Scenario = NonNullable<Device['scenario']>;

export type TransformerStatus = 'ok' | 'warning' | 'critical' | 'inactive';

export function getStatus(update: TransformerUpdate | undefined): TransformerStatus {
  if (!update) return 'inactive';
  const ageMs = Date.now() - new Date(update.timestamp).getTime();
  if (ageMs > 60_000) return 'inactive';
  if (update.alarms.any) return 'critical';
  if (update.reading.load_percent > 70) return 'warning';
  return 'ok';
}

// Traditional 3-phase color code (IEC / British style — used in Sudan)
export const PHASE_COLORS = {
  A: '#dc2626', // red
  B: '#eab308', // yellow
  C: '#2563eb', // blue
} as const;
