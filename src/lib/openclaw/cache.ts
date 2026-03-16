// Simple in-memory cache for API responses
// This helps with instant page navigation by showing cached data immediately

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DataCache {
  private cache = new Map<string, unknown>();
  private defaultTTL = 5000; // 5 seconds default TTL

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key) as CacheEntry<unknown> | undefined;
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Invalidate cache by pattern
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const apiCache = new DataCache();

// Cache keys for different endpoints
export const CacheKeys = {
  GATEWAY_HEALTH: 'gateway_health',
  AGENTS: 'agents',
  SESSIONS: 'sessions',
  CHANNELS: 'channels',
  LOGS: 'logs',
  RUNTIME_DATA: 'runtime_data',
  SKILLS: 'skills',
  TASKS: 'tasks',
  USAGE: 'usage',
  SUBSCRIPTION: 'subscription',
  DOCUMENTS: 'documents',
  APPROVALS: 'approvals',
} as const;
