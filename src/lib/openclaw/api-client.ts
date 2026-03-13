// OpenClaw Gateway API Client

import type {
  GatewayHealth,
  Agent,
  Session,
  Channel,
  LogEntry,
  MemoryEntry,
} from "./types";

export class OpenClawAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "OpenClawAPIError";
  }
}

export class OpenClawAPIClient {
  private baseUrl: string;
  private authToken: string;

  constructor(config: { baseUrl?: string; authToken?: string } = {}) {
    this.baseUrl = config.baseUrl || this.getDefaultBaseUrl();
    this.authToken = config.authToken || this.getDefaultAuthToken();
  }

  private getDefaultBaseUrl(): string {
    if (typeof window !== "undefined") {
      // Browser: use the same host
      return window.location.origin;
    }
    return "http://127.0.0.1:18789";
  }

  private getDefaultAuthToken(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("openclaw_token") || "";
    }
    return "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new OpenClawAPIError(
          `API request failed: ${response.statusText}`,
          response.status,
          await response.json().catch(() => undefined)
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof OpenClawAPIError) {
        throw error;
      }
      throw new OpenClawAPIError(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getHealth(): Promise<GatewayHealth> {
    // This would call the actual OpenClaw health endpoint
    // For now, return mock data
    return {
      status: "healthy",
      uptime: 1234567,
      version: "2026.3.8",
      os: "macos 26.3.1",
      nodeVersion: "24.14.0",
      channels: [
        { name: "iMessage", enabled: true, status: "OK" },
        { name: "Feishu", enabled: true, status: "OK" },
      ],
      sessions: 1,
      agents: 1,
    };
  }

  async getAgents(): Promise<Agent[]> {
    // This would call the actual OpenClaw agents endpoint
    return [
      {
        id: "main",
        name: "Main Agent",
        model: "zai/glm-5",
        status: "active",
        capabilities: ["chat", "code", "tools"],
        createdAt: new Date("2026-03-11T14:26:00Z"),
      },
    ];
  }

  async getSessions(): Promise<Session[]> {
    // This would call the actual OpenClaw sessions endpoint
    return [
      {
        id: "agent:main:main",
        agentId: "main",
        model: "zai/glm-5",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        lastActivity: new Date(),
        tokens: {
          input: 15000,
          output: 16000,
          total: 31000,
          max: 204800,
        },
        messages: [],
      },
    ];
  }

  async getChannels(): Promise<Channel[]> {
    // This would call the actual OpenClaw channels endpoint
    return [
      {
        id: "imessage",
        type: "imessage",
        name: "iMessage",
        status: "connected",
        enabled: true,
      },
      {
        id: "feishu",
        type: "feishu",
        name: "Feishu",
        status: "connected",
        enabled: true,
      },
    ];
  }

  async getLogs(options: {
    level?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<LogEntry[]> {
    // This would call the actual OpenClaw logs endpoint
    return [
      {
        id: "1",
        level: "info",
        message: "Gateway started",
        timestamp: new Date(),
        source: "gateway",
      },
    ];
  }

  async searchMemory(query: string, limit = 10): Promise<MemoryEntry[]> {
    // This would call the actual OpenClaw memory search endpoint
    return [];
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("openclaw_token", token);
    }
  }

  clearAuthToken(): void {
    this.authToken = "";
    if (typeof window !== "undefined") {
      localStorage.removeItem("openclaw_token");
    }
  }
}

// Singleton instance
let apiClient: OpenClawAPIClient | null = null;

export function getAPIClient(): OpenClawAPIClient {
  if (!apiClient) {
    apiClient = new OpenClawAPIClient();
  }
  return apiClient;
}

export function setAPIClient(client: OpenClawAPIClient): void {
  apiClient = client;
}
