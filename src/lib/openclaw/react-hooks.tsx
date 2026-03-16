// React hooks for OpenClaw API

"use client";

import { useState, useEffect, useCallback } from "react";
import { getAPIClient } from "./api-client";
import { apiCache, CacheKeys } from "./cache";
import type {
  GatewayHealth,
  Agent,
  Session,
  Channel,
  LogEntry,
  MemoryEntry,
} from "./types";

// Type definitions for API responses
interface SkillItem {
  id: string;
  name: string;
  description?: string;
  extension: string;
  category?: string;
  tags?: string[];
  tools?: string[];
  [key: string]: unknown;
}

interface UsageData {
  today: { tokens: number; cost: number };
  last7days: { tokens: number; cost: number };
  last30days: { tokens: number; cost: number };
  attribution?: Array<{
    id: string;
    name: string;
    type: "task" | "agent" | "project";
    tokens: number;
    cost: number;
    percentage: number;
  }>;
  [key: string]: unknown;
}

interface SubscriptionData {
  quota?: {
    limit: number;
    used: number;
    remaining: number;
    window: string;
    resetAt: string;
  };
  [key: string]: unknown;
}

interface RuntimeData {
  agentStatuses: Record<string, {
    status: 'working' | 'standby' | 'offline';
    currentTask?: {
      taskId: string;
      title: string;
      progress: number;
      startedAt: string;
    };
    nextTask?: {
      taskId: string;
      title: string;
      scheduledAt: string;
    };
    recentOutput?: {
      count: number;
      lastActivity: string;
    };
    uptime?: number;
  }>;
  pendingItems?: Array<{
    id: string;
    type: 'approval' | 'exception' | 'alert';
    title: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    source?: string;
  }>;
  risks?: Array<{
    id: string;
    type: 'budget' | 'stalled' | 'system';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affected?: string[];
  }>;
  [key: string]: unknown;
}

export function useGatewayHealth(options?: { enabled?: boolean; interval?: number }) {
  const { enabled = true, interval = 30000 } = options || {};
  const [data, setData] = useState<GatewayHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);

  const fetchHealth = useCallback(async (useCache = true) => {
    if (!enabled) return;

    try {
      // Try to get cached data first for instant display
      if (useCache) {
        const cached = apiCache.get<GatewayHealth>(CacheKeys.GATEWAY_HEALTH);
        if (cached) {
          setData(cached);
          setLoading(false);
        }
      }

      setError(null);
      const client = getAPIClient();
      const health = await client.getHealth();

      // Update cache
      apiCache.set(CacheKeys.GATEWAY_HEALTH, health, interval);

      setData(health);
      setLastChecked(new Date());
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch health"));
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  }, [enabled, interval]);

  useEffect(() => {
    if (!enabled) return;

    fetchHealth(true);

    // Only set up interval if auto-refresh is enabled
    if (isAutoRefreshing) {
      const intervalId = setInterval(() => fetchHealth(false), interval);
      return () => clearInterval(intervalId);
    }
  }, [fetchHealth, interval, isAutoRefreshing, enabled]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchHealth(false),
    lastChecked,
    isAutoRefreshing,
    toggleAutoRefresh: () => setIsAutoRefreshing(prev => !prev),
  };
}

export function useAgents() {
  const [data, setData] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const agents = await client.getAgents();
      setData(agents);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch agents"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { data, loading, error, refetch: fetchAgents };
}

export function useSessions() {
  const [data, setData] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const sessions = await client.getSessions();
      setData(sessions);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch sessions"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    // Refresh every 10 seconds
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  return { data, loading, error, refetch: fetchSessions };
}

export function useChannels() {
  const [data, setData] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const channels = await client.getChannels();
      setData(channels);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch channels"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
    // Refresh every 15 seconds
    const interval = setInterval(fetchChannels, 15000);
    return () => clearInterval(interval);
  }, [fetchChannels]);

  return { data, loading, error, refetch: fetchChannels };
}

