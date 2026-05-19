// Stylized SVG mockup of the SEDC Energy Meter Node-RED flow.
// Matches Node-RED's visual language: rounded nodes, colored icon tab on the
// left, white body with the label, small ports, curved wires between them.

type NodeKind = 'mqtt' | 'function' | 'ws' | 'debug' | 'mysql' | 'http' | 'file' | 'catch';

type Node = {
  id: string;
  kind: NodeKind;
  label: string;
  icon: string;
  x: number;
  y: number;
  w?: number;
};

type Wire = { from: string; to: string };

const KIND_COLOR: Record<NodeKind, string> = {
  mqtt: '#d8bfd8',     // mauve (mqtt nodes)
  function: '#fdd0a2', // peach (function)
  ws: '#dcdcdc',       // light gray (websocket)
  debug: '#87a980',    // muted green (debug)
  mysql: '#f4cccc',    // pale red (DB)
  http: '#cfe2f3',     // pale blue (http)
  file: '#fce5cd',     // pale orange (file)
  catch: '#e2d96e',    // yellow-green (catch)
};

const NODE_H = 36;
const DEFAULT_W = 168;

const NODES: Node[] = [
  // Ingress
  { id: 'mqtt_in', kind: 'mqtt', label: 'MQTT: gts_energy', icon: '📡', x: 20, y: 130, w: 165 },
  // Main decoder
  { id: 'decoder', kind: 'function', label: 'Energy Readings', icon: 'ƒ', x: 215, y: 130, w: 165 },
  // IMEI routers
  { id: 'rt_attr', kind: 'function', label: 'IMEI Check - Header', icon: 'ƒ', x: 410, y: 60, w: 185 },
  { id: 'rt_tel', kind: 'function', label: 'IMEI Check - Data', icon: 'ƒ', x: 410, y: 130, w: 185 },
  // Egress: WebSocket (new) + DB + SMS
  { id: 'ws_out', kind: 'ws', label: 'WS /ws/transformers', icon: '⇄', x: 625, y: 95, w: 170 },
  { id: 'mysql', kind: 'mysql', label: 'MySQL iot_energy', icon: '🗄', x: 410, y: 220, w: 170 },
  { id: 'sms', kind: 'http', label: 'SMS Alert (HTTP)', icon: '✉', x: 410, y: 290, w: 165 },
  { id: 'file', kind: 'file', label: 'raw_energy.txt', icon: '📄', x: 410, y: 360, w: 165 },
  // Debug
  { id: 'dbg', kind: 'debug', label: 'transformer update', icon: '🐛', x: 625, y: 165, w: 170 },
  // Catch
  { id: 'catch', kind: 'catch', label: 'Catch errors', icon: '⚠', x: 20, y: 360, w: 130 },
  { id: 'dbg_err', kind: 'debug', label: 'error', icon: '🐛', x: 195, y: 360, w: 90 },
];

const WIRES: Wire[] = [
  { from: 'mqtt_in', to: 'decoder' },
  { from: 'decoder', to: 'rt_attr' },
  { from: 'decoder', to: 'rt_tel' },
  { from: 'decoder', to: 'mysql' },
  { from: 'decoder', to: 'sms' },
  { from: 'decoder', to: 'file' },
  { from: 'rt_attr', to: 'ws_out' },
  { from: 'rt_tel', to: 'ws_out' },
  { from: 'rt_tel', to: 'dbg' },
  { from: 'catch', to: 'dbg_err' },
];

function getPortPositions(node: Node): { in: [number, number]; out: [number, number] } {
  const w = node.w ?? DEFAULT_W;
  return {
    in: [node.x, node.y + NODE_H / 2],
    out: [node.x + w, node.y + NODE_H / 2],
  };
}

