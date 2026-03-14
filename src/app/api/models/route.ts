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
  suggestedFallbacks: {
    current: string[];
    recommended: string[];
    reason: string;
  };
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

    // Generate suggested fallback chain
    const suggestedFallbacks = generateSuggestedFallbacks(config, primaryModel, fallbackModels);

    return NextResponse.json({
      primaryModel,
      fallbackModels,
      suggestedFallbacks,
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

function generateSuggestedFallbacks(
  config: OpenClawConfig,
  primaryModel: string,
  currentFallbacks: string[]
): { current: string[]; recommended: string[]; reason: string } {
  const [primaryProvider, primaryModelId] = primaryModel.split('/');
  const recommended: string[] = [];

  // Get all models from primary provider (excluding primary model itself)
  const primaryProviderModels = config.models?.providers?.[primaryProvider]?.models || [];

  // Sort by capability (higher models first)
  const modelPriority = ['glm-5', 'glm-4.7', 'glm-4.7-flash', 'glm-4.7-flashx', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'];

  // Add same-provider fallbacks (in priority order, excluding primary)
  const sameProviderFallbacks = primaryProviderModels
    .filter(m => m.id !== primaryModelId)
    .sort((a, b) => {
      const aIndex = modelPriority.indexOf(a.id);
      const bIndex = modelPriority.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return a.id.localeCompare(b.id);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .map(m => `${primaryProvider}/${m.id}`);

  recommended.push(...sameProviderFallbacks);

  // Add cross-provider fallbacks
  recommended.push(...currentFallbacks);

  // Generate reason
  let reason = '';
  if (sameProviderFallbacks.length > 0 && currentFallbacks.length > 0) {
    reason = `Recommended: Try ${sameProviderFallbacks.length} lower-tier models from ${primaryProvider} provider first, then cross-provider fallback to ${currentFallbacks[0].split('/')[0]}`;
  } else if (currentFallbacks.length === 0) {
    reason = 'No fallback models configured. Consider adding same-provider or cross-provider fallbacks for redundancy.';
  } else {
    reason = `Current configuration uses direct cross-provider fallback. Consider adding same-provider fallbacks first for better performance.`;
  }

  return {
    current: currentFallbacks,
    recommended,
    reason,
  };
}
