// OpenClaw Gateway WebSocket Client

"use client";

export type WSMessage =
  | { type: "health"; data: unknown }
  | { type: "session"; data: unknown }
  | { type: "log"; data: unknown }
  | { type: "channel"; data: unknown }
  | { type: "agent"; data: unknown }
  | { type: "error"; data: { message: string } };

export type WSMessageHandler = (message: WSMessage) => void;

export interface OpenClawWSClientOptions {
  url?: string;
  token?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class OpenClawWSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Set<WSMessageHandler> = new Set();
  private isManualClose = false;

  constructor(options: OpenClawWSClientOptions = {}) {
    this.url = options.url || this.getDefaultUrl();
    this.token = options.token || this.getDefaultToken();
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
  }

  private getDefaultUrl(): string {
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${window.location.host}`;
    }
    return "ws://127.0.0.1:18789";
  }

  private getDefaultToken(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("openclaw_token") || "";
    }
    return "";
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isManualClose = false;

    try {
      // Build WebSocket URL with auth token
      const url = new URL(this.url);
      url.pathname = "/gateway"; // Gateway WebSocket endpoint
      if (this.token) {
        url.searchParams.set("auth", this.token);
      }

      this.ws = new WebSocket(url.toString());

      this.ws.onopen = () => {
        console.log("[OpenClaw WS] Connected");
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WSMessage;
          this.notifyHandlers(message);
        } catch (error) {
          console.error("[OpenClaw WS] Failed to parse message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("[OpenClaw WS] Error:", error);
      };

      this.ws.onclose = () => {
        console.log("[OpenClaw WS] Disconnected");
        this.ws = null;

        // Auto-reconnect if not manually closed
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`[OpenClaw WS] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, this.reconnectInterval);
        }
      };
    } catch (error) {
      console.error("[OpenClaw WS] Failed to connect:", error);
    }
  }

  disconnect(): void {
    this.isManualClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("[OpenClaw WS] Cannot send message: not connected");
    }
  }

  onMessage(handler: WSMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  private notifyHandlers(message: WSMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error("[OpenClaw WS] Handler error:", error);
      }
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("openclaw_token", token);
    }
  }
}

// Singleton instance
let wsClient: OpenClawWSClient | null = null;

export function getWSClient(): OpenClawWSClient {
  if (!wsClient) {
    wsClient = new OpenClawWSClient();
  }
  return wsClient;
}

export function setWSClient(client: OpenClawWSClient): void {
  wsClient = client;
}
