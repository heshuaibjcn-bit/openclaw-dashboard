import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SESSIONS_PATH = path.join(process.env.HOME || '', '.openclaw', 'agents', 'main', 'sessions');

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'toolResult';
  content: string;
  thinking?: string;
  timestamp: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  type?: string;
}

/**
 * Get messages for a specific session
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const filename = `${sessionId}.jsonl`;
    const filePath = path.join(SESSIONS_PATH, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n');

    const messages: ChatMessage[] = [];

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);

        // Only process message entries
        if (parsed.type === 'message' && parsed.message) {
          const msg = parsed.message;
          let messageContent = '';
          let thinkingContent = '';

          // Extract content from content array
          if (Array.isArray(msg.content)) {
            for (const item of msg.content) {
              if (item.type === 'text' && item.text) {
                messageContent += item.text;
              } else if (item.type === 'thinking' && item.thinking) {
                thinkingContent = item.thinking;
              }
            }
          }

          // Skip messages with no content
          if (!messageContent && !thinkingContent) {
            continue;
          }

          const chatMsg: ChatMessage = {
            id: parsed.id || '',
            role: msg.role || 'assistant',
            content: messageContent,
            thinking: thinkingContent,
            timestamp: parsed.timestamp || msg.timestamp || new Date().toISOString(),
            tokens: msg.usage ? {
              input: msg.usage.input || 0,
              output: msg.usage.output || 0,
              total: msg.usage.totalTokens || (msg.usage.input || 0) + (msg.usage.output || 0),
            } : undefined,
          };

          messages.push(chatMsg);
        }
      } catch {
        continue;
      }
    }

    // Sort by timestamp ascending (oldest first)
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({
      sessionId,
      messages,
      total: messages.length,
    });
  } catch (error) {
    console.error('Error reading session messages:', error);
    return NextResponse.json(
      { error: 'Failed to read session', messages: [], total: 0 },
      { status: 500 }
    );
  }
}
