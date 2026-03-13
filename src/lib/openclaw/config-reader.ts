/**
 * OpenClaw configuration reader
 * Reads ~/.openclaw/openclaw.json to get active agent roster
 */

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// For browser, use mock data. For server, use actual file system
let configCache: OpenClawConfig | null = null;

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
  // Return cached config if available
  if (configCache) {
    return configCache;
  }

  // In browser mode, return mock config
  if (isBrowser) {
    // Mock config for browser/demo mode
    const mockConfig: OpenClawConfig = {
      version: "1.0.0",
      agents: [
        {
          id: "agent-main",
          name: "Main Assistant",
          model: "zai/glm-5",
          status: "active",
          capabilities: ["code-review", "documentation", "analysis"],
          channels: ["feishu"],
          createdAt: new Date().toISOString(),
        },
        {
          id: "agent-helper",
          name: "Helper Bot",
          model: "zai/glm-4.7",
          status: "active",
          capabilities: ["debug", "testing", "support"],
          channels: ["feishu", "imessage"],
          createdAt: new Date().toISOString(),
        },
        {
          id: "agent-docs",
          name: "Documentation Agent",
          model: "zai/glm-4.7-flash",
          status: "active",
          capabilities: ["documentation", "writing"],
          channels: [],
          createdAt: new Date().toISOString(),
        },
      ],
      channels: [
        { id: "feishu", name: "Feishu", type: "feishu", enabled: true },
        { id: "imessage", name: "iMessage", type: "imessage", enabled: true },
      ],
      gateway: {
        url: "ws://127.0.0.1:18789",
        port: 18789,
      },
      memory: {
        enabled: true,
        provider: "lancedb",
        path: "~/.openclaw/memory",
      },
      settings: {
        timezone: "UTC",
        locale: "en",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    configCache = mockConfig;
    return mockConfig;
  }

  // Server-side: would use fs here, but for now return null
  // TODO: Implement server-side file reading
  return null;
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
