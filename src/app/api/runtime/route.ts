import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PendingItem {
  id: string;
  title: string;
  status: string;
  [key: string]: unknown;
}

interface Risk {
  id: string;
  description: string;
  severity: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    // Get system metrics
    const systemMetrics = await getSystemMetrics();

    // Get agent statuses
    const agentStatuses = await getAgentStatuses();

    // Get pending items and risks (if workspace state exists)
    let pendingItems: PendingItem[] = [];
    let risks: Risk[] = [];

    try {
      const workspaceStatePath = path.join(process.env.HOME || '', '.openclaw', 'workspace', '.openclaw', 'workspace-state.json');
      const workspaceState = JSON.parse(await fs.readFile(workspaceStatePath, 'utf-8'));
      pendingItems = workspaceState.pendingItems || [];
      risks = workspaceState.risks || [];
    } catch {
      // Workspace state not available
    }

    return NextResponse.json({
      pendingItems,
      risks,
      agentStatuses,
      systemMetrics,
    });
  } catch (error) {
    console.error('Error in runtime API:', error);
    return NextResponse.json({
      pendingItems: [],
      risks: [],
      agentStatuses: [],
      systemMetrics: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

interface SystemMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    latency: number;
  };
}

async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    // Get CPU usage (macOS)
    const cpuUsage = await getCpuUsage();

    // Get load average
    const loadAverage = await getLoadAverage();

    // Get memory info (macOS)
    const memory = await getMemoryInfo();

    // Get disk info
    const disk = await getDiskInfo();

    return {
      cpu: {
        usage: cpuUsage,
        loadAverage,
      },
      memory,
      disk,
      network: {
        latency: 0, // Could ping gateway to get real latency
      },
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return {
      cpu: { usage: 0, loadAverage: [0, 0, 0] },
      memory: { used: 0, total: 0, percentage: 0 },
      disk: { used: 0, total: 0, percentage: 0 },
      network: { latency: 0 },
    };
  }
}

async function getCpuUsage(): Promise<number> {
  try {
    // Use top to get CPU usage on macOS
    const { stdout } = await execAsync("top -l 1 | grep 'CPU usage' | awk '{print $3}'");
    const cpuValue = parseFloat(stdout.trim().replace(',', ''));
    return isNaN(cpuValue) ? 0 : cpuValue;
  } catch {
    return 0;
  }
}

async function getLoadAverage(): Promise<number[]> {
  try {
    const { stdout } = await execAsync("uptime");
    const match = stdout.match(/load averages?: ([\d.]+), ([\d.]+), ([\d.]+)/);
    if (match) {
      return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
    }
    return [0, 0, 0];
  } catch {
    return [0, 0, 0];
  }
}

async function getMemoryInfo(): Promise<{ used: number; total: number; percentage: number }> {
  try {
    // Use vm_stat on macOS
    const { stdout } = await execAsync("vm_stat");
    const pageSize = 4096; // macOS page size in bytes

    let freePages = 0;
    let inactivePages = 0;
    let activePages = 0;
    let wiredPages = 0;

    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.includes('Pages free:')) {
        freePages = parseInt(line.split(':')[1].trim().replace('.', ''));
      } else if (line.includes('Pages inactive:')) {
        inactivePages = parseInt(line.split(':')[1].trim().replace('.', ''));
      } else if (line.includes('Pages active:')) {
        activePages = parseInt(line.split(':')[1].trim().replace('.', ''));
      } else if (line.includes('Pages wired:')) {
        wiredPages = parseInt(line.split(':')[1].trim().replace('.', ''));
      }
    }

    const totalPages = freePages + inactivePages + activePages + wiredPages;
    const usedPages = activePages + wiredPages;

    const totalGB = (totalPages * pageSize) / (1024 * 1024 * 1024);
    const usedGB = (usedPages * pageSize) / (1024 * 1024 * 1024);

    return {
      used: Math.round(usedGB * 100) / 100,
      total: Math.round(totalGB * 100) / 100,
      percentage: Math.round((usedGB / totalGB) * 10000) / 100,
    };
  } catch {
    return { used: 0, total: 0, percentage: 0 };
  }
}

async function getDiskInfo(): Promise<{ used: number; total: number; percentage: number }> {
  try {
    const { stdout } = await execAsync("df -h / | tail -1");
    const parts = stdout.split(/\s+/);
    const total = parseFloat(parts[8]);
    const used = parseFloat(parts[9]);
    const percentage = parseInt(parts[9].replace('%', ''));

    return {
      used,
      total,
      percentage,
    };
  } catch {
    return { used: 0, total: 0, percentage: 0 };
  }
}

interface AgentStatus {
  id: string;
  name: string;
  status: string;
  lastActivity: string | null;
  uptime: number;
  sessionCount: number;
  currentTask: string | null;
  error?: string;
}

async function getAgentStatuses(): Promise<Record<string, AgentStatus>> {
  try {
    // Check if OpenClaw Gateway is running
    let gatewayRunning = false;
    try {
      const { stdout } = await execAsync('pgrep -f "openclaw-gateway"');
      gatewayRunning = stdout.trim().length > 0;
    } catch {
      gatewayRunning = false;
    }

    const agentsPath = path.join(process.env.HOME || '', '.openclaw', 'agents');
    const agentDirs = await fs.readdir(agentsPath);
    const validAgentDirs = agentDirs.filter(dir => !dir.startsWith('.'));

    const statuses: Record<string, AgentStatus> = {};

    for (const agentId of validAgentDirs) {
      try {
        // Get session info
        const sessionsPath = path.join(agentsPath, agentId, 'sessions', 'sessions.json');
        const sessionsContent = await fs.readFile(sessionsPath, 'utf-8');
        const sessions = JSON.parse(sessionsContent) as Record<string, { updatedAt?: number }>;
        const sessionKeys = Object.keys(sessions);

        if (sessionKeys.length > 0) {
          // Get most recent session
          sessionKeys.sort((a, b) => {
            const aTime = sessions[a].updatedAt || 0;
            const bTime = sessions[b].updatedAt || 0;
            return bTime - aTime;
          });

          const latestSession = sessions[sessionKeys[0]];
          const lastActivity = latestSession.updatedAt || 0;
          const now = Date.now();
          const hourAgo = now - 60 * 60 * 1000;

          // Determine status based on gateway running state and recent activity
          let status: string;
          if (gatewayRunning) {
            status = lastActivity > hourAgo ? 'working' : 'standby';
          } else {
            status = 'offline';
          }

          statuses[agentId] = {
            id: agentId,
            name: agentId === 'main' ? 'Main' : agentId,
            status,
            lastActivity: new Date(lastActivity).toISOString(),
            uptime: now - lastActivity,
            sessionCount: sessionKeys.length,
            currentTask: null,
          };
        } else {
          statuses[agentId] = {
            id: agentId,
            name: agentId === 'main' ? 'Main' : agentId,
            status: 'offline',
            lastActivity: null,
            uptime: 0,
            sessionCount: 0,
            currentTask: null,
          };
        }
      } catch (error) {
        console.error(`Error getting status for agent ${agentId}:`, error);
        statuses[agentId] = {
          id: agentId,
          name: agentId,
          status: 'error',
          lastActivity: null,
          uptime: 0,
          sessionCount: 0,
          currentTask: null,
          error: 'Failed to get status',
        };
      }
    }

    return statuses;
  } catch {
    return {};
  }
}