function wirePath(from: [number, number], to: [number, number]): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = Math.max(40, Math.abs(x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export function NodeRedFlow() {
  const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div className="not-prose bg-zinc-100 rounded-lg border border-zinc-300 p-4 overflow-x-auto">
      <div className="flex items-center gap-1 mb-3 text-xs">
        <div className="bg-white border border-zinc-300 border-b-white px-3 py-1.5 rounded-t-md font-medium text-zinc-700 -mb-px">
          SEDC Rebuild — Energy Meter v1.1
        </div>
        <div className="text-zinc-400 px-2 py-1.5">Energy Payload</div>
        <div className="text-zinc-400 px-2 py-1.5">Tank Level Production</div>
        <div className="flex-1 border-b border-zinc-300" />
      </div>

      <div className="bg-white border border-zinc-300 rounded-b-md p-3 min-w-[850px]">
        <svg
          viewBox="0 0 850 430"
          className="w-full h-auto"
          style={{ minHeight: 340 }}
        >
          <defs>
            <pattern id="nr-grid-sedc" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            </pattern>
            <filter id="node-shadow-sedc" x="-10%" y="-10%" width="120%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>
          <rect width="850" height="430" fill="url(#nr-grid-sedc)" />

          {WIRES.map((wire, i) => {
            const from = nodeById[wire.from];
            const to = nodeById[wire.to];
            if (!from || !to) return null;
            const fromPos = getPortPositions(from).out;
            const toPos = getPortPositions(to).in;
            return (
              <g key={i}>
                <path d={wirePath(fromPos, toPos)} stroke="#9ca3af" strokeWidth="2.5" fill="none" />
                <path
                  d={wirePath(fromPos, toPos)}
                  stroke="#2369a7"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="6 8"
                  className="nr-wire-flow"
                  opacity={0.6}
                />
              </g>
            );
          })}

          {NODES.map((node) => {
            const w = node.w ?? DEFAULT_W;
            const color = KIND_COLOR[node.kind];
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`} filter="url(#node-shadow-sedc)">
                <rect width={w} height={NODE_H} rx={5} fill="#fff" stroke="#94a3b8" strokeWidth="1" />
                <path
                  d={`M 0 0 L 32 0 L 32 ${NODE_H} L 0 ${NODE_H} Z`}
                  fill={color}
                  stroke="#94a3b8"
                  strokeWidth="1"
                />
                <line x1={32} y1={0} x2={32} y2={NODE_H} stroke="#94a3b8" strokeWidth="1" />
                <text
                  x={16}
                  y={NODE_H / 2 + 6}
                  textAnchor="middle"
                  fontSize={15}
                  fill="#1c1c1c"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {node.icon}
                </text>
                <text
                  x={42}
                  y={NODE_H / 2 + 4}
                  fontSize={12}
                  fill="#1f2937"
                  style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 500 }}
                >
                  {node.label}
                </text>
                <rect x={-4} y={NODE_H / 2 - 5} width={8} height={10} rx={2} fill="#64748b" />
                <rect x={w - 4} y={NODE_H / 2 - 5} width={8} height={10} rx={2} fill="#64748b" />
              </g>
            );
          })}

          <text x={20} y={45} fontSize={11} fill="#64748b" style={{ fontFamily: 'system-ui, sans-serif' }}>
            ⓘ Subscribe to gts_energy MQTT topic, decode the 24-field array, route per-IMEI, push to WebSocket + MySQL + SMS on alarm.
          </text>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-600">
        <LegendDot color={KIND_COLOR.mqtt} label="MQTT in/out" />
        <LegendDot color={KIND_COLOR.function} label="Function (JS logic)" />
        <LegendDot color={KIND_COLOR.ws} label="WebSocket out" />
        <LegendDot color={KIND_COLOR.mysql} label="MySQL" />
        <LegendDot color={KIND_COLOR.http} label="HTTP (SMS)" />
        <LegendDot color={KIND_COLOR.file} label="File append" />
        <LegendDot color={KIND_COLOR.debug} label="Debug" />
        <LegendDot color={KIND_COLOR.catch} label="Catch (errors)" />
      </div>

      <style>{`
        @keyframes nr-flow {
          to { stroke-dashoffset: -14; }
        }
        .nr-wire-flow {
          animation: nr-flow 1.4s linear infinite;
        }
      `}</style>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block size-3 rounded-sm border border-zinc-400"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
