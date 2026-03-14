import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface OpenClawConfig {
  models?: {
    mode?: string;
    providers?: Record<string, {
      baseUrl?: string;
      api?: string;
      models?: Array<{
        id: string;
        name: string;
        reasoning?: boolean;
        cost?: {
          input: number;
          output: number;
        };
        contextWindow?: number;
        maxTokens?: number;
      }>;
    }>;
  };
  agents?: {
    defaults?: {
      model?: {
        primary?: string;
        fallbacks?: string[];
      };
      models?: Record<string, {
        alias?: string;
      }>;
    };
  };
  auth?: {
    profiles?: Record<string, {
      provider: string;
      mode: string;
    }>;
    order?: Record<string, string[]>;
    cooldowns?: {
      billingBackoffHours?: number;
      billingMaxHours?: number;
      failureWindowHours?: number;
    };
  };
}

interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  models: Array<{
    id: string;
    name: string;
    reasoning: boolean;
    cost: { input: number; output: number };
    contextWindow: number;
    maxTokens: number;
  }>;
  isPrimary: boolean;
  isFallback: boolean;
  authProfile: string;
}

interface ModelDisasterConfig {
  primaryModel: string;
  fallbackModels: string[];
  providers: ProviderConfig[];
  cooldownConfig: {
    billingBackoffHours: number;
    billingMaxHours: number;
    failureWindowHours: number;
  };
  configPath: string;
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
      return NextResponse.json({
        error: 'Failed to read OpenClaw configuration',
        configPath,
      }, { status: 500 });
    }

    // Extract model disaster recovery configuration
    const primaryModel = config.agents?.defaults?.model?.primary || 'unknown';
    const fallbackModels = config.agents?.defaults?.model?.fallbacks || [];

    // Build provider configurations
    const providers: ProviderConfig[] = [];
    const providersData = config.models?.providers || {};

    for (const [providerId, providerData] of Object.entries(providersData)) {
      const isPrimary = primaryModel.startsWith(providerId);
      const isFallback = fallbackModels.some(f => f.startsWith(providerId));

      // Find auth profile for this provider
      let authProfile = 'default';
      if (config.auth?.profiles) {
        for (const [profileId, profileData] of Object.entries(config.auth.profiles)) {
          if (profileData.provider === providerId) {
            authProfile = profileId;
            break;
          }
        }
      }

      providers.push({
        id: providerId,
        name: getProviderDisplayName(providerId),
        baseUrl: providerData.baseUrl || '',
        models: (providerData.models || []).map(model => ({
          id: model.id,
          name: model.name,
          reasoning: model.reasoning || false,
          cost: {
            input: model.cost?.input || 0,
            output: model.cost?.output || 0,
          },
          contextWindow: model.contextWindow || 0,
          maxTokens: model.maxTokens || 0,
        })),
        isPrimary,
        isFallback,
        authProfile,
      });
    }

    // Sort providers: primary first, then fallbacks, then others
    providers.sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      if (a.isFallback && !b.isFallback) return -1;
      if (!a.isFallback && b.isFallback) return 1;
      return a.id.localeCompare(b.id);
    });

    const cooldownConfig = config.auth?.cooldowns || {
      billingBackoffHours: 5,
      billingMaxHours: 24,
      failureWindowHours: 24,
    };

    return NextResponse.json({
      primaryModel,
      fallbackModels,
      providers,
      cooldownConfig,
      configPath,
    } as ModelDisasterConfig);
  } catch (error) {
    console.error('Error in models API:', error);
    return NextResponse.json({
      error: 'Failed to load model configuration',
    }, { status: 500 });
  }
}

function getProviderDisplayName(providerId: string): string {
  const names: Record<string, string> = {
    'zai': 'Zhipu AI (智谱)',
    'dashscope': 'Aliyun DashScope (百炼)',
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'codex': 'Codex',
  };
  return names[providerId] || providerId;
}
