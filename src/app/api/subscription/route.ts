import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface OpenClawConfig {
  models?: {
    providers?: {
      [key: string]: {
        baseUrl?: string;
        api?: string;
        models?: Array<{
          id: string;
          name: string;
          cost?: {
            input: number;
            output: number;
            cacheRead?: number;
            cacheWrite?: number;
          };
          contextWindow?: number;
          maxTokens?: number;
        }>;
      };
    };
  };
}

interface SessionUsage {
  totalTokens: number;
  totalCost: number;
  messageCount: number;
}

export async function GET() {
  try {
    const homeDir = process.env.HOME || '';
    const configPath = path.join(homeDir, '.openclaw', 'openclaw.json');

    // Read OpenClaw configuration
    let config: OpenClawConfig = {};
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(configContent);
    } catch (error) {
      console.error('Error reading OpenClaw config:', error);
    }

    // Determine provider and plan information
    const provider = getProviderInfo(config);
    const plan = getPlanInfo(config);

    // Calculate actual usage from sessions
    const usage = await calculateSessionUsage();

    // Calculate quota based on provider
    const quota = calculateQuota(provider, usage);

    return NextResponse.json({
      quota,
      plan,
      provider: provider.name,
    });
  } catch (error) {
    console.error('Error in subscription API:', error);
    return NextResponse.json({
      quota: {
        limit: 0,
        used: 0,
        remaining: 0,
        window: 'Unknown',
        resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      plan: {
        name: 'Unknown',
        tier: 'unknown',
      },
      provider: 'Unknown',
    }, { status: 500 });
  }
}

function getProviderInfo(config: OpenClawConfig): { name: string; type: string } {
  const providers = config.models?.providers || {};
  const providerKeys = Object.keys(providers);

  if (providerKeys.length === 0) {
    return { name: 'None', type: 'none' };
  }

  // Get the first provider (usually the default)
  const firstProvider = providerKeys[0];

  // Map provider IDs to readable names
  const providerNames: Record<string, string> = {
    'zai': 'Zhipu AI (智谱)',
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'codex': 'Codex',
  };

  return {
    name: providerNames[firstProvider] || firstProvider,
    type: firstProvider,
  };
}

function getPlanInfo(config: OpenClawConfig): { name: string; tier: string } {
  const providers = config.models?.providers || {};
  const providerKeys = Object.keys(providers);

  if (providerKeys.length === 0) {
    return { name: 'No Provider', tier: 'none' };
  }

  const firstProvider = providerKeys[0];
  const providerConfig = providers[firstProvider];

  // Check if all models have zero cost (free tier)
  const models = providerConfig.models || [];
  const allFree = models.every(model =>
    !model.cost ||
    (model.cost.input === 0 && model.cost.output === 0)
  );

  if (allFree) {
    return {
      name: `${firstProvider.toUpperCase()} Free Tier`,
      tier: 'free',
    };
  }

  // Check for paid tiers based on cost structure
  const hasCost = models.some(model => model.cost && (model.cost.input > 0 || model.cost.output > 0));

  if (hasCost) {
    return {
      name: `${firstProvider.toUpperCase()} Paid`,
      tier: 'paid',
    };
  }

  return {
    name: 'Unknown Plan',
    tier: 'unknown',
  };
}

async function calculateSessionUsage(): Promise<SessionUsage> {
  const usage: SessionUsage = {
    totalTokens: 0,
    totalCost: 0,
    messageCount: 0,
  };

  const homeDir = process.env.HOME || '';
  const agentsPath = path.join(homeDir, '.openclaw', 'agents');

  try {
    const agentDirs = await fs.readdir(agentsPath);

    for (const agentId of agentDirs) {
      if (agentId.startsWith('.')) continue;

      const sessionsJsonPath = path.join(agentsPath, agentId, 'sessions', 'sessions.json');

      try {
        const sessionsContent = await fs.readFile(sessionsJsonPath, 'utf-8');
        const sessions: Record<string, { sessionFile?: string }> = JSON.parse(sessionsContent);

        // Process each session
        for (const session of Object.values(sessions)) {
          if (!session.sessionFile) continue;

          try {
            const sessionContent = await fs.readFile(session.sessionFile, 'utf-8');
            const lines = sessionContent.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const message = JSON.parse(line) as Record<string, unknown>;

                // Only process assistant messages with usage data
                const messageData = message.message as Record<string, unknown> | undefined;
                if (messageData?.role === 'assistant' && messageData.usage) {
                  const tokenUsage = messageData.usage as Record<string, unknown>;
                  usage.totalTokens += (tokenUsage.totalTokens as number) || 0;
                  const cost = tokenUsage.cost as Record<string, unknown> | undefined;
                  usage.totalCost += (cost?.total as number) || 0;
                  usage.messageCount++;
                }
              } catch {
                // Skip invalid JSON
                continue;
              }
            }
          } catch {
            // Skip files that can't be read
            continue;
          }
        }
      } catch {
        // Skip agents with no sessions
        continue;
      }
    }
  } catch (error) {
    console.error('Error calculating session usage:', error);
  }

  return usage;
}

function calculateQuota(
  provider: { name: string; type: string },
  usage: SessionUsage
): {
  limit: number;
  used: number;
  remaining: number;
  window: string;
  resetAt: string;
} {
  // For free providers like zai, set a reasonable "limit" for display purposes
  // Since actual costs are zero, we show token counts instead of monetary limits

  let limit = 10000000; // Default 10M tokens for free tier
  let window = 'Month';

  // Adjust limits based on provider
  if (provider.type === 'zai') {
    limit = 50000000; // 50M tokens for zai free tier
    window = 'Month';
  } else if (provider.type === 'openai') {
    limit = 1000000; // 1M tokens for OpenAI free tier
    window = 'Month';
  } else if (provider.type === 'anthropic') {
    limit = 500000; // 500K tokens for Anthropic free tier
    window = 'Month';
  }

  const used = usage.totalTokens;
  const remaining = Math.max(0, limit - used);

  // Calculate reset date (start of next month)
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    limit,
    used,
    remaining,
    window,
    resetAt: resetDate.toISOString(),
  };
}
