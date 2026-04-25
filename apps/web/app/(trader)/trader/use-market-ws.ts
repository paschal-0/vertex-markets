"use client";

import { useEffect, useRef, useState } from "react";

export const INTERVALS = [
  "5s",
  "10s",
  "15s",
  "30s",
  "1m",
  "2m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "3h",
  "4h"
];

interface TickPayload {
  symbol: string;
  price: number;
  ts: number;
}

export function useMarketWs(channel: string) {
  const [connected, setConnected] = useState(false);
  const [lastTick, setLastTick] = useState<TickPayload | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/market`);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnected(true);
      socket.send(JSON.stringify({ action: "subscribe", channel }));
    });

    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "TickEvent" || payload.type === "tick") {
          setLastTick(payload);
        }
      } catch {
        // ignore malformed frames
      }
    });

    socket.addEventListener("close", () => setConnected(false));
    socket.addEventListener("error", () => setConnected(false));

    return () => {
      socket.send(JSON.stringify({ action: "unsubscribe", channel }));
      socket.close();
    };
  }, [channel]);

  return { connected, lastTick };
}

