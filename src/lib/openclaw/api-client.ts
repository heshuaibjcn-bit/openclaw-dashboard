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
    const headersInit: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Create a new Headers object to properly handle different header types
    const headers = new Headers(headersInit);

    if (this.authToken) {
      headers.set("Authorization", `Bearer ${this.authToken}`);
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
    return this.request<Agent[]>("/api/agents");
  }

  async getSessions(): Promise<Session[]> {
    return this.request<Session[]>("/api/sessions");
  }

  async getChannels(): Promise<Channel[]> {
    return this.request<Channel[]>("/api/channels");
  }

  async getLogs(params?: { limit?: number; offset?: number }): Promise<LogEntry[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    const queryString = queryParams.toString();
    return this.request<LogEntry[]>(`/api/logs${queryString ? `?${queryString}` : ""}`);
  }

  async getMemory(params?: { limit?: number; offset?: number }): Promise<MemoryEntry[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    const queryString = queryParams.toString();
    return this.request<MemoryEntry[]>(`/api/memory${queryString ? `?${queryString}` : ""}`);
  }

  async searchMemory(query: string, limit?: number): Promise<MemoryEntry[]> {
    const queryParams = new URLSearchParams({ query });
    if (limit) queryParams.append("limit", limit.toString());
    const queryString = queryParams.toString();
    return this.request<MemoryEntry[]>(`/api/memory/search?${queryString}`);
  }
}

// Singleton instance getter
let apiClientInstance: OpenClawAPIClient | null = null;

export function getAPIClient(): OpenClawAPIClient {
  if (!apiClientInstance) {
    apiClientInstance = new OpenClawAPIClient();
  }
  return apiClientInstance;
}
