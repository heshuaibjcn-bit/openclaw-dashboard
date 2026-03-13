// React hooks for OpenClaw API

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAPIClient,
  type OpenClawAPIClient,
  type GatewayHealth,
  type Agent,
  type Session,
  type Channel,
  type LogEntry,
  type MemoryEntry,
  OpenClawAPIError,
} from "./api-client";

export function useGatewayHealth() {
  const [data, setData] = useState<GatewayHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const health = await client.getHealth();
      setData(health);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch health"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return { data, loading, error, refetch: fetchHealth };
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
  }, [JSON.stringify(options)]);

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
