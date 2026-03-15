import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface SessionData {
  sessionId?: string;
  chatType?: string;
  abortedLastRun?: boolean;
  lastChannel?: string;
  deliveryContext?: { channel?: string };
  origin?: { label?: string; provider?: string } | string;
  updatedAt?: string | number | null;
  createdAt?: string | number | null;
  systemSent?: boolean;
  compactionCount?: number;
  sessionFile?: string;
  skillsSnapshot?: { prompt?: string };
  hasSkills?: boolean;
  messageCount?: number;
}

export async function GET() {
  try {
    const sessionsPath = path.join(process.env.HOME || '', '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');

    const content = await fs.readFile(sessionsPath, 'utf-8');
    const sessionsData: Record<string, SessionData> = JSON.parse(content);

    // Convert sessions object to array and enrich with metadata
    const sessionsArray = Object.entries(sessionsData).map(([sessionKey, session]: [string, SessionData]) => {
      // Parse session key (format: "agent:main:main" or just session ID)
      const keyParts = sessionKey.split(':');
      const agentId = keyParts.length > 2 ? keyParts[1] : 'main';
      const sessionId = session.sessionId || sessionKey;

      return {
        id: sessionId,
        sessionKey: sessionKey,
        agentId,
        chatType: session.chatType || 'unknown',
        status: session.abortedLastRun ? 'aborted' : 'active',
        lastChannel: session.lastChannel || session.deliveryContext?.channel || 'unknown',
        origin: typeof session.origin === 'string' ? session.origin : (session.origin?.label || session.origin?.provider || 'unknown'),
        updatedAt: session.updatedAt ? new Date(session.updatedAt).toISOString() : null,
        createdAt: session.createdAt ? new Date(session.createdAt).toISOString() : null,
        systemSent: session.systemSent || false,
        compactionCount: session.compactionCount || 0,
        sessionFile: session.sessionFile,
        hasSkills: !!(session.skillsSnapshot && session.skillsSnapshot.prompt),
        messageCount: 0, // Would need to parse session file to get actual count
      };
    });

    // Sort by updatedAt descending
    sessionsArray.sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json(sessionsArray);
  } catch (error) {
    console.error('Error reading sessions:', error);
    return NextResponse.json([], { status: 500 });
  }
}
