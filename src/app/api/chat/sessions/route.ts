import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const OPENCLAW_PATH = path.join(process.env.HOME || '', '.openclaw');
const SESSIONS_PATH = path.join(OPENCLAW_PATH, 'agents', 'main', 'sessions');

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'toolResult';
  content: string;
  timestamp: string;
  tokens?: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    total: number;
  };
  type?: string;
  thinking?: string;
}

interface ChatSession {
  id: string;
  filename: string;
  messageCount: number;
  firstMessage: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all chat sessions from JSONL files
 */
export async function GET() {
  try {
    const sessions: ChatSession[] = [];

    // Read all .jsonl files (excluding reset backups)
    const files = await fs.readdir(SESSIONS_PATH);
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl') && !f.includes('.reset.'));

    for (const file of jsonlFiles) {
      const filePath = path.join(SESSIONS_PATH, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.trim().split('\n');

      const messages: ChatMessage[] = [];
      let firstTimestamp = '';
      let lastTimestamp = '';
      let firstContent = '';
      let lastContent = '';

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);

          // Extract message type
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

            if (messageContent || thinkingContent) {
              const chatMsg: ChatMessage = {
                id: parsed.id || '',
                role: msg.role || 'assistant',
                content: messageContent || thinkingContent,
                timestamp: parsed.timestamp || msg.timestamp || new Date().toISOString(),
                tokens: msg.usage ? {
                  input: msg.usage.input || 0,
                  output: msg.usage.output || 0,
                  cacheRead: msg.usage.cacheRead || 0,
                  cacheWrite: msg.usage.cacheWrite || 0,
                  total: msg.usage.totalTokens || (msg.usage.input || 0) + (msg.usage.output || 0),
                } : undefined,
                thinking: thinkingContent,
              };

              messages.push(chatMsg);

              // Track timestamps
              if (!firstTimestamp || parsed.timestamp < firstTimestamp) {
                firstTimestamp = parsed.timestamp;
                firstContent = messageContent || thinkingContent;
              }
              if (!lastTimestamp || parsed.timestamp > lastTimestamp) {
                lastTimestamp = parsed.timestamp;
                lastContent = messageContent || thinkingContent;
              }
            }
          }
        } catch {
          continue;
        }
      }

      if (messages.length > 0) {
        const sessionId = file.replace('.jsonl', '');
        sessions.push({
          id: sessionId,
          filename: file,
          messageCount: messages.length,
          firstMessage: firstContent.substring(0, 100),
          lastMessage: lastContent.substring(0, 100),
          createdAt: firstTimestamp,
          updatedAt: lastTimestamp,
        });
      }
    }

    // Sort by updatedAt descending
    sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error reading chat sessions:', error);
    return NextResponse.json([], { status: 500 });
  }
}
