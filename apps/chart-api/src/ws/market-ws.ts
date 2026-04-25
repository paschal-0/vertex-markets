import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "node:http";
import type { CandleEvent, TickEvent } from "@vertex/types";

type Subscription = {
  channels: Set<string>;
};

export class MarketWsGateway {
  private wss: WebSocketServer;
  private subscriptions = new Map<WebSocket, Subscription>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
      if (!req.url?.startsWith("/ws/market")) {
        return;
      }
      this.wss.handleUpgrade(req, socket, head, (ws) => this.handleConnection(ws));
    });
  }

  private handleConnection(ws: WebSocket) {
    this.subscriptions.set(ws, { channels: new Set() });
    ws.send(
      JSON.stringify({
        type: "snapshot",
        channels: []
      })
    );

    ws.on("message", (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        const subscription = this.subscriptions.get(ws);
        if (!subscription) {
          return;
        }

        if (message.action === "subscribe" && typeof message.channel === "string") {
          subscription.channels.add(message.channel);
        }
        if (message.action === "unsubscribe" && typeof message.channel === "string") {
          subscription.channels.delete(message.channel);
        }
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
      }
    });

    ws.on("close", () => {
      this.subscriptions.delete(ws);
    });
  }

  broadcastTick(tick: TickEvent) {
    this.broadcast(`ticker:${tick.symbol}`, tick);
  }

  broadcastCandle(candle: CandleEvent) {
    this.broadcast(`candle:${candle.symbol}:${candle.interval}`, candle);
  }

  private broadcast(channel: string, payload: CandleEvent | TickEvent) {
    const encoded = JSON.stringify(payload);
    for (const [ws, subscription] of this.subscriptions.entries()) {
      if (ws.readyState !== ws.OPEN) {
        continue;
      }
      if (subscription.channels.has(channel)) {
        ws.send(encoded);
      }
    }
  }
}

