// Browser-side 3-phase transformer simulator — emits realistic
// voltage / current / power readings matching the SEDC energy meter
// data shape (24-field JSON array in the original Node-RED flow).

import type { Device, TransformerUpdate } from './types';

type TransformerState = {
  loadFactor: number;
  loadTrend: number;
  tick: number;
  baseFreq: number;
  netE: number;
};

const states = new Map<string, TransformerState>();

function initState(): TransformerState {
  return {
    loadFactor: 0.45 + Math.random() * 0.4,
    loadTrend: (Math.random() - 0.5) * 0.005,
    tick: 0,
    baseFreq: 50,
    netE: 100_000 + Math.random() * 500_000,
  };
}

function evolve(state: TransformerState): TransformerState {
  state.tick++;

  state.loadTrend += (Math.random() - 0.5) * 0.002;
  state.loadTrend = Math.max(-0.01, Math.min(0.01, state.loadTrend));
  state.loadFactor += state.loadTrend;
  state.loadFactor += (0.6 - state.loadFactor) * 0.02;
  state.loadFactor = Math.max(0.2, Math.min(1.05, state.loadFactor));

  if (Math.random() < 0.01) {
    state.loadFactor = Math.min(1.18, state.loadFactor + 0.2);
  }

  return state;
}

export function generateUpdate(device: Device): TransformerUpdate {
  let state = states.get(device.IMEI);
  if (!state) {
    state = initState();
    states.set(device.IMEI, state);
  }
  state = evolve(state);

  const ratedV_LL = parseFloat(device.LRV);
  const ratedV_LN = ratedV_LL / Math.sqrt(3);
  const ratedI = device.LRA;
  const ratedS = device.rated_kva * 1000;
  const load = state.loadFactor;

  const imb = () => 1 + (Math.random() - 0.5) * 0.05;

  const V_A = ratedV_LN * (0.96 + Math.random() * 0.07) * imb();
  const V_B = ratedV_LN * (0.96 + Math.random() * 0.07) * imb();
  const V_C = ratedV_LN * (0.96 + Math.random() * 0.07) * imb();

  const overshoot = state.loadFactor > 1.0 ? 1.04 : 1.0;
  const V_AB = V_A * Math.sqrt(3) * imb() * overshoot;
  const V_BC = V_B * Math.sqrt(3) * imb() * overshoot;
  const V_AC = V_C * Math.sqrt(3) * imb() * overshoot;

  const I_A = ratedI * load * imb();
  const I_B = ratedI * load * imb();
  const I_C = ratedI * load * imb();

  const PF_A = 0.85 + Math.random() * 0.14;
  const PF_B = 0.85 + Math.random() * 0.14;
  const PF_C = 0.85 + Math.random() * 0.14;

  const P_A = V_A * I_A * PF_A;
  const P_B = V_B * I_B * PF_B;
  const P_C = V_C * I_C * PF_C;

  const S_A = V_A * I_A;
  const S_B = V_B * I_B;
  const S_C = V_C * I_C;

  const Q_A = Math.sqrt(Math.max(0, S_A * S_A - P_A * P_A));
  const Q_B = Math.sqrt(Math.max(0, S_B * S_B - P_B * P_B));
  const Q_C = Math.sqrt(Math.max(0, S_C * S_C - P_C * P_C));

  const VAngle_AB = 120 + (Math.random() - 0.5) * 2;
  const VAngle_BC = 120 + (Math.random() - 0.5) * 2;
  const VAngle_AC = 120 + (Math.random() - 0.5) * 2;

  const V_AVG = (V_A + V_B + V_C) / 3;
  const V2_AVG = (V_AB + V_BC + V_AC) / 3;
  const I_AVG = (I_A + I_B + I_C) / 3;
  const P_TOTAL = (P_A + P_B + P_C) / 3;
  const Q_TOTAL = (Q_A + Q_B + Q_C) / 3;
  const S_TOTAL = (S_A + S_B + S_C) / 3;
  const VAngle_AVG = (VAngle_AB + VAngle_BC + VAngle_AC) / 3;

  const SPF = (PF_A + PF_B + PF_C) / 3;
  const F = state.baseFreq + (Math.random() - 0.5) * 0.2;

  state.netE += (P_A + P_B + P_C) * 3 / (3600 * 1000);

  const totalS_3ph = S_A + S_B + S_C;
  const load_percent = (totalS_3ph / ratedS) * 100;

  const V_AB_alarm = V_AB > device.V2_limit;
  const V_BC_alarm = V_BC > device.V2_limit;
  const V_AC_alarm = V_AC > device.V2_limit;
  const I_A_alarm = I_A > device.I_limit;
  const I_B_alarm = I_B > device.I_limit;
  const I_C_alarm = I_C > device.I_limit;
  const V_Alarm = V_AB_alarm || V_BC_alarm || V_AC_alarm;
  const I_Alarm = I_A_alarm || I_B_alarm || I_C_alarm;

  const now = new Date();
  const r = (n: number) => Math.round(n * 100) / 100;
  const r4 = (n: number) => Math.round(n * 10000) / 10000;

  return {
    type: 'transformer_update',
    timestamp: now.toISOString(),
    imei: parseInt(device.IMEI, 10),
    device: device.name,
    site: {
      name_en: device.site_name_en,
      name_ar: device.site_name_ar,
      city: device.city,
      address: device.address,
      lat: device.lat,
      long: device.long,
    },
    spec: {
      LRV: device.LRV,
      LRA: device.LRA,
      RP: device.RP,
      rated_kva: device.rated_kva,
      I_limit: device.I_limit,
      V2_limit: device.V2_limit,
    },
    reading: {
      V_A: r(V_A), V_B: r(V_B), V_C: r(V_C),
      V_AB: r(V_AB), V_BC: r(V_BC), V_AC: r(V_AC),
      I_A: r(I_A), I_B: r(I_B), I_C: r(I_C),
      P_A: r(P_A), P_B: r(P_B), P_C: r(P_C),
      Q_A: r(Q_A), Q_B: r(Q_B), Q_C: r(Q_C),
      S_A: r(S_A), S_B: r(S_B), S_C: r(S_C),
      PF_A: r4(PF_A), PF_B: r4(PF_B), PF_C: r4(PF_C),
      VAngle_AB: r(VAngle_AB), VAngle_BC: r(VAngle_BC), VAngle_AC: r(VAngle_AC),
      V_AVG: r(V_AVG), V2_AVG: r(V2_AVG), I_AVG: r(I_AVG),
      P_TOTAL: r(P_TOTAL), Q_TOTAL: r(Q_TOTAL), S_TOTAL: r(S_TOTAL),
      VAngle_AVG: r(VAngle_AVG),
      SPF: r4(SPF),
      F: r(F),
      Net_E: r(state.netE),
      load_percent: r(load_percent),
    },
    alarms: {
      V_AB_alarm, V_BC_alarm, V_AC_alarm,
      I_A_alarm, I_B_alarm, I_C_alarm,
      V_Alarm, I_Alarm,
      any: V_Alarm || I_Alarm,
    },
    rtc: now.toTimeString().slice(0, 8),
    date: now.toISOString().slice(0, 10),
  };
}

export function resetSimulator() {
  states.clear();
}
