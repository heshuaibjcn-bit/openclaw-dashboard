/**
 * OpenClaw configuration reader
 * Reads ~/.openclaw/openclaw.json to get active agent roster
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// Config file paths
const DEFAULT_OPENCLAW_HOME = path.join(os.homedir(), '.openclaw');
const OPENCLAW_HOME = process.env.OPENCLAW_HOME || DEFAULT_OPENCLAW_HOME;
const CONFIG_FILE = path.join(OPENCLAW_HOME, 'openclaw.json');

// OpenClaw agent configuration types
export interface OpenClawAgent {
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

export interface OpenClawConfig {
  version: string;
  agents: OpenClawAgent[];
  channels: Array<{
    id: string;
    name: string;
    type: 'feishu' | 'imessage' | 'telegram' | 'slack' | 'discord';
    enabled: boolean;
  }>;
  gateway?: {
    url: string;
    port?: number;
  };
  memory?: {
    enabled: boolean;
    provider: 'lancedb' | 'chromadb' | 'pinecone';
    path?: string;
  };
  settings?: {
    timezone?: string;
    locale?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Read OpenClaw configuration from ~/.openclaw/openclaw.json
 */
export function readOpenClawConfig(): OpenClawConfig | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      console.warn(`OpenClaw config not found at ${CONFIG_FILE}`);
      return null;
    }
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content) as OpenClawConfig;
  } catch (error) {
    console.error(`Error reading OpenClaw config from ${CONFIG_FILE}:`, error);
    return null;
  }
}

/**
 * Get active agents from configuration
 */
export function getActiveAgents(): OpenClawAgent[] {
  const config = readOpenClawConfig();
  if (!config) {
    return [];
  }
  return config.agents.filter(agent => agent.status === 'active');
}

/**
 * Get all agents from configuration
 */
export function getAllAgents(): OpenClawAgent[] {
  const config = readOpenClawConfig();
  if (!config) {
    return [];
  }
  return config.agents;
}

/**
 * Get agent by ID
 */
export function getAgentById(id: string): OpenClawAgent | null {
  const agents = getAllAgents();
  return agents.find(agent => agent.id === id) || null;
}

/**
 * Get agent by name
 */
export function getAgentByName(name: string): OpenClawAgent | null {
  const agents = getAllAgents();
  return agents.find(agent => agent.name === name) || null;
}

/**
 * Get enabled channels from configuration
 */
export function getEnabledChannels(): OpenClawConfig['channels'] {
  const config = readOpenClawConfig();
  if (!config) {
    return [];
  }
  return config.channels?.filter(channel => channel.enabled) || [];
}

/**
 * Get gateway URL from configuration
 */
export function getGatewayUrl(): string {
  const config = readOpenClawConfig();
  if (config?.gateway?.url) {
    return config.gateway.url;
  }
  // Default gateway URL
  return 'ws://127.0.0.1:18789';
}

/**
 * Check if memory is enabled in configuration
 */
export function isMemoryEnabled(): boolean {
  const config = readOpenClawConfig();
  return config?.memory?.enabled || false;
}

/**
 * Get memory provider from configuration
 */
export function getMemoryProvider(): string {
  const config = readOpenClawConfig();
  return config?.memory?.provider || 'lancedb';
}

/**
 * Get configuration status
 */
export function getConfigStatus(): {
  available: boolean;
  path: string;
  agentCount: number;
  activeAgentCount: number;
  channelCount: number;
  memoryEnabled: boolean;
} {
  const config = readOpenClawConfig();
  const agents = config?.agents || [];
  const activeAgents = agents.filter(a => a.status === 'active');

  return {
    available: config !== null,
    path: CONFIG_FILE,
    agentCount: agents.length,
    activeAgentCount: activeAgents.length,
    channelCount: config?.channels?.length || 0,
    memoryEnabled: config?.memory?.enabled || false,
  };
}

/**
 * Get agent IDs grouped by status
 */
export function getAgentsByStatus(): Record<string, OpenClawAgent[]> {
  const agents = getAllAgents();
  return {
    active: agents.filter(a => a.status === 'active'),
    inactive: agents.filter(a => a.status === 'inactive'),
    archived: agents.filter(a => a.status === 'archived'),
  };
}

/**
 * Search agents by name or capabilities
 */
export function searchAgents(query: string): OpenClawAgent[] {
  const agents = getAllAgents();
  const lowerQuery = query.toLowerCase();
  return agents.filter(agent =>
    agent.name.toLowerCase().includes(lowerQuery) ||
    agent.capabilities?.some(cap => cap.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get agents with specific capability
 */
export function getAgentsWithCapability(capability: string): OpenClawAgent[] {
  const agents = getAllAgents();
  return agents.filter(agent =>
    agent.capabilities?.includes(capability)
  );
}

/**
 * Get agents using specific channel
 */
export function getAgentsWithChannel(channelId: string): OpenClawAgent[] {
  const agents = getAllAgents();
  return agents.filter(agent =>
    agent.channels?.includes(channelId)
  );
}
