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
    // Always use the same origin (Next.js API routes)
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
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
    return this.request<GatewayHealth>("/api/health");
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

  async getTasks(params?: { limit?: number; offset?: number }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    const queryString = queryParams.toString();
    return this.request<any[]>(`/api/tasks${queryString ? `?${queryString}` : ""}`);
  }

  async getUsage(params?: { timeRange?: "today" | "7days" | "30days" }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.timeRange) queryParams.append("timeRange", params.timeRange);
    const queryString = queryParams.toString();
    return this.request<any>(`/api/usage${queryString ? `?${queryString}` : ""}`);
  }

  async getSubscription(): Promise<any> {
    return this.request<any>("/api/subscription");
  }

  async getDocuments(agentId?: string): Promise<any> {
    const queryParams = new URLSearchParams();
    if (agentId) queryParams.append("agent", agentId);
    const queryString = queryParams.toString();
    return this.request<any>(`/api/documents${queryString ? `?${queryString}` : ""}`);
  }

  async getFileContent(path: string): Promise<any> {
    const queryParams = new URLSearchParams({ path });
    return this.request<any>(`/api/files/content?${queryParams.toString()}`);
  }

  async writeFileContent(path: string, content: string): Promise<any> {
    return this.request<any>("/api/files/write", {
      method: "POST",
      body: JSON.stringify({ path, content }),
    });
  }

  async getApprovals(params?: { status?: string; limit?: number }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString();
    return this.request<any[]>(`/api/approvals${queryString ? `?${queryString}` : ""}`);
  }

  async approveAction(actionId: string, reason?: string): Promise<any> {
    return this.request<any>(`/api/approvals/${actionId}/approve`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async rejectAction(actionId: string, reason?: string): Promise<any> {
    return this.request<any>(`/api/approvals/${actionId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async getRuntimeData(): Promise<any> {
    return this.request<any>("/api/runtime");
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
