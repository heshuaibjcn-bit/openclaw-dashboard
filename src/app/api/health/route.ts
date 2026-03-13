import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const openclawConfigPath = path.join(process.env.HOME || '', '.openclaw', 'openclaw.json');
    const configContent = await fs.readFile(openclawConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    // Get gateway status from process
    const gatewayProcess = await getGatewayProcess();

    return NextResponse.json({
      status: gatewayProcess ? 'healthy' : 'degraded',
      uptime: gatewayProcess?.uptime || 0,
      version: config.meta?.lastTouchedVersion || 'unknown',
      os: process.platform,
      nodeVersion: process.version,
      channels: await getChannelsStatus(),
      sessions: await getSessionCount(),
      agents: await getAgentCount(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      uptime: 0,
      version: 'unknown',
      os: process.platform,
      nodeVersion: process.version,
      channels: [],
      sessions: 0,
      agents: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function getGatewayProcess() {
  try {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('pgrep -f "openclaw-gateway"', (error: any, stdout: string) => {
        if (error || !stdout.trim()) {
          resolve(null);
          return;
        }
        const pid = parseInt(stdout.trim());
        exec(`ps -p ${pid} -o etime=`, (error: any, etime: string) => {
          if (error) {
            resolve(null);
            return;
          }
          // Parse uptime from etime format
          resolve({ pid, uptime: etime.trim() });
        });
      });
    });
  } catch {
    return null;
  }
}

async function getChannelsStatus() {
  try {
    const openclawConfigPath = path.join(process.env.HOME || '', '.openclaw', 'openclaw.json');
    const configContent = await fs.readFile(openclawConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    const channels = [];
    if (config.channels?.imessage?.enabled) {
      channels.push({ name: 'iMessage', enabled: true, status: 'connected' });
    }
    if (config.channels?.feishu?.enabled) {
      channels.push({ name: 'Feishu', enabled: true, status: 'connected' });
    }

    return channels;
  } catch {
    return [];
  }
}

async function getSessionCount() {
  try {
    const sessionsPath = path.join(process.env.HOME || '', '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');
    const content = await fs.readFile(sessionsPath, 'utf-8');
    const sessions = JSON.parse(content);
    return Object.keys(sessions).length;
  } catch {
    return 0;
  }
}

async function getAgentCount() {
  try {
    const agentsPath = path.join(process.env.HOME || '', '.openclaw', 'agents');
    const agentDirs = await fs.readdir(agentsPath);
    return agentDirs.filter(dir => !dir.startsWith('.')).length;
  } catch {
    return 0;
  }
}
