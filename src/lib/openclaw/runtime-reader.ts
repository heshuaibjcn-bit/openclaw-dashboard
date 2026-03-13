/**
 * Runtime file reader for OpenClaw control-center runtime files
 * Reads from OPENCLAW_HOME/runtime/ directory
 */

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// For browser, use mock/runtime data

// Runtime file types
export interface RuntimeProject {
  projectId: string;
  title: string;
  status: 'active' | 'archived' | 'on-hold';
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuntimeTask {
  taskId: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  projectId?: string;
  owner?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
}

export interface RuntimeBudget {
  budgetId: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  period: 'daily' | 'weekly' | 'monthly';
  currency?: string;
}

export interface AckItem {
  id: string;
  type: 'exception' | 'approval' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source?: string;
}

export interface ApprovalAction {
  approvalId: string;
  type: 'approve' | 'reject';
  targetId: string;
  targetTitle: string;
  reason?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TimelineEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface DigestEntry {
  date: string;
  summary: string;
  highlights: string[];
  metrics: {
    totalSessions: number;
    totalTokens: number;
    totalCost: number;
    completedTasks: number;
  };
}

/**
 * Safely read and parse a JSON file
 */
function readJSONFile<T>(filePath: string): T | null {
  // In browser mode, return null
  if (isBrowser) {
    return null;
  }

  // TODO: Implement server-side file reading
  return null;
}

/**
 * Read projects from runtime/projects.json
 */
export function readProjects(): RuntimeProject[] {
  const filePath = path.join(RUNTIME_DIR, 'projects.json');
  const data = readJSONFile<{ projects?: RuntimeProject[] }>(filePath);
  return data?.projects || [];
}

/**
 * Read tasks from runtime/tasks.json
 */
export function readTasks(): RuntimeTask[] {
  const filePath = path.join(RUNTIME_DIR, 'tasks.json');
  const data = readJSONFile<{ tasks?: RuntimeTask[] }>(filePath);
  return data?.tasks || [];
}

/**
 * Read budgets from runtime/budgets.json
 */
export function readBudgets(): RuntimeBudget[] {
  const filePath = path.join(RUNTIME_DIR, 'budgets.json');
  const data = readJSONFile<{ budgets?: RuntimeBudget[] }>(filePath);
  return data?.budgets || [];
}

/**
 * Read acknowledgements from runtime/acks.json
 */
export function readAcks(): AckItem[] {
  const filePath = path.join(RUNTIME_DIR, 'acks.json');
  const data = readJSONFile<{ acks?: AckItem[] }>(filePath);
  return data?.acks || [];
}

/**
 * Read pending (unacknowledged) items
 */
export function readPendingAcks(): AckItem[] {
  return readAcks().filter(ack => !ack.acknowledged);
}

/**
 * Read approval actions log from runtime/approval-actions.log
 */
export function readApprovalActions(): ApprovalAction[] {
  const filePath = path.join(RUNTIME_DIR, 'approval-actions.log');
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    return lines
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line) as ApprovalAction;
        } catch {
          return null;
        }
      })
      .filter((item): item is ApprovalAction => item !== null);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

/**
 * Read pending approval actions
 */
export function readPendingApprovals(): ApprovalAction[] {
  return readApprovalActions().filter(action => action.status === 'pending');
}

/**
 * Get runtime directory status
 */
export function getRuntimeStatus(): {
  available: boolean;
  path: string;
  files: {
    projects: boolean;
    tasks: boolean;
    budgets: boolean;
    acks: boolean;
    snapshot: boolean;
    timeline: boolean;
  };
} {
  return {
    available: false, // Browser mode
    path: "~/.openclaw/runtime",
    files: {
      projects: false,
      tasks: false,
      budgets: false,
      acks: false,
      snapshot: false,
      timeline: false,
    },
  };
}

/**
 * Read operation audit log from runtime/operation-audit.log
 */
export function readOperationAudit(limit = 100): TimelineEntry[] {
  const filePath = path.join(RUNTIME_DIR, 'operation-audit.log');
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const entries = lines
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line) as TimelineEntry;
        } catch {
          return null;
        }
      })
      .filter((item): item is TimelineEntry => item !== null);
    return entries.reverse().slice(0, limit);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

/**
 * Read latest digest from runtime/digests/
 */
export function readLatestDigest(): DigestEntry | null {
  const digestsDir = path.join(RUNTIME_DIR, 'digests');
  try {
    if (!fs.existsSync(digestsDir)) {
      return null;
    }
    const files = fs.readdirSync(digestsDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    if (files.length === 0) {
      return null;
    }
    const latestFile = path.join(digestsDir, files[0]);
    return readJSONFile<DigestEntry>(latestFile);
  } catch (error) {
    console.error(`Error reading digest:`, error);
    return null;
  }
}

/**
 * Read snapshot from runtime/last-snapshot.json
 */
export interface Snapshot {
  timestamp: string;
  sessions: unknown[];
  agents: unknown[];
  systemHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    version: string;
  };
  metrics: {
    totalSessions: number;
    activeSessions: number;
    totalTokens: number;
    totalCost: number;
  };
}

export function readSnapshot(): Snapshot | null {
  const filePath = path.join(RUNTIME_DIR, 'last-snapshot.json');
  return readJSONFile<Snapshot>(filePath);
}

/**
 * Read timeline log from runtime/timeline.log
 */
export function readTimeline(limit = 100): TimelineEntry[] {
  // In browser mode, return mock data
  if (isBrowser) {
    return [];
  }

  // TODO: Implement server-side file reading
  return [];
}

/**
 * Filter tasks by status
 */
export function filterTasksByStatus(tasks: RuntimeTask[], status: RuntimeTask['status']): RuntimeTask[] {
  return tasks.filter(task => task.status === status);
}

/**
 * Filter tasks by project
 */
export function filterTasksByProject(tasks: RuntimeTask[], projectId: string): RuntimeTask[] {
  return tasks.filter(task => task.projectId === projectId);
}

/**
 * Filter tasks by owner
 */
export function filterTasksByOwner(tasks: RuntimeTask[], owner: string): RuntimeTask[] {
  return tasks.filter(task => task.owner === owner);
}

/**
 * Search tasks by title or tags
 */
export function searchTasks(tasks: RuntimeTask[], query: string): RuntimeTask[] {
  const lowerQuery = query.toLowerCase();
  return tasks.filter(task =>
    task.title.toLowerCase().includes(lowerQuery) ||
    task.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
