// OpenClaw Gateway API Client

import type {
  GatewayHealth,
  Agent,
  Session,
  Channel,
  LogEntry,
  MemoryEntry,
} from "./types";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface UsageData {
  timeRange: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  breakdown: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  [key: string]: unknown;
}

interface SubscriptionData {
  quota?: {
    used: number;
    limit: number;
  };
  plan?: string;
  status: string;
  [key: string]: unknown;
}

interface DocumentsData {
  [key: string]: Array<{
    name: string;
    path: string;
    type: string;
    size?: number;
    modified?: string;
  }>;
}

interface FileContentResponse {
  content: string;
  path: string;
  size?: number;
  [key: string]: unknown;
}

interface WriteFileResponse {
  success: boolean;
  path: string;
  [key: string]: unknown;
}

interface ApprovalItem {
  id: string;
  actionId: string;
  type: string;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

interface ApprovalResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

interface RuntimeData {
  agentStatuses: Record<string, {
    status: string;
    currentTask?: {
      name: string;
      startedAt?: string;
    };
    nextTask?: {
      name: string;
      scheduledAt?: string;
    };
    recentOutput?: {
      count: number;
      lastActivity?: string;
    };
    uptime?: number;
  }>;
  [key: string]: unknown;
}

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
    // Connect to local Next.js API routes
    // These routes read from OpenClaw's local files
    if (typeof window !== 'undefined') {
      // Browser: use relative path to current domain
      return '';
    }
    // Server: use absolute URL to localhost
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
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

  async getTasks(params?: { limit?: number; offset?: number }): Promise<TaskItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    const queryString = queryParams.toString();
    return this.request<TaskItem[]>(`/api/tasks${queryString ? `?${queryString}` : ""}`);
  }

  async getUsage(params?: { timeRange?: "today" | "7days" | "30days" }): Promise<UsageData> {
    const queryParams = new URLSearchParams();
    if (params?.timeRange) queryParams.append("timeRange", params.timeRange);
    const queryString = queryParams.toString();
    return this.request<UsageData>(`/api/usage${queryString ? `?${queryString}` : ""}`);
  }

  async getSubscription(): Promise<SubscriptionData> {
    return this.request<SubscriptionData>("/api/subscription");
  }

  async getDocuments(agentId?: string): Promise<DocumentsData> {
    const queryParams = new URLSearchParams();
    if (agentId) queryParams.append("agent", agentId);
    const queryString = queryParams.toString();
    return this.request<DocumentsData>(`/api/documents${queryString ? `?${queryString}` : ""}`);
  }

  async getFileContent(path: string): Promise<FileContentResponse> {
    const queryParams = new URLSearchParams({ path });
    return this.request<FileContentResponse>(`/api/files/content?${queryParams.toString()}`);
  }

  async writeFileContent(path: string, content: string): Promise<WriteFileResponse> {
    return this.request<WriteFileResponse>("/api/files/write", {
      method: "POST",
      body: JSON.stringify({ path, content }),
    });
  }

  async getApprovals(params?: { status?: string; limit?: number }): Promise<ApprovalItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString();
    return this.request<ApprovalItem[]>(`/api/approvals${queryString ? `?${queryString}` : ""}`);
  }

  async approveAction(actionId: string, reason?: string): Promise<ApprovalResponse> {
    return this.request<ApprovalResponse>(`/api/approvals/${actionId}/approve`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async rejectAction(actionId: string, reason?: string): Promise<ApprovalResponse> {
    return this.request<ApprovalResponse>(`/api/approvals/${actionId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async getRuntimeData(): Promise<RuntimeData> {
    return this.request<RuntimeData>("/api/runtime");
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
