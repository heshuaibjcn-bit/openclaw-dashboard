/**
 * Subscription reader for OpenClaw usage and cost tracking
 * Reads from CODEX_HOME or OPENCLAW_SUBSCRIPTION_SNAPSHOT_PATH
 */

import fs from 'fs';
import path from 'os';
import { homedir } from 'os';

// Subscription file paths
const DEFAULT_CODEX_HOME = path.join(homedir(), '.codex');
const CODEX_HOME = process.env.CODEX_HOME || DEFAULT_CODEX_HOME;
const SUBSCRIPTION_PATH = process.env.OPENCLAW_SUBSCRIPTION_SNAPSHOT_PATH ||
  path.join(CODEX_HOME, 'subscription.json');

// Subscription types
export interface SubscriptionSnapshot {
  timestamp: string;
  provider: 'codex' | 'openai' | 'anthropic' | 'custom';
  quota: {
    window: string; // e.g., "5h", "Week", "Month"
    limit: number;
    used: number;
    remaining: number;
    resetAt: string;
  };
  usage: {
    today: number;
    last7days: number;
    last30days: number;
    currentMonth: number;
  };
  cost?: {
    today: number;
    last7days: number;
    last30days: number;
    currentMonth: number;
    currency?: string;
  };
  attribution?: Array<{
    taskId?: string;
    agentId?: string;
    projectId?: string;
    tokens: number;
    cost?: number;
    percentage: number;
  }>;
}

export interface UsageCostSnapshot {
  timestamp: string;
  connected: boolean;
  subscription?: SubscriptionSnapshot;
  errors?: string[];
}

/**
 * Get subscription status
 */
export function getSubscriptionStatus(): {
  available: boolean;
  path: string;
  provider: string;
  quotaStatus: 'unknown' | 'healthy' | 'warning' | 'critical';
} {
  if (isBrowser) {
    return {
      available: false,
      path: "~/.codex/subscription.json",
      provider: "unknown",
      quotaStatus: "unknown",
    };
  }

  return {
    available: false,
    path: "~/.codex/subscription.json",
    provider: "unknown",
    quotaStatus: "unknown",
  };
}

/**
 * Get usage/cost snapshot for the dashboard
 */
