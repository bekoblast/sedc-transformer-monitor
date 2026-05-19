# SEDC Transformer Monitor — Rebuild

A modern React/Next.js rebuild of the 2023 industrial IoT system originally built at [GTS Hi-Tech](https://gts-hitech.com) on **Node-RED + ThingsBoard** for the **Sudanese Electrical Distribution Company (SEDC)**. The original deployment monitored 3-phase distribution transformers across Khartoum; the ThingsBoard server was lost during the 2023 conflict, but the Node-RED flows, dashboard exports, and rule chains survived.

This rebuild faithfully recreates the customer-approved dashboard layout, color palette, and 24-field telemetry protocol — modernized with Next.js 16, React 19, Tailwind 4, Leaflet, and Recharts.

**Companion project:** [`fuel-tanker-monitor`](https://github.com/bekoblast/fuel-tanker-monitor) — the first project in this series (Canar fuel tankers, binary protocol over TCP).

---

## Architecture

```
[SEDC Simulator]                   [Browser-side simulator]
 emits 3-element JSON               runs by default; same
 array per transformer              TransformerUpdate shape
 every 5s for 3 sites               as Node-RED emits.
       │                                    │
       ▼                                    │
[Energy Readings (Decoder)]                 │
 unpacks 24-element DATA                    │
 array, computes averages,                  │
 checks per-device                          │
 thresholds                                 │
       │                                    │
       ▼                                    │
[Format for WebSocket]                      │
 reshape for the                            │
 React dashboard                            │
       │                                    │
       ▼                                    ▼
 ws://host:1880/ws/transformers ──────►  React Dashboard
                                          (Next.js 16 + Tailwind 4)
                                          │
                                          ├── Overview: 5 status cards, OSM map (Khartoum metro), alarms, transformer cards
                                          └── /transformer/[imei]: 6 KPI cards, voltage triads (L-N + L-L), current triad,
                                              PF + voltage angle triads, per-phase timeseries (V + I + P + F), mini map,
                                              full spec table
```

The dashboard always works on its own (browser simulator). When Node-RED is running locally, the dashboard auto-connects to the WebSocket and the browser simulator stands down.

---

## Project layout

```
.
├── dummy-generator-sedc.json   ← Node-RED flow to import (12 nodes)
├── netlify.toml                ← Netlify build config (base = dashboard)
├── README.md                   ← this file
└── dashboard/                  ← Next.js 16 app
    ├── app/
    │   ├── page.tsx                  ← Overview (status cards + map + alarms + 3 transformer cards)
    │   ├── about/page.tsx            ← Project story, Node-RED mockup, GTS Hi-Tech credit
    │   └── transformer/[imei]/       ← Per-device drill-down (3 pre-rendered routes)
    ├── components/
    │   ├── PhaseTriad.tsx            ← 3-phase value display (A red / B yellow / C blue)
    │   ├── TransformerCard.tsx       ← Per-transformer summary card
    │   ├── TransformerMap.tsx        ← Leaflet OSM map with load-colored markers
    │   ├── PowerCard.tsx             ← Single large KPI value (kW / kVA / Hz / etc.)
    │   ├── AlarmsTable.tsx           ← Voltage / current / frequency alarms
    │   ├── NodeRedFlow.tsx           ← SVG mockup of the Node-RED pipeline
    │   └── ...                       ← StatusCard, LiveIndicator, AboutBanner, TimeseriesChart, LcdBar
    ├── hooks/useTransformerStream.ts ← WebSocket + simulator state manager
    ├── lib/
    │   ├── types.ts                  ← TransformerUpdate / Device / status helpers / PHASE_COLORS
    │   ├── devices.ts                ← 3 SEDC sites (must match Node-RED env)
    │   └── simulator.ts              ← Browser-side 3-phase simulator
    └── next.config.ts                ← Static export config (output: export)
```

---

## The 6 sites (3 original production + 3 added for the demo)

The first three sites are the actual production deployment from 2023. The
other three are real Khartoum neighborhoods added for the rebuild demo so
the status cards on the overview page can show every operational state at
once. Each device has a `scenario` field that biases the simulator toward
that demo state.

| ID | Site (EN) | City | Rated | I_limit | V2_limit | Scenario |
|----|-----------|------|------:|--------:|---------:|----------|
| **SEDC-001** | Jabra Alsajdeen | Khartoum | 1000 kVA | 700 A | 440 V | `normal` |
| **SEDC-002** | Ombada Alhara 1 (Ahmed Altayeb) | Omdurman | 1000 kVA | 1100 A | 440 V | `normal` |
| **SEDC-003** | Shambat Square 11 (Mohammed Awad Hamza) | Khartoum North | 1500 kVA | 1800 A | 440 V | `warning` |
| **SEDC-004** | Bahri Industrial Area | Khartoum North | 1500 kVA | 1500 A | 420 V | `alarm` |
| **SEDC-005** | Amarat | Khartoum | 1500 kVA | 1500 A | 440 V | `normal` |
| **SEDC-006** | Souq Libya | Omdurman | 2500 kVA | 2200 A | 410 V | `inactive` |

Expected status-card breakdown: **Total 6 · Online 3 · Inactive 1 · Warning 1 · Alarms 1**

---

## Run locally

### Option A — Dashboard only (no Node-RED needed)

```bash
cd dashboard
npm install
npm run dev
# Open http://localhost:5179
```

The built-in browser simulator emits new readings every 3 seconds. All 3 transformers animate, load fluctuates, occasional overload spikes trigger overcurrent alarms, frequency drifts slightly around 50 Hz.

### Option B — With the Node-RED backend (true end-to-end)

1. Install Node-RED if you don't have it: `npm install -g node-red`
2. Run it: `node-red` (default port 1880)
3. Open `http://localhost:1880`
4. Menu (top-right ☰) → **Import** → paste the contents of `dummy-generator-sedc.json` → Deploy
5. The flow's WebSocket out node exposes `ws://localhost:1880/ws/transformers`
6. Run the dashboard (`npm run dev` in `dashboard/`)
7. The "Live · Browser simulator" indicator will flip to "Live · Node-RED WS" once the WebSocket connects

### Option C — Connect to a remote Node-RED instance

Set `NEXT_PUBLIC_WS_URL` to your WebSocket URL before building:

```bash
NEXT_PUBLIC_WS_URL=wss://your-server.example.com/ws/transformers npm run build
```

---

## Deploy to Netlify

### One-time setup

1. Push this repo to GitHub.
2. In Netlify: **New site from Git** → pick the repo.
3. Confirm the auto-detected settings (matches `netlify.toml`):
   - Base directory: `dashboard`
   - Build command: `npm run build`
   - Publish directory: `out`
4. Click **Deploy site**.

### Optional: point at a real Node-RED

In Netlify → **Site settings → Environment variables**, add:

```
NEXT_PUBLIC_WS_URL = wss://your-noderef.example.com/ws/transformers
```

Then trigger a redeploy.

---

## What the 24-field protocol looks like

Each energy meter publishes (originally over MQTT topic `gts_energy`) a 3-element JSON array:

```json
[
  { "IMEI": "862506048536646", "TS": "1681166514", "S_P_F": [0.93, 49.95] },
  { "IMEI": "862506048536646", "TS": "1681166514", "DATA": [/* 24 numbers */] },
  { "IMEI": "862506048536646", "TS": "1681166514", "Net_E": [401953.59] }
]
```

The 24-element `DATA` array, in fixed order:

| Index | Field |
|-------|-------|
| 0–2 | `V_A`, `V_B`, `V_C` — Phase-to-neutral voltages (V) |
| 3–5 | `V_AB`, `V_BC`, `V_AC` — Phase-to-phase voltages (V) |
| 6–8 | `I_A`, `I_B`, `I_C` — Phase currents (A) |
| 9–11 | `P_A`, `P_B`, `P_C` — Active power per phase (W) |
| 12–14 | `Q_A`, `Q_B`, `Q_C` — Reactive power per phase (VAR) |
| 15–17 | `S_A`, `S_B`, `S_C` — Apparent power per phase (VA) |
| 18–20 | `PF_A`, `PF_B`, `PF_C` — Power factor per phase |
| 21–23 | `VAngle_AB`, `VAngle_BC`, `VAngle_AC` — Voltage angles (°) |

The decoder computes averages (V_AVG, V2_AVG, I_AVG, etc.) and checks per-device `I_limit` and `V2_limit` thresholds to set alarm flags.

---

## Credits

- **Original system (2022–2023):** Babakr Hussain — System Administrator and IoT / Software Developer at GTS Hi-Tech (Sudan)
- **Customer:** Sudanese Electrical Distribution Company (SEDC)
- **Rebuild stack:** Next.js 16, React 19, Tailwind 4, Leaflet, Recharts, Lucide
