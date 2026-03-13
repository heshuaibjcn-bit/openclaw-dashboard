import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const sessionsPath = path.join(process.env.HOME || '', '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');
    const content = await fs.readFile(sessionsPath, 'utf-8');
    const sessions = JSON.parse(content);

    const sessionList = Object.entries(sessions).map(([sessionId, sessionData]: [string, any]) => ({
      id: sessionId,
      agentId: 'main',
      model: sessionData.model || 'unknown',
      createdAt: new Date(sessionData.createdAt || Date.now()).toISOString(),
      lastActivity: new Date(sessionData.updatedAt || Date.now()).toISOString(),
      tokens: {
        input: 0,
        output: 0,
        total: 0,
        max: 1000000,
      },
    }));

    return NextResponse.json(sessionList);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
