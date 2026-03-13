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
        // Try to read models.json first (current OpenClaw structure)
        const modelsPath = path.join(agentsPath, agentId, 'agent', 'models.json');
        const modelsContent = await fs.readFile(modelsPath, 'utf-8');
        const models = JSON.parse(modelsContent);

        // Get model from first model entry
        const modelId = models.length > 0 ? models[0].id : 'unknown';

        // Get recent session info
        const sessionsPath = path.join(agentsPath, agentId, 'sessions', 'sessions.json');
        let recentActivity = new Date().toISOString();
        let hasActiveSessions = false;
        try {
          const sessionsContent = await fs.readFile(sessionsPath, 'utf-8');
          const sessions = JSON.parse(sessionsContent);
          const sessionKeys = Object.keys(sessions);
          if (sessionKeys.length > 0) {
            const latestSession = sessions[sessionKeys[0]];
            recentActivity = new Date(latestSession.updatedAt).toISOString();
            // Consider agent as active if there are recent sessions (last 24 hours)
            const lastActivityTime = new Date(latestSession.updatedAt).getTime();
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            hasActiveSessions = lastActivityTime > oneDayAgo;
          }
        } catch {}

        return {
          id: agentId,
          name: agentId.charAt(0).toUpperCase() + agentId.slice(1), // Capitalize first letter
          model: modelId,
          status: hasActiveSessions ? 'active' : 'inactive',
          capabilities: [],
          createdAt: new Date().toISOString(),
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