export function getUsageCostSnapshot(): UsageCostSnapshot {
  const subscription = readSubscriptionSnapshot();
  const errors: string[] = [];

  if (!subscription) {
    // Check if it's because file doesn't exist or parse error
    if (!fs.existsSync(SUBSCRIPTION_PATH)) {
      errors.push('Subscription file not found');
    } else {
      errors.push('Failed to parse subscription file');
    }
  }

  return {
    timestamp: new Date().toISOString(),
    connected: subscription !== null,
    subscription: subscription || undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Calculate burn rate (tokens per day)
 */
export function calculateBurnRate(subscription: SubscriptionSnapshot): number {
  const { usage } = subscription;
  // Use last 7 days to calculate daily average
  return usage.last7days / 7;
}

/**
 * Calculate cost burn rate (cost per day)
 */
export function calculateCostBurnRate(subscription: SubscriptionSnapshot): number {
  if (!subscription.cost) {
    return 0;
  }
  const { cost } = subscription;
  return cost.last7days / 7;
}

/**
 * Estimate days until quota reset
 */
export function estimateDaysUntilReset(subscription: SubscriptionSnapshot): number {
  const resetDate = new Date(subscription.quota.resetAt);
  const now = new Date();
  const diffTime = resetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Check if quota is at risk (less than 20% remaining)
 */
export function isQuotaAtRisk(subscription: SubscriptionSnapshot): boolean {
  const percentage = (subscription.quota.remaining / subscription.quota.limit) * 100;
  return percentage < 20;
}

/**
 * Check if quota is critical (less than 5% remaining)
 */
export function isQuotaCritical(subscription: SubscriptionSnapshot): boolean {
  const percentage = (subscription.quota.remaining / subscription.quota.limit) * 100;
  return percentage < 5;
}

/**
 * Get quota status
 */
export function getQuotaStatus(subscription: SubscriptionSnapshot): 'healthy' | 'warning' | 'critical' {
  if (isQuotaCritical(subscription)) {
    return 'critical';
  }
  if (isQuotaAtRisk(subscription)) {
    return 'warning';
  }
  return 'healthy';
}

/**
 * Format quota window label
 */
export function formatQuotaWindow(window: string): string {
  // Normalize window labels
  const normalized = window.toLowerCase();
  if (normalized.includes('h') || normalized.includes('hour')) {
    return window; // Keep "5h" format
  }
  if (normalized.includes('d') || normalized.includes('day')) {
    return 'Daily';
  }
  if (normalized.includes('w') || normalized.includes('week')) {
    return 'Week';
  }
  if (normalized.includes('m') || normalized.includes('month')) {
    return 'Month';
  }
  return window;
}

/**
 * Read subscription snapshot from file
 */
export function readSubscriptionSnapshot(): SubscriptionSnapshot | null {
  // In browser mode, return mock data
  if (isBrowser) {
    return null;
  }

  // TODO: Implement server-side file reading
  return null;
}

/**
 * Calculate token attribution by task
 */
export function getAttributionByTask(subscription: SubscriptionSnapshot): Array<{
  taskId: string;
  tokens: number;
  cost?: number;
  percentage: number;
}> {
  if (!subscription.attribution) {
    return [];
  }

  const attributionByTask = new Map<string, { tokens: number; cost?: number }>();

  subscription.attribution.forEach(item => {
    if (item.taskId) {
      const existing = attributionByTask.get(item.taskId) || { tokens: 0, cost: 0 };
      existing.tokens += item.tokens;
      if (item.cost) {
        existing.cost = (existing.cost || 0) + item.cost;
      }
      attributionByTask.set(item.taskId, existing);
    }
  });

  const totalTokens = subscription.usage.last7days;

  return Array.from(attributionByTask.entries())
    .map(([taskId, data]) => ({
      taskId,
      tokens: data.tokens,
      cost: data.cost,
      percentage: totalTokens > 0 ? (data.tokens / totalTokens) * 100 : 0,
    }))
    .sort((a, b) => b.tokens - a.tokens);
}

/**
 * Calculate token attribution by agent
 */
export function getAttributionByAgent(subscription: SubscriptionSnapshot): Array<{
  agentId: string;
  tokens: number;
  cost?: number;
  percentage: number;
}> {
  if (!subscription.attribution) {
    return [];
  }

  const attributionByAgent = new Map<string, { tokens: number; cost?: number }>();

  subscription.attribution.forEach(item => {
    if (item.agentId) {
      const existing = attributionByAgent.get(item.agentId) || { tokens: 0, cost: 0 };
      existing.tokens += item.tokens;
      if (item.cost) {
        existing.cost = (existing.cost || 0) + item.cost;
      }
      attributionByAgent.set(item.agentId, existing);
    }
  });

  const totalTokens = subscription.usage.last7days;

  return Array.from(attributionByAgent.entries())
    .map(([agentId, data]) => ({
      agentId,
      tokens: data.tokens,
      cost: data.cost,
      percentage: totalTokens > 0 ? (data.tokens / totalTokens) * 100 : 0,
    }))
    .sort((a, b) => b.tokens - a.tokens);
}

/**
 * Calculate token attribution by project
 */
export function getAttributionByProject(subscription: SubscriptionSnapshot): Array<{
  projectId: string;
  tokens: number;
  cost?: number;
  percentage: number;
}> {
  if (!subscription.attribution) {
    return [];
  }

  const attributionByProject = new Map<string, { tokens: number; cost?: number }>();

  subscription.attribution.forEach(item => {
    if (item.projectId) {
      const existing = attributionByProject.get(item.projectId) || { tokens: 0, cost: 0 };
      existing.tokens += item.tokens;
      if (item.cost) {
        existing.cost = (existing.cost || 0) + item.cost;
      }
      attributionByProject.set(item.projectId, existing);
    }
  });

  const totalTokens = subscription.usage.last7days;

  return Array.from(attributionByProject.entries())
    .map(([projectId, data]) => ({
      projectId,
      tokens: data.tokens,
      cost: data.cost,
      percentage: totalTokens > 0 ? (data.tokens / totalTokens) * 100 : 0,
    }))
    .sort((a, b) => b.tokens - a.tokens);
}
