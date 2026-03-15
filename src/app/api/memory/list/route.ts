import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const OPENCLAW_PATH = path.join(process.env.HOME || '', '.openclaw');

interface SessionMessage {
  type: string;
  id?: string;
  parentId?: string | null;
  timestamp?: string;
  message?: {
    role: string;
    content: Array<{
      type: string;
      text?: string;
      thinking?: string;
    }>;
    usage?: {
      input: number;
      output: number;
      cacheRead: number;
      cacheWrite: number;
    };
  };
}

interface MemoryEntry {
  id: string;
  content: string;
  metadata: {
    type: string;
    importance: string;
    agent: string;
    sessionId?: string;
    timestamp?: string;
    role?: string;
    messageCount?: number;
  };
  createdAt: Date;
  score?: number;
}

/**
 * Extract memory entries from OpenClaw session files
 * This reads the JSONL session files and extracts meaningful content
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sessionsPath = path.join(OPENCLAW_PATH, 'agents', 'main', 'sessions');
    const memories: MemoryEntry[] = [];

    try {
      // Read all session files
      const sessionFiles = await fs.readdir(sessionsPath);

      for (const file of sessionFiles) {
        if (file.endsWith('.jsonl') && !file.includes('.reset.')) {
          const filePath = path.join(sessionsPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.trim().split('\n');

          const sessionEntries = await extractMemoriesFromSession(
            file.replace('.jsonl', ''),
            lines
          );
          memories.push(...sessionEntries);
        }
      }
    } catch (error) {
      console.warn('Failed to read sessions:', error);
    }

    // Sort by creation date (newest first)
    memories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const paginatedMemories = memories.slice(offset, offset + limit);

    return NextResponse.json({
      memories: paginatedMemories,
      total: memories.length,
      hasMore: offset + limit < memories.length,
    });
  } catch (error) {
    console.error('Memory list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory entries', memories: [], total: 0 },
      { status: 500 }
    );
  }
}

/**
 * Extract memory entries from a session's JSONL content
 */
async function extractMemoriesFromSession(
  sessionId: string,
  lines: string[]
): Promise<MemoryEntry[]> {
  const memories: MemoryEntry[] = [];
  const messages: SessionMessage[] = [];

  // Parse all lines
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as SessionMessage;
      if (parsed.type === 'message' && parsed.message) {
        messages.push(parsed);
      }
    } catch {
      continue;
    }
  }

  let messageCount = 0;

  // Extract memories from messages
  for (const msg of messages) {
    if (!msg.message || !msg.message.content) continue;

    messageCount++;

    for (const contentBlock of msg.message.content) {
      if (contentBlock.type === 'text' && contentBlock.text) {
        const text = contentBlock.text;

        // Extract different types of memories based on content patterns
        const extractedMemories = extractMemoriesFromText(
          text,
          sessionId,
          msg.message?.role || 'unknown',
          msg.timestamp || new Date().toISOString()
        );

        memories.push(...extractedMemories);
      } else if (contentBlock.type === 'thinking' && contentBlock.thinking) {
        // Extract thinking as agent memory
        if (contentBlock.thinking.length > 50) {
          memories.push({
            id: `thinking-${msg.id || Math.random().toString(36).substring(7)}`,
            content: contentBlock.thinking.substring(0, 500) + '...',
            metadata: {
              type: 'agent',
              importance: 'medium',
              agent: 'main',
              sessionId,
              timestamp: msg.timestamp,
              role: 'assistant',
            },
            createdAt: new Date(msg.timestamp || Date.now()),
            score: 0.7,
          });
        }
      }
    }
  }

  // Add session summary as a memory
  if (messageCount > 0) {
    memories.push({
      id: `session-${sessionId}`,
      content: `Session with ${messageCount} messages exchanged`,
      metadata: {
        type: 'configuration',
        importance: 'low',
        agent: 'main',
        sessionId,
        messageCount,
      },
      createdAt: new Date(),
      score: 0.5,
    });
  }

  return memories;
}

/**
 * Extract memory entries from text content based on patterns
 */
function extractMemoriesFromText(
  text: string,
  sessionId: string,
  role: string,
  timestamp: string
): MemoryEntry[] {
  const memories: MemoryEntry[] = [];

  // Pattern 1: User preferences (preferences, settings, config)
  const preferencePatterns = [
    /(?:prefer|like|want|use|设置|偏好|喜欢).{0,100}(?:dark|light|theme|mode|style)/i,
    /(?:config|setting|配置).{0,200}/i,
  ];

  for (const pattern of preferencePatterns) {
    const match = text.match(pattern);
    if (match) {
      memories.push({
        id: `pref-${sessionId}-${Math.random().toString(36).substring(7)}`,
        content: match[0],
        metadata: {
          type: 'preference',
          importance: 'high',
          agent: 'main',
          sessionId,
          timestamp,
          role,
        },
        createdAt: new Date(timestamp),
        score: 0.9,
      });
    }
  }

  // Pattern 2: Project context (project, next.js, dashboard, etc.)
  const projectPatterns = [
    /(?:project|项目).{0,300}(?:next\.?js|react|typescript|tailwind)/i,
    /(?:building|developing|开发).{0,300}(?:dashboard|app|website)/i,
  ];

  for (const pattern of projectPatterns) {
    const match = text.match(pattern);
    if (match && match[0].length > 20) {
      memories.push({
        id: `project-${sessionId}-${Math.random().toString(36).substring(7)}`,
        content: match[0],
        metadata: {
          type: 'project',
          importance: 'high',
          agent: 'main',
          sessionId,
          timestamp,
          role,
        },
        createdAt: new Date(timestamp),
        score: 0.85,
      });
    }
  }

  // Pattern 3: Agent information (agent, model, capability)
  const agentPatterns = [
    /(?:agent|模型|model).{0,200}(?:specialize|expert|capability|擅长|专长)/i,
    /(?:i am|我是).{0,200}(?:assistant|ai|agent)/i,
  ];

  for (const pattern of agentPatterns) {
    const match = text.match(pattern);
    if (match && match[0].length > 15) {
      memories.push({
        id: `agent-${sessionId}-${Math.random().toString(36).substring(7)}`,
        content: match[0],
        metadata: {
          type: 'agent',
          importance: 'medium',
          agent: 'main',
          sessionId,
          timestamp,
          role,
        },
        createdAt: new Date(timestamp),
        score: 0.8,
      });
    }
  }

  // Pattern 4: Performance/activity data
  const performancePatterns = [
    /(?:processed|handled|处理).{0,100}(?:\d+).{0,50}(?:tasks|messages|请求)/i,
    /(?:success|completion|完成).{0,100}(?:rate|percentage|率)/i,
  ];

  for (const pattern of performancePatterns) {
    const match = text.match(pattern);
    if (match) {
      memories.push({
        id: `perf-${sessionId}-${Math.random().toString(36).substring(7)}`,
        content: match[0],
        metadata: {
          type: 'performance',
          importance: 'low',
          agent: 'main',
          sessionId,
          timestamp,
          role,
        },
        createdAt: new Date(timestamp),
        score: 0.6,
      });
    }
  }

  // If no specific pattern matched but text is substantial, add as general memory
  if (memories.length === 0 && text.length > 50 && text.length < 500) {
    memories.push({
      id: `general-${sessionId}-${Math.random().toString(36).substring(7)}`,
      content: text.substring(0, 300),
      metadata: {
        type: 'preference',
        importance: 'low',
        agent: 'main',
        sessionId,
        timestamp,
        role,
      },
      createdAt: new Date(timestamp),
      score: 0.5,
    });
  }

  return memories;
}
