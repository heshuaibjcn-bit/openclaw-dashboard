import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SessionEntry {
  updatedAt?: string | number;
  [key: string]: unknown;
}

// Check if OpenClaw Gateway is running
async function isGatewayRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('pgrep -f "openclaw-gateway"');
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

interface OpenClawConfig {
  agents?: {
    defaults?: {
      model?: {
        primary?: string;
      };
    };
  };
}

interface AgentModels {
  providers?: {
    [provider: string]: {
      models?: Array<{
        id: string;
        name: string;
        reasoning?: boolean;
        contextWindow?: number;
        maxTokens?: number;
      }>;
    };
  };
}

export async function GET() {
  try {
    const agentsPath = path.join(process.env.HOME || '', '.openclaw', 'agents');
    const agentDirs = await fs.readdir(agentsPath);
    const validAgentDirs = agentDirs.filter(dir => !dir.startsWith('.'));

    // Check if OpenClaw Gateway is running
    const gatewayRunning = await isGatewayRunning();

    // Read OpenClaw config for default model
    let defaultModel: string | undefined;
    try {
      const configPath = path.join(process.env.HOME || '', '.openclaw', 'openclaw.json');
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config: OpenClawConfig = JSON.parse(configContent);
      defaultModel = config.agents?.defaults?.model?.primary;
    } catch {}

    const agents = await Promise.all(validAgentDirs.map(async (agentId) => {
      try {
        // Read agent's models.json
        const modelsPath = path.join(agentsPath, agentId, 'agent', 'models.json');
        let modelName = 'Unknown';
        let modelId = defaultModel || 'unknown';
        let contextWindow = 0;
        let maxTokens = 0;

        try {
          const modelsContent = await fs.readFile(modelsPath, 'utf-8');
          const modelsData: AgentModels = JSON.parse(modelsContent);

          // Get first provider and first model
          const providers = Object.values(modelsData.providers || {});
          if (providers.length > 0 && providers[0].models && providers[0].models.length > 0) {
            const firstModel = providers[0].models[0];
            modelId = firstModel.id;
            modelName = firstModel.name;
            contextWindow = firstModel.contextWindow || 0;
            maxTokens = firstModel.maxTokens || 0;
          }
        } catch (modelError) {
          console.warn(`Failed to read models for ${agentId}:`, modelError);
          // Use default from config
          if (defaultModel) {
            const parts = defaultModel.split('/');
            modelId = defaultModel;
            modelName = parts[parts.length - 1] || defaultModel;
          }
        }

        // Get session info
        const sessionsPath = path.join(agentsPath, agentId, 'sessions', 'sessions.json');
        let totalSessions = 0;
        let recentActivity = new Date().toISOString();
        let activeSession: SessionEntry | null = null;

        try {
          const sessionsContent = await fs.readFile(sessionsPath, 'utf-8');
          const sessions: Record<string, SessionEntry> = JSON.parse(sessionsContent);
          const sessionKeys = Object.keys(sessions);
          totalSessions = sessionKeys.length;

          if (sessionKeys.length > 0) {
            // Sort by updatedAt descending
            sessionKeys.sort((a, b) => {
              const aTime = (sessions[a].updatedAt || 0) as number;
              const bTime = (sessions[b].updatedAt || 0) as number;
              return bTime - aTime;
            });

            activeSession = sessions[sessionKeys[0]];
            const latestTime = activeSession.updatedAt || 0;
            recentActivity = new Date(latestTime).toISOString();
          }
        } catch (sessionError) {
          console.warn(`Failed to read sessions for ${agentId}:`, sessionError);
        }

        // Determine agent status based on gateway running state and recent activity
        const lastActivityTime = new Date(recentActivity).getTime();
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        let status: string;
        if (gatewayRunning) {
          // Gateway is running: check if agent has recent activity
          status = lastActivityTime > oneHourAgo ? 'active' : 'idle';
        } else {
          // Gateway is not running: agent is offline
          status = 'offline';
        }

        return {
          id: agentId,
          name: agentId === 'main' ? 'Main' : agentId.charAt(0).toUpperCase() + agentId.slice(1),
          model: modelName,
          modelId: modelId,
          status,
          capabilities: [],
          contextWindow,
          maxTokens,
          totalSessions,
          activeSession: activeSession ? {
            id: activeSession.sessionId || activeSession.id,
            updatedAt: activeSession.updatedAt,
            lastChannel: activeSession.lastChannel,
            chatType: activeSession.chatType,
          } : null,
          createdAt: new Date().toISOString(),
          recentOutput: {
            count: totalSessions,
            lastActivity: recentActivity,
          },
        };
      } catch (error) {
        console.error(`Error processing agent ${agentId}:`, error);
        return {
          id: agentId,
          name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
          model: defaultModel ? defaultModel.split('/').pop() : 'Unknown',
          modelId: defaultModel || 'unknown',
          status: 'error',
          capabilities: [],
          totalSessions: 0,
          activeSession: null,
          createdAt: new Date().toISOString(),
        };
      }
    }));

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error reading agents:', error);
    return NextResponse.json([], { status: 500 });
  }
}
