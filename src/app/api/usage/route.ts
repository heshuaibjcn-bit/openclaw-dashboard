import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    total: number;
  };
}

interface SessionMessage {
  type: string;
  timestamp: string;
  message?: {
    usage?: TokenUsage;
    role?: string;
    content?: any[];
  };
}

interface SessionInfo {
  sessionId: string;
  updatedAt: number;
  sessionFile: string;
}

interface AgentSession {
  sessionId: string;
  updatedAt: number;
  sessionFile: string;
}

interface UsageStats {
  tokens: number;
  cost: number;
  messageCount: number;
  byDate: Map<string, { tokens: number; cost: number }>;
  byAgent: Map<string, { tokens: number; cost: number; messages: number }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7days';

    // Get date range for filtering
    const now = Date.now();
    const ranges = {
      today: now - 24 * 60 * 60 * 1000,
      '7days': now - 7 * 24 * 60 * 60 * 1000,
      '30days': now - 30 * 24 * 60 * 60 * 1000,
    };
    const startTime = ranges[timeRange as keyof typeof ranges] || ranges['7days'];

    // Collect usage data from all sessions
    const usageStats = await collectUsageStats(startTime);

    // Calculate attribution data
    const attribution = generateAttribution(usageStats);

    // Calculate time range specific stats
    const today = calculateTimeRangeStats(usageStats.byDate, ranges.today);
    const last7days = calculateTimeRangeStats(usageStats.byDate, ranges['7days']);
    const last30days = calculateTimeRangeStats(usageStats.byDate, ranges['30days']);

    return NextResponse.json({
      today,
      last7days,
      last30days,
      attribution,
    });
  } catch (error) {
    console.error('Error in usage API:', error);
    return NextResponse.json({
      today: { tokens: 0, cost: 0 },
      last7days: { tokens: 0, cost: 0 },
      last30days: { tokens: 0, cost: 0 },
      attribution: [],
    }, { status: 500 });
  }
}

async function collectUsageStats(startTime: number): Promise<UsageStats> {
  const stats: UsageStats = {
    tokens: 0,
    cost: 0,
    messageCount: 0,
    byDate: new Map(),
    byAgent: new Map(),
  };

  const homeDir = process.env.HOME || '';
  const agentsPath = path.join(homeDir, '.openclaw', 'agents');

  try {
    // Get all agent directories
    const agentDirs = await fs.readdir(agentsPath);

    for (const agentId of agentDirs) {
      if (agentId.startsWith('.')) continue;

      const sessionsJsonPath = path.join(agentsPath, agentId, 'sessions', 'sessions.json');

      try {
        // Read sessions.json to get session info
        const sessionsContent = await fs.readFile(sessionsJsonPath, 'utf-8');
        const sessions: Record<string, SessionInfo> = JSON.parse(sessionsContent);

        // Process each session
        for (const [sessionKey, session] of Object.entries(sessions)) {
          if (!session.sessionFile || session.updatedAt < startTime) continue;

          await processSessionFile(session.sessionFile, startTime, agentId, stats);
        }
      } catch (error) {
        // Agent might not have sessions or error reading
        continue;
      }
    }
  } catch (error) {
    console.error('Error reading agents directory:', error);
  }

  return stats;
}

async function processSessionFile(
  sessionFile: string,
  startTime: number,
  agentId: string,
  stats: UsageStats
): Promise<void> {
  try {
    const content = await fs.readFile(sessionFile, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        const message: SessionMessage = JSON.parse(line);

        // Skip messages outside time range
        const messageTime = new Date(message.timestamp).getTime();
        if (messageTime < startTime) continue;

        // Only process assistant messages with usage data
        if (message.message?.role === 'assistant' && message.message.usage) {
          const usage = message.message.usage;
          const tokens = usage.totalTokens || 0;
          const cost = usage.cost?.total || 0;

          // Update total stats
          stats.tokens += tokens;
          stats.cost += cost;
          stats.messageCount++;

          // Group by date
          const dateKey = new Date(messageTime).toISOString().split('T')[0];
          const dateStats = stats.byDate.get(dateKey) || { tokens: 0, cost: 0 };
          dateStats.tokens += tokens;
          dateStats.cost += cost;
          stats.byDate.set(dateKey, dateStats);

          // Group by agent
          const agentStats = stats.byAgent.get(agentId) || { tokens: 0, cost: 0, messages: 0 };
          agentStats.tokens += tokens;
          agentStats.cost += cost;
          agentStats.messages++;
          stats.byAgent.set(agentId, agentStats);
        }
      } catch (parseError) {
        // Skip invalid JSON lines
        continue;
      }
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

function calculateTimeRangeStats(
  byDate: Map<string, { tokens: number; cost: number }>,
  startTime: number
): { tokens: number; cost: number } {
  let tokens = 0;
  let cost = 0;

  for (const [dateStr, dateStats] of byDate.entries()) {
    const date = new Date(dateStr).getTime();
    if (date >= startTime) {
      tokens += dateStats.tokens;
      cost += dateStats.cost;
    }
  }

  return { tokens, cost };
}

function generateAttribution(stats: UsageStats): Array<{
  id: string;
  name: string;
  type: 'task' | 'agent' | 'project';
  tokens: number;
  cost: number;
  percentage: number;
}> {
  const attribution: Array<{
    id: string;
    name: string;
    type: 'task' | 'agent' | 'project';
    tokens: number;
    cost: number;
    percentage: number;
  }> = [];

  const totalTokens = stats.tokens || 1; // Avoid division by zero

  // Add agent attribution
  for (const [agentId, agentStats] of stats.byAgent.entries()) {
    attribution.push({
      id: agentId,
      name: agentId === 'main' ? 'Main Agent' : agentId,
      type: 'agent',
      tokens: agentStats.tokens,
      cost: agentStats.cost,
      percentage: (agentStats.tokens / totalTokens) * 100,
    });
  }

  // Sort by tokens descending
  attribution.sort((a, b) => b.tokens - a.tokens);

  return attribution;
}
