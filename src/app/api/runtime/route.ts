import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get pending items from workspace state
    const workspaceStatePath = path.join(process.env.HOME || '', '.openclaw', 'workspace', '.openclaw', 'workspace-state.json');
    let pendingItems: any[] = [];
    let risks: any[] = [];

    try {
      const workspaceState = JSON.parse(await fs.readFile(workspaceStatePath, 'utf-8'));
      // Extract pending items if available
      pendingItems = workspaceState.pendingItems || [];
      risks = workspaceState.risks || [];
    } catch {}

    // Get agent statuses
    const agents = await getAgentStatuses();

    return NextResponse.json({
      pendingItems,
      risks,
      agents,
      systemMetrics: {
        cpu: {
          usage: Math.random() * 30 + 10, // Mock CPU usage
          loadAverage: [1.2, 1.5, 1.8],
        },
        memory: {
          used: 8.2,
          total: 16,
          percentage: 51.25,
        },
        disk: {
          used: 256,
          total: 512,
          percentage: 50,
        },
        network: {
          latency: Math.random() * 20 + 5,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      pendingItems: [],
      risks: [],
      agents: [],
      systemMetrics: null,
    }, { status: 500 });
  }
}

async function getAgentStatuses() {
  try {
    const agentsPath = path.join(process.env.HOME || '', '.openclaw', 'agents');
    const agentDirs = await fs.readdir(agentsPath);
    const validAgentDirs = agentDirs.filter(dir => !dir.startsWith('.'));

    return await Promise.all(validAgentDirs.map(async (agentId) => {
      return {
        id: agentId,
        name: agentId,
        status: 'active',
        currentTask: null,
        uptime: Math.random() * 86400000,
      };
    }));
  } catch {
    return [];
  }
}
