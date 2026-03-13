// OpenClaw Gateway TypeScript types

export interface GatewayStatus {
  connected: boolean;
  url: string;
  latency?: number;
  lastHeartbeat?: Date;
}

export interface Agent {
  id: string;
  name: string;
  model: string;
  status: "active" | "inactive" | "error";
  capabilities: string[];
  createdAt: Date;
}

export interface Session {
  id: string;
  agentId: string;
  model: string;
  createdAt: Date;
  lastActivity: Date;
  tokens: {
    input: number;
    output: number;
    total: number;
    max: number;
  };
  messages: Message[];
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  tokens?: number;
}

export interface Channel {
  id: string;
  type: "imessage" | "feishu" | "telegram" | "discord";
  name: string;
  status: "connected" | "disconnected" | "error";
  enabled: boolean;
}

export interface LogEntry {
  id: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  timestamp: Date;
  source?: string;
}

export interface MemoryEntry {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  score?: number;
}

export interface GatewayHealth {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  version: string;
  os: string;
  nodeVersion: string;
  channels: ChannelHealth[];
  sessions: number;
  agents: number;
}

export interface ChannelHealth {
  name: string;
  enabled: boolean;
  status: string;
}

export interface OpenClawConfig {
  gatewayUrl: string;
  authToken?: string;
  wsUrl?: string;
}
