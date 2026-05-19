'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TransformerUpdate } from '@/lib/types';
import { DEVICES } from '@/lib/devices';
import { generateUpdate } from '@/lib/simulator';

type StreamSource = 'simulator' | 'websocket';

type StreamState = {
  transformers: Map<number, TransformerUpdate>;
  source: StreamSource;
  connected: boolean;
  lastUpdate: number;
};

const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1880/ws/transformers';
const TICK_MS = 3000;

export function useTransformerStream() {
  const [state, setState] = useState<StreamState>(() => ({
    transformers: new Map(),
    source: 'simulator',
    connected: false,
    lastUpdate: 0,
  }));

  const wsRef = useRef<WebSocket | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyUpdate = useCallback((update: TransformerUpdate) => {
    setState((prev) => {
      const next = new Map(prev.transformers);
      next.set(update.imei, update);
      return { ...prev, transformers: next, lastUpdate: Date.now() };
    });
  }, []);

  const tickSimulator = useCallback(() => {
    DEVICES.forEach((d) => applyUpdate(generateUpdate(d)));
  }, [applyUpdate]);

  useEffect(() => {
    let cancelled = false;

    // Seed the UI immediately
    tickSimulator();

    // Always-on simulator timer (suppressed when WS is connected)
    simTimerRef.current = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        tickSimulator();
      }
    }, TICK_MS);

    // Try the Node-RED WebSocket
    try {
      const ws = new WebSocket(DEFAULT_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, source: 'websocket', connected: true }));
      };
      ws.onclose = () => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, source: 'simulator', connected: false }));
      };
      ws.onerror = () => {
        // Silent — simulator carries the load
      };
      ws.onmessage = (ev) => {
        if (cancelled) return;
        try {
          const data = JSON.parse(typeof ev.data === 'string' ? ev.data : '');
          if (data?.type === 'transformer_update') applyUpdate(data as TransformerUpdate);
        } catch {
          /* ignore malformed */
        }
      };
    } catch {
      // WS construction failed — simulator is already running
    }

    return () => {
      cancelled = true;
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      wsRef.current?.close();
    };
  }, [applyUpdate, tickSimulator]);

  return state;
}
