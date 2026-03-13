import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const agentsPath = path.join(process.env.HOME || '', '.openclaw', 'agents');
    const agentDirs = await fs.readdir(agentsPath);
    const validAgentDirs = agentDirs.filter(dir => !dir.startsWith('.'));

    const agents = await Promise.all(validAgentDirs.map(async (agentId) => {
      try {
        const configPath = path.join(agentsPath, agentId, 'agent', 'config.json');
        const configContent = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configContent);

        // Get recent session info
        const sessionsPath = path.join(agentsPath, agentId, 'sessions', 'sessions.json');
        let recentActivity = new Date().toISOString();
        try {
          const sessionsContent = await fs.readFile(sessionsPath, 'utf-8');
          const sessions = JSON.parse(sessionsContent);
          const sessionKeys = Object.keys(sessions);
          if (sessionKeys.length > 0) {
            const latestSession = sessions[sessionKeys[0]];
            recentActivity = new Date(latestSession.updatedAt).toISOString();
          }
        } catch {}

        return {
          id: agentId,
          name: config.name || agentId,
          model: config.model || 'unknown',
          status: 'active',
          capabilities: config.capabilities || [],
          createdAt: config.createdAt || new Date().toISOString(),
          currentTask: null,
          nextTask: null,
          recentOutput: {
            count: 0,
            lastActivity: recentActivity,
          },
        };
      } catch (error) {
        return {
          id: agentId,
          name: agentId,
          model: 'unknown',
          status: 'inactive',
          capabilities: [],
          createdAt: new Date().toISOString(),
        };
      }
    }));

    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