export function useLogs(options: { level?: string; limit?: number } = {}) {
  const [data, setData] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const logs = await client.getLogs(options);
      setData(logs);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch logs"));
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchLogs();
    // Refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return { data, loading, error, refetch: fetchLogs };
}

export function useMemorySearch() {
  const [data, setData] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const results = await client.searchMemory(query, limit);
      setData(results);
      return results;
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to search memory"));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, search };
}

export function useMemoryList(options?: { limit?: number; offset?: number; enabled?: boolean }) {
  const { limit = 50, offset = 0, enabled = true } = options || {};
  const [data, setData] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchMemories = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/memory/list?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch memory list: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.memories || []);
      setTotal(result.total || 0);
      setHasMore(result.hasMore || false);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch memory list"));
    } finally {
      setLoading(false);
    }
  }, [enabled, limit, offset]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  return { data, loading, error, refetch: fetchMemories, total, hasMore };
}

export function useSkills() {
  const [data, setData] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [extensions, setExtensions] = useState<string[]>([]);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Add timestamp to prevent caching
      const response = await fetch(`/api/skills?_t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch skills: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.skills || []);
      setExtensions(result.extensions || []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch skills"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return { data, loading, error, refetch: fetchSkills, extensions };
}

export function useTasks(params?: { limit?: number; offset?: number }) {
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      // Default to fetching all tasks to avoid pagination issues
      const taskParams = params?.limit ? params : { limit: 100 };
      const tasks = await client.getTasks(taskParams);
      setData(tasks);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch tasks"));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { data, loading, error, refetch: fetchTasks };
}

export function useUsage(timeRange: "today" | "7days" | "30days" = "7days") {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const usage = await client.getUsage({ timeRange });
      setData(usage as unknown as UsageData);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch usage"));
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchUsage();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, [fetchUsage]);

  return { data, loading, error, refetch: fetchUsage };
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const subscription = await client.getSubscription();
      setData(subscription as unknown as SubscriptionData);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch subscription"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
    // Refresh every 60 seconds
    const interval = setInterval(fetchSubscription, 60000);
    return () => clearInterval(interval);
  }, [fetchSubscription]);

  return { data, loading, error, refetch: fetchSubscription };
}

export function useDocuments(agentId?: string) {
  const [data, setData] = useState<Record<string, Array<{
    name: string;
    path: string;
    type: "file" | "folder";
    size?: number;
    modified?: string;
  }>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const documents = await client.getDocuments(agentId);
      setData(documents as unknown as Record<string, Array<{
        name: string;
        path: string;
        type: "file" | "folder";
        size?: number;
        modified?: string;
      }>>);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch documents"));
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { data, loading, error, refetch: fetchDocuments };
}

export function useApprovals(statusFilter?: string) {
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const approvals = await client.getApprovals({ status: statusFilter });
      setData(approvals);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch approvals"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApprovals();
    // Refresh every 10 seconds for pending approvals
    const interval = setInterval(fetchApprovals, 10000);
    return () => clearInterval(interval);
  }, [fetchApprovals]);

  const approveAction = useCallback(async (actionId: string, reason?: string) => {
    try {
      const client = getAPIClient();
      await client.approveAction(actionId, reason);
      await fetchApprovals();
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to approve action"));
      throw e;
    }
  }, [fetchApprovals]);

  const rejectAction = useCallback(async (actionId: string, reason?: string) => {
    try {
      const client = getAPIClient();
      await client.rejectAction(actionId, reason);
      await fetchApprovals();
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to reject action"));
      throw e;
    }
  }, [fetchApprovals]);

  return { data, loading, error, refetch: fetchApprovals, approveAction, rejectAction };
}

export function useRuntimeData() {
  const [data, setData] = useState<RuntimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRuntimeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const runtime = await client.getRuntimeData();
      setData(runtime as unknown as RuntimeData);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch runtime data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuntimeData();
    // Refresh every 15 seconds
    const interval = setInterval(fetchRuntimeData, 15000);
    return () => clearInterval(interval);
  }, [fetchRuntimeData]);

  return { data, loading, error, refetch: fetchRuntimeData };
}
