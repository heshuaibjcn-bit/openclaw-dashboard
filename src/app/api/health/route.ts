import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface OpenClawConfig {
  meta?: {
    lastTouchedVersion?: string;
  };
  channels?: {
    imessage?: {
      enabled: boolean;
    };
    feishu?: {
      enabled: boolean;
    };
  };
}

export async function GET() {
  try {
    const openclawConfigPath = path.join(process.env.HOME || '', '.openclaw', 'openclaw.json');
    const configContent = await fs.readFile(openclawConfigPath, 'utf-8');
    const config: OpenClawConfig = JSON.parse(configContent);

    // Check if OpenClaw Gateway is running
    const gatewayRunning = await isGatewayRunning();

    // Get system uptime (not Gateway uptime)
    const uptime = await getSystemUptime();

    // Get channels from config
    const channels = [];
    if (config.channels?.imessage?.enabled) {
      channels.push({ name: 'iMessage', enabled: true, status: 'connected' });
    }
    if (config.channels?.feishu?.enabled) {
      channels.push({ name: 'Feishu', enabled: true, status: 'connected' });
    }

    // Get session count
    const sessions = await getSessionCount();

    // Get agent count
    const agents = await getAgentCount();

    return NextResponse.json({
      status: gatewayRunning ? 'healthy' : 'degraded',
      uptime,
      version: config.meta?.lastTouchedVersion || 'unknown',
      os: process.platform,
      nodeVersion: process.version,
      channels,
      sessions,
      agents,
      gatewayRunning,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      uptime: 0,
      version: 'unknown',
      os: process.platform,
      nodeVersion: process.version,
      channels: [],
      sessions: 0,
      agents: 0,
      gatewayRunning: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function isGatewayRunning(): Promise<boolean> {
  try {
    // Check if Gateway process is running
    const { stdout } = await execAsync('pgrep -fl "openclaw.*gateway" || echo "not running"');
    return stdout.trim() !== '' && !stdout.includes('not running');
  } catch {
    return false;
  }
}

async function getSystemUptime(): Promise<number> {
  try {
    if (process.platform === 'darwin') {
      // macOS: use uptime command
      const { stdout } = await execAsync('uptime | awk \'{print $3}\'');
      const uptimeStr = stdout.trim();
      const parts = uptimeStr.split(':');
      if (parts.length === 2) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        return (hours * 3600) + (minutes * 60);
      }
    }

    // Fallback: use process.uptime()
    return process.uptime();
  } catch {
    return process.uptime();
  }
}

async function getSessionCount(): Promise<number> {
  try {
    const sessionsPath = path.join(process.env.HOME || '', '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');
    const content = await fs.readFile(sessionsPath, 'utf-8');
    const sessions = JSON.parse(content);
    return Object.keys(sessions).length;
  } catch {
    return 0;
  }
}

async function getAgentCount(): Promise<number> {
  try {
    const agentsPath = path.join(process.env.HOME || '', '.openclaw', 'agents');
    const agentDirs = await fs.readdir(agentsPath);
    return agentDirs.filter(dir => !dir.startsWith('.')).length;
  } catch {
    return 0;
  }
}
