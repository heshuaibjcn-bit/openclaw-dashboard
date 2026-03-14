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
  modelId?: string;
  status: "active" | "inactive" | "error";
  capabilities: string[];
  contextWindow?: number;
  maxTokens?: number;
  totalSessions?: number;
  activeSession?: {
    id: string;
    updatedAt: number;
    lastChannel?: string;
    chatType?: string;
  };
  createdAt: string;
  recentOutput?: {
    count: number;
    lastActivity: string;
  };
}

export interface Session {
  id: string;
  sessionKey: string;
  agentId: string;
  chatType?: string;
  status: string;
  lastChannel?: string;
  origin?: string;
  updatedAt?: string;
  createdAt?: string | null;
  systemSent?: boolean;
  compactionCount?: number;
  sessionFile?: string;
  hasSkills?: boolean;
  messageCount?: number;
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

// Runtime types (from runtime-reader.ts)
export interface RuntimeProject {
  projectId: string;
  title: string;
  status: 'active' | 'archived' | 'on-hold';
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuntimeTask {
  taskId: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  projectId?: string;
  owner?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
}

export interface AckItem {
  id: string;
  type: 'exception' | 'approval' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source?: string;
}

export interface ApprovalAction {
  approvalId: string;
  type: 'approve' | 'reject';
  targetId: string;
  targetTitle: string;
  reason?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Config types (from config-reader.ts)
export interface ConfigAgent {
  id: string;
  name: string;
  model: string;
  status: 'active' | 'inactive' | 'archived';
  capabilities?: string[];
  channels?: string[];
  createdAt?: string;
  updatedAt?: string;
  config?: Record<string, unknown>;
}

// Subscription types (from subscription-reader.ts)
export interface SubscriptionSnapshot {
  timestamp: string;
  provider: 'codex' | 'openai' | 'anthropic' | 'custom';
  quota: {
    window: string;
    limit: number;
    used: number;
    remaining: number;
    resetAt: string;
  };
  usage: {
    today: number;
    last7days: number;
    last30days: number;
    currentMonth: number;
  };
  cost?: {
    today: number;
    last7days: number;
    last30days: number;
    currentMonth: number;
    currency?: string;
  };
  attribution?: Array<{
    taskId?: string;
    agentId?: string;
    projectId?: string;
    tokens: number;
    cost?: number;
    percentage: number;
  }>;
}

// Staff/Agent status types
export interface StaffStatus {
  agentId: string;
  agentName: string;
  status: 'working' | 'standby' | 'offline' | 'error';
  currentTask?: {
    taskId: string;
    title: string;
    progress: number;
  };
  nextTask?: {
    taskId: string;
    title: string;
  };
  recentOutput: {
    count: number;
    lastActivity: Date;
  };
  capabilities: string[];
}
